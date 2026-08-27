import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Session = "<expiresAtMs>.<hmac>" in an HTTP-only cookie, signed with
// SESSION_SECRET so it can't be forged. Credentials and the secret come from
// env vars (never the repo); if any are missing, auth fails closed.

export const ADMIN_COOKIE = "sl_admin";
const SESSION_MS = 8 * 60 * 60 * 1000; // 8 hours

function sessionSecret(): string {
  return process.env.SESSION_SECRET ?? "";
}

function sign(expiresAt: number): string {
  return createHmac("sha256", sessionSecret())
    .update(`admin.${expiresAt}`)
    .digest("hex");
}

// Hash both sides to a fixed length so timingSafeEqual accepts any input.
function safeEqual(a: string, b: string): boolean {
  const ha = createHash("sha256").update(a).digest();
  const hb = createHash("sha256").update(b).digest();
  return timingSafeEqual(ha, hb);
}

export function checkCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass || !sessionSecret()) return false;
  const userOk = safeEqual(username, expectedUser);
  const passOk = safeEqual(password, expectedPass);
  return userOk && passOk;
}

export function createSessionCookie(): { value: string; maxAge: number } {
  const expiresAt = Date.now() + SESSION_MS;
  return {
    value: `${expiresAt}.${sign(expiresAt)}`,
    maxAge: SESSION_MS / 1000,
  };
}

export async function isAdmin(): Promise<boolean> {
  if (!sessionSecret()) return false;
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  const dot = token.indexOf(".");
  if (dot < 0) return false;
  const expiresAt = Number(token.slice(0, dot));
  const signature = token.slice(dot + 1);
  if (!Number.isFinite(expiresAt) || expiresAt < Date.now()) return false;
  return safeEqual(signature, sign(expiresAt));
}
