import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Rate limiting with a shared backend (Upstash Redis) so limits hold across
// serverless instances. Falls back to an in-memory sliding window when Upstash
// isn't configured (local dev, or before UPSTASH_* env vars are set) — that
// fallback is per-process and best-effort only.

export interface RateLimit {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Max requests allowed within the window. */
  max: number;
}

// Default for public form/submission endpoints.
export const GENERAL_LIMIT: RateLimit = { windowMs: 60_000, max: 5 };

// Stricter limit for authentication routes: 5 attempts per 15 minutes.
export const AUTH_LIMIT: RateLimit = { windowMs: 15 * 60_000, max: 5 };

// Limit for authenticated admin mutations — generous, just an abuse ceiling.
export const ADMIN_ACTION_LIMIT: RateLimit = { windowMs: 60_000, max: 60 };

// ---------------------------------------------------------------------------
// Upstash Redis backend (used when configured)
// ---------------------------------------------------------------------------

let redis: Redis | null | undefined;
function getRedis(): Redis | null {
  if (redis !== undefined) return redis;
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  redis = url && token ? new Redis({ url, token }) : null;
  return redis;
}

// One Ratelimit instance per distinct {windowMs,max} config, cached.
const limiters = new Map<string, Ratelimit>();
function getLimiter(client: Redis, limit: RateLimit): Ratelimit {
  const key = `${limit.windowMs}:${limit.max}`;
  let rl = limiters.get(key);
  if (!rl) {
    const seconds = Math.max(1, Math.round(limit.windowMs / 1000));
    rl = new Ratelimit({
      redis: client,
      limiter: Ratelimit.slidingWindow(limit.max, `${seconds} s`),
      prefix: "sl-rl",
      analytics: false,
    });
    limiters.set(key, rl);
  }
  return rl;
}

// ---------------------------------------------------------------------------
// In-memory fallback
// ---------------------------------------------------------------------------

const MAX_TRACKED_MS = 15 * 60_000;
const hits = new Map<string, number[]>();

function isRateLimitedMemory(key: string, limit: RateLimit): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < limit.windowMs);

  if (recent.length >= limit.max) {
    hits.set(key, recent);
    return true;
  }

  recent.push(now);
  hits.set(key, recent);

  if (hits.size > 10_000) {
    for (const [k, times] of hits) {
      if (times.every((t) => now - t >= MAX_TRACKED_MS)) hits.delete(k);
    }
  }
  return false;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function isRateLimited(
  key: string,
  limit: RateLimit = GENERAL_LIMIT
): Promise<boolean> {
  const client = getRedis();
  if (client) {
    try {
      const { success } = await getLimiter(client, limit).limit(key);
      return !success;
    } catch {
      // If Redis is unreachable, fail open to the in-memory limiter rather than
      // blocking all traffic. (Logged-free: we don't want to leak keys.)
      return isRateLimitedMemory(key, limit);
    }
  }
  return isRateLimitedMemory(key, limit);
}

// Centralized client-IP extraction. Order matters: when traffic flows through
// Cloudflare's proxy (orange cloud), `x-real-ip`/`x-forwarded-for` hold a
// *Cloudflare* egress IP that rotates per request, so we must use
// `cf-connecting-ip` (the true client IP) first or rate-limit buckets scatter.
// Falls back to Vercel's `x-real-ip`, then the first `x-forwarded-for` hop.
export function clientIp(h: { get(name: string): string | null }): string {
  const cf = h.get("cf-connecting-ip")?.trim();
  if (cf) return cf;
  const realIp = h.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  const fwd = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return fwd || "unknown";
}
