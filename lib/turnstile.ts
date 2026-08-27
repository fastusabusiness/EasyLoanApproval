// Server-side Cloudflare Turnstile verification.
//
// Graceful fallback: if TURNSTILE_SECRET_KEY is not set, verification is
// disabled and every call returns true — so the app behaves exactly as before
// until keys are configured. When the secret IS set, a missing or invalid
// token is rejected.

export function turnstileEnabled(): boolean {
  return Boolean(process.env.TURNSTILE_SECRET_KEY);
}

export async function verifyTurnstile(
  token: string | null | undefined,
  ip?: string
): Promise<boolean> {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true; // disabled
  if (!token) return false;

  try {
    const body = new URLSearchParams({ secret, response: token });
    if (ip && ip !== "unknown") body.set("remoteip", ip);

    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      }
    );
    const data = (await res.json()) as { success?: boolean };
    return data.success === true;
  } catch {
    // On a network error talking to Cloudflare, fail closed (reject) so the
    // protection can't be bypassed by inducing an error.
    return false;
  }
}
