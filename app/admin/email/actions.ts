"use server";

import { headers } from "next/headers";
import { isAdmin } from "@/lib/admin-auth";
import { sendCustomEmail } from "@/lib/email";
import {
  ADMIN_ACTION_LIMIT,
  clientIp,
  isRateLimited,
} from "@/lib/rate-limit";
import { FROM_ADDRESSES, type SendState } from "./addresses";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function sendAdminEmail(
  _prev: SendState,
  formData: FormData
): Promise<SendState> {
  if (!(await isAdmin())) {
    return { status: "error", message: "Not authorized." };
  }

  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-email:${ip}`, ADMIN_ACTION_LIMIT)) {
    return {
      status: "error",
      message: "Too many requests — please wait a moment and try again.",
    };
  }

  const from = String(formData.get("from") ?? "");
  const to = String(formData.get("to") ?? "").trim();
  const subject = String(formData.get("subject") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!(FROM_ADDRESSES as readonly string[]).includes(from)) {
    return { status: "error", message: "Please choose a valid From address." };
  }
  if (!EMAIL_RE.test(to) || to.length > 254) {
    return { status: "error", message: "Please enter a valid recipient email." };
  }
  if (!subject || subject.length > 200) {
    return { status: "error", message: "Subject is required (max 200 characters)." };
  }
  if (!message || message.length > 5000) {
    return { status: "error", message: "Message is required (max 5000 characters)." };
  }

  const result = await sendCustomEmail({ from, to, subject, text: message });

  if (result.skipped) {
    return {
      status: "error",
      message:
        "Email isn't configured (RESEND_API_KEY is not set), so nothing was sent. Add the key and verify the easyloansapprovals.com sender domain in Resend to enable sending.",
    };
  }
  if (!result.ok) {
    return {
      status: "error",
      message: `Send failed: ${result.error ?? "unknown error"}`,
    };
  }
  return { status: "success", message: `Email sent to ${to}.` };
}
