import { prisma } from "./prisma";

// Records of every email the platform attempts to send, for debugging and
// audit purposes. Writing a log entry is always soft: a logging failure must
// never break the send flow (or the application submission that triggered it).

export type EmailCategory =
  | "confirmation"
  | "admin-notice"
  | "careers"
  | "status-update"
  | "verification"
  | "careers-status-update"
  | "careers-verification"
  | "custom";

export type EmailLogStatus = "sent" | "skipped" | "failed";

const MAX_BODY_CHARS = 5000;

// Crude HTML → text for the log view: drop tags, decode the handful of
// entities our templates emit, and collapse runs of whitespace. Good enough
// for a readable record — this is never re-sent, only displayed.
export function htmlToText(html: string): string {
  return html
    .replace(/<\s*(br|\/p|\/h1|\/h2|\/tr)\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&ensp;|&nbsp;/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

export async function logEmail(entry: {
  category: EmailCategory;
  to: string;
  from: string;
  subject: string;
  body: string;
  status: EmailLogStatus;
  error?: string;
}): Promise<void> {
  try {
    await prisma.sentEmail.create({
      data: {
        category: entry.category,
        toAddress: entry.to,
        fromAddress: entry.from,
        subject: entry.subject,
        body: entry.body.slice(0, MAX_BODY_CHARS),
        status: entry.status,
        error: entry.error ?? null,
      },
    });
  } catch (err) {
    console.error(
      "[email-log] failed to record sent email:",
      err instanceof Error ? err.name : "UnknownError"
    );
  }
}
