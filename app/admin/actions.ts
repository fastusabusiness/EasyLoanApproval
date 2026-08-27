"use server";

import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  ADMIN_COOKIE,
  checkCredentials,
  createSessionCookie,
  isAdmin,
} from "@/lib/admin-auth";
import { logApplicationEvent } from "@/lib/application-events";
import { isApplicationStatus, STATUS_META } from "@/lib/application-status";
import { emailApplicantStatusChange, emailApplicantVerificationLink } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_ACTION_LIMIT,
  AUTH_LIMIT,
  clientIp,
  isRateLimited,
} from "@/lib/rate-limit";

export async function login(formData: FormData) {
  const ip = clientIp(await headers());
  // 5 attempts per 15 minutes per IP on this auth route.
  if (await isRateLimited(`admin-login:${ip}`, AUTH_LIMIT)) {
    redirect("/admin/login?error=rate");
  }

  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!checkCredentials(username, password)) {
    redirect("/admin/login?error=invalid");
  }

  const session = createSessionCookie();
  (await cookies()).set(ADMIN_COOKIE, session.value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: session.maxAge,
  });
  redirect("/admin");
}

export async function logout() {
  (await cookies()).delete(ADMIN_COOKIE);
  redirect("/admin/login");
}

const APPLICATION_ID_RE = /^ELA-\d{4}-[A-Z0-9]{6}$/;

export async function updateStatus(id: string, status: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-update:${ip}`, ADMIN_ACTION_LIMIT)) {
    throw new Error("Too many requests");
  }
  if (
    typeof id !== "string" ||
    typeof status !== "string" ||
    !APPLICATION_ID_RE.test(id) ||
    !isApplicationStatus(status)
  ) {
    throw new Error("Invalid input");
  }

  // Read current status so we can skip a no-op write and only notify on real
  // changes — otherwise re-selecting the same value in the dropdown would
  // spam the applicant.
  const existing = await prisma.application.findUnique({
    where: { id },
    select: { status: true, email: true, fullName: true, market: true },
  });
  if (!existing) throw new Error("Not found");
  if (existing.status === status) {
    revalidatePath("/admin");
    return;
  }

  await prisma.application.update({ where: { id }, data: { status } });
  await logApplicationEvent({
    applicationId: id,
    type: "status",
    message: `Status changed from ${STATUS_META[existing.status as keyof typeof STATUS_META]?.label ?? existing.status} to ${STATUS_META[status].label}.`,
  });
  await emailApplicantStatusChange({
    to: existing.email,
    fullName: existing.fullName,
    id,
    status,
    market: existing.market,
  });
  revalidatePath("/admin");
  revalidatePath(`/admin/applications/${id}`);
}

export type ActionState = { ok: boolean; message: string };

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

// Records the loan offer (approved amount, APR, term, disbursement date). Every
// field is optional so an admin can fill in what they know; blanks clear.
export async function recordDecision(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-decision:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }

  const id = String(formData.get("id") ?? "");
  if (!APPLICATION_ID_RE.test(id)) return { ok: false, message: "Invalid application." };

  const parseNum = (key: string): number | null => {
    const raw = String(formData.get(key) ?? "").replace(/[$,\s]/g, "").trim();
    if (!raw) return null;
    const n = Number(raw);
    return Number.isFinite(n) ? n : NaN;
  };

  const approvedAmount = parseNum("approvedAmount");
  const apr = parseNum("apr");
  const termRaw = parseNum("termMonths");
  const disbursedRaw = String(formData.get("disbursedAt") ?? "").trim();

  if (approvedAmount !== null && (Number.isNaN(approvedAmount) || approvedAmount < 0 || approvedAmount > 10_000_000)) {
    return { ok: false, message: "Approved amount must be between $0 and $10,000,000." };
  }
  if (apr !== null && (Number.isNaN(apr) || apr < 0 || apr > 100)) {
    return { ok: false, message: "APR must be between 0 and 100." };
  }
  const termMonths = termRaw === null ? null : Math.round(termRaw);
  if (termMonths !== null && (Number.isNaN(termMonths) || termMonths < 1 || termMonths > 120)) {
    return { ok: false, message: "Term must be between 1 and 120 months." };
  }
  let disbursedAt: Date | null = null;
  if (disbursedRaw) {
    const d = new Date(disbursedRaw);
    if (Number.isNaN(d.getTime())) {
      return { ok: false, message: "Disbursement date is invalid." };
    }
    disbursedAt = d;
  }

  const existing = await prisma.application.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Application not found." };

  await prisma.application.update({
    where: { id },
    data: { approvedAmount, apr, termMonths, disbursedAt },
  });

  const parts: string[] = [];
  if (approvedAmount !== null) parts.push(`approved ${money(approvedAmount)}`);
  if (apr !== null) parts.push(`${apr}% APR`);
  if (termMonths !== null) parts.push(`${termMonths} mo`);
  if (disbursedAt) parts.push(`disburse ${disbursedAt.toISOString().slice(0, 10)}`);
  await logApplicationEvent({
    applicationId: id,
    type: "decision",
    message: parts.length ? `Decision updated: ${parts.join(", ")}.` : "Decision details cleared.",
  });

  revalidatePath(`/admin/applications/${id}`);
  return { ok: true, message: "Decision saved." };
}

export async function addNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-note:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }

  const id = String(formData.get("id") ?? "");
  if (!APPLICATION_ID_RE.test(id)) return { ok: false, message: "Invalid application." };
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, message: "Note can't be empty." };
  if (body.length > 2000) return { ok: false, message: "Note must be 2000 characters or fewer." };

  const existing = await prisma.application.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Application not found." };

  await prisma.applicationNote.create({ data: { applicationId: id, body } });
  await logApplicationEvent({
    applicationId: id,
    type: "note",
    message: `Note added: "${body.length > 80 ? body.slice(0, 80) + "…" : body}"`,
  });

  revalidatePath(`/admin/applications/${id}`);
  return { ok: true, message: "Note added." };
}

export async function setArchived(id: string, archived: boolean) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-archive:${ip}`, ADMIN_ACTION_LIMIT)) {
    throw new Error("Too many requests");
  }
  if (!APPLICATION_ID_RE.test(id)) throw new Error("Invalid input");

  const existing = await prisma.application.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Not found");

  await prisma.application.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });
  await logApplicationEvent({
    applicationId: id,
    type: archived ? "archived" : "unarchived",
    message: archived ? "Application archived." : "Application restored from archive.",
  });

  revalidatePath("/admin");
  revalidatePath(`/admin/applications/${id}`);
}

const VERIFICATION_LINK_ID_RE = /^[a-zA-Z0-9_-]{1,40}$/;

function isHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export interface VerificationLinkResult {
  ok: boolean;
  message: string;
  id?: string;
  sentAt?: string;
}

// Creates a new verification link, or updates an existing one (when linkId is
// given), without sending it. Used by the bulk "Save links" action and as the
// first step of "save + send".
export async function upsertVerificationLink(
  applicationId: string,
  linkId: string | null,
  label: string,
  url: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-link:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!APPLICATION_ID_RE.test(applicationId)) {
    return { ok: false, message: "Invalid application." };
  }
  const trimmedLabel = label.trim().slice(0, 60);
  const trimmedUrl = url.trim().slice(0, 2000);
  if (!trimmedLabel) return { ok: false, message: "Link needs a label." };
  if (!isHttpUrl(trimmedUrl)) {
    return { ok: false, message: "Enter a valid http(s) link." };
  }

  if (linkId) {
    if (!VERIFICATION_LINK_ID_RE.test(linkId)) {
      return { ok: false, message: "Invalid link." };
    }
    const existing = await prisma.applicationVerificationLink.findUnique({
      where: { id: linkId },
      select: { applicationId: true },
    });
    if (!existing || existing.applicationId !== applicationId) {
      return { ok: false, message: "Link not found." };
    }
    await prisma.applicationVerificationLink.update({
      where: { id: linkId },
      data: { label: trimmedLabel, url: trimmedUrl },
    });
    revalidatePath(`/admin/applications/${applicationId}`);
    return { ok: true, message: "Saved.", id: linkId };
  }

  const application = await prisma.application.findUnique({
    where: { id: applicationId },
    select: { id: true },
  });
  if (!application) return { ok: false, message: "Application not found." };

  const created = await prisma.applicationVerificationLink.create({
    data: { applicationId, label: trimmedLabel, url: trimmedUrl },
  });
  revalidatePath(`/admin/applications/${applicationId}`);
  return { ok: true, message: "Saved.", id: created.id };
}

// Emails the link to the applicant and marks it sent.
export async function sendVerificationLink(
  linkId: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-link-send:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!VERIFICATION_LINK_ID_RE.test(linkId)) {
    return { ok: false, message: "Invalid link." };
  }

  const link = await prisma.applicationVerificationLink.findUnique({
    where: { id: linkId },
    include: {
      application: { select: { email: true, fullName: true, market: true } },
    },
  });
  if (!link) return { ok: false, message: "Link not found." };

  await emailApplicantVerificationLink({
    to: link.application.email,
    fullName: link.application.fullName,
    id: link.applicationId,
    label: link.label,
    url: link.url,
    market: link.application.market,
  });

  const sentAt = new Date();
  await prisma.applicationVerificationLink.update({
    where: { id: linkId },
    data: { sentAt },
  });
  await logApplicationEvent({
    applicationId: link.applicationId,
    type: "verification",
    message: `Verification link "${link.label}" sent to applicant.`,
  });

  revalidatePath(`/admin/applications/${link.applicationId}`);
  return { ok: true, message: "Sent.", sentAt: sentAt.toISOString() };
}

export async function deleteVerificationLink(
  linkId: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-link-delete:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!VERIFICATION_LINK_ID_RE.test(linkId)) {
    return { ok: false, message: "Invalid link." };
  }

  const link = await prisma.applicationVerificationLink.findUnique({
    where: { id: linkId },
    select: { applicationId: true, label: true },
  });
  if (!link) return { ok: true, message: "Already removed." };

  await prisma.applicationVerificationLink.delete({ where: { id: linkId } });
  await logApplicationEvent({
    applicationId: link.applicationId,
    type: "verification",
    message: `Verification link "${link.label}" removed.`,
  });

  revalidatePath(`/admin/applications/${link.applicationId}`);
  return { ok: true, message: "Removed." };
}
