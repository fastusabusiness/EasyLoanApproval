import { Resend } from "resend";
import { htmlToText, logEmail, type EmailCategory } from "../email-log";

// One module = one Resend client (lazy, so missing keys don't crash imports).
// Every send() is fire-soft: if RESEND_API_KEY isn't set we log a warning and
// no-op so application submission keeps working. If a send fails we log the
// error name and keep going — the submission has already been saved.

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "Easy Loan Approval <onboarding@resend.dev>";
export const ADMIN_EMAIL = process.env.ADMIN_NOTIFICATION_EMAIL ?? "";

let resend: Resend | null = null;
function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resend) resend = new Resend(key);
  return resend;
}

export async function send(opts: {
  category: EmailCategory;
  to: string;
  subject: string;
  html: string;
  // Inner HTML fragment (no shell chrome) — used both to derive the
  // plain-text alternative part and the log body.
  logHtml: string;
  reply_to?: string;
}) {
  const { category, logHtml, ...emailOpts } = opts;
  const logBody = htmlToText(logHtml);
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping "${opts.subject}" to ${opts.to}`
    );
    await logEmail({
      category,
      to: opts.to,
      from: FROM_EMAIL,
      subject: opts.subject,
      body: logBody,
      status: "skipped",
      error: "RESEND_API_KEY not set",
    });
    return;
  }
  try {
    const res = await c.emails.send({
      from: FROM_EMAIL,
      text: logBody,
      ...emailOpts,
    });
    if (res.error) {
      console.error(
        `[email] send rejected: ${opts.subject} →`,
        res.error.message
      );
      await logEmail({
        category,
        to: opts.to,
        from: FROM_EMAIL,
        subject: opts.subject,
        body: logBody,
        status: "failed",
        error: res.error.message,
      });
      return;
    }
    await logEmail({
      category,
      to: opts.to,
      from: FROM_EMAIL,
      subject: opts.subject,
      body: logBody,
      status: "sent",
    });
  } catch (err) {
    console.error(
      `[email] threw while sending "${opts.subject}":`,
      err instanceof Error ? err.name : "UnknownError"
    );
    await logEmail({
      category,
      to: opts.to,
      from: FROM_EMAIL,
      subject: opts.subject,
      body: logBody,
      status: "failed",
      error: err instanceof Error ? err.message : "Unknown error",
    });
  }
}

// Admin-composed email: sends from a caller-chosen (allowlisted) address as
// plain text. Unlike the transactional helpers it returns a result so the
// admin UI can show success/failure. Still soft on a missing key.
export async function sendCustomEmail(opts: {
  from: string;
  to: string;
  subject: string;
  text: string;
}): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  const c = client();
  if (!c) {
    console.warn(
      `[email] RESEND_API_KEY not set — skipping admin email "${opts.subject}" to ${opts.to}`
    );
    await logEmail({
      category: "custom",
      to: opts.to,
      from: opts.from,
      subject: opts.subject,
      body: opts.text,
      status: "skipped",
      error: "RESEND_API_KEY not set",
    });
    return { ok: false, skipped: true };
  }
  try {
    const res = await c.emails.send({
      from: opts.from,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
    });
    if (res.error) {
      await logEmail({
        category: "custom",
        to: opts.to,
        from: opts.from,
        subject: opts.subject,
        body: opts.text,
        status: "failed",
        error: res.error.message,
      });
      return { ok: false, error: res.error.message };
    }
    await logEmail({
      category: "custom",
      to: opts.to,
      from: opts.from,
      subject: opts.subject,
      body: opts.text,
      status: "sent",
    });
    return { ok: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await logEmail({
      category: "custom",
      to: opts.to,
      from: opts.from,
      subject: opts.subject,
      body: opts.text,
      status: "failed",
      error: message,
    });
    return { ok: false, error: message };
  }
}
