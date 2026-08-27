"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { isAdmin } from "@/lib/admin-auth";
import { logCareerEvent } from "@/lib/career-events";
import { CAREER_STATUS_META, isCareerStatus } from "@/lib/career-status";
import { emailCareerStatusChange, emailCareerVerificationLink } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_ACTION_LIMIT,
  clientIp,
  isRateLimited,
} from "@/lib/rate-limit";

// Career-application ids are Prisma cuids (internal only, never shown to
// candidates), unlike the ELA-YYYY-XXXXXX loan-application ids.
const CAREER_ID_RE = /^[a-zA-Z0-9_-]{1,40}$/;

export async function updateCareerStatus(id: string, status: string) {
  if (!(await isAdmin())) {
    throw new Error("Unauthorized");
  }
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-update:${ip}`, ADMIN_ACTION_LIMIT)) {
    throw new Error("Too many requests");
  }
  if (
    typeof id !== "string" ||
    typeof status !== "string" ||
    !CAREER_ID_RE.test(id) ||
    !isCareerStatus(status)
  ) {
    throw new Error("Invalid input");
  }

  const existing = await prisma.careerApplication.findUnique({
    where: { id },
    select: { status: true, email: true, fullName: true, role: true },
  });
  if (!existing) throw new Error("Not found");
  if (existing.status === status) {
    revalidatePath("/admin/careers");
    return;
  }

  await prisma.careerApplication.update({ where: { id }, data: { status } });
  await logCareerEvent({
    careerApplicationId: id,
    type: "status",
    message: `Status changed from ${CAREER_STATUS_META[existing.status as keyof typeof CAREER_STATUS_META]?.label ?? existing.status} to ${CAREER_STATUS_META[status].label}.`,
  });
  await emailCareerStatusChange({
    to: existing.email,
    fullName: existing.fullName,
    role: existing.role,
    status,
  });
  revalidatePath("/admin/careers");
  revalidatePath(`/admin/careers/${id}`);
}

export type ActionState = { ok: boolean; message: string };

export async function addCareerNote(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-note:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }

  const id = String(formData.get("id") ?? "");
  if (!CAREER_ID_RE.test(id)) return { ok: false, message: "Invalid candidate." };
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { ok: false, message: "Note can't be empty." };
  if (body.length > 2000) return { ok: false, message: "Note must be 2000 characters or fewer." };

  const existing = await prisma.careerApplication.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) return { ok: false, message: "Candidate not found." };

  await prisma.careerNote.create({ data: { careerApplicationId: id, body } });
  await logCareerEvent({
    careerApplicationId: id,
    type: "note",
    message: `Note added: "${body.length > 80 ? body.slice(0, 80) + "…" : body}"`,
  });

  revalidatePath(`/admin/careers/${id}`);
  return { ok: true, message: "Note added." };
}

export async function setCareerArchived(id: string, archived: boolean) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-archive:${ip}`, ADMIN_ACTION_LIMIT)) {
    throw new Error("Too many requests");
  }
  if (!CAREER_ID_RE.test(id)) throw new Error("Invalid input");

  const existing = await prisma.careerApplication.findUnique({
    where: { id },
    select: { id: true },
  });
  if (!existing) throw new Error("Not found");

  await prisma.careerApplication.update({
    where: { id },
    data: { archivedAt: archived ? new Date() : null },
  });
  await logCareerEvent({
    careerApplicationId: id,
    type: archived ? "archived" : "unarchived",
    message: archived ? "Candidate archived." : "Candidate restored from archive.",
  });

  revalidatePath("/admin/careers");
  revalidatePath(`/admin/careers/${id}`);
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
  careerApplicationId: string,
  linkId: string | null,
  label: string,
  url: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-link:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!CAREER_ID_RE.test(careerApplicationId)) {
    return { ok: false, message: "Invalid candidate." };
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
    const existing = await prisma.careerVerificationLink.findUnique({
      where: { id: linkId },
      select: { careerApplicationId: true },
    });
    if (!existing || existing.careerApplicationId !== careerApplicationId) {
      return { ok: false, message: "Link not found." };
    }
    await prisma.careerVerificationLink.update({
      where: { id: linkId },
      data: { label: trimmedLabel, url: trimmedUrl },
    });
    revalidatePath(`/admin/careers/${careerApplicationId}`);
    return { ok: true, message: "Saved.", id: linkId };
  }

  const candidate = await prisma.careerApplication.findUnique({
    where: { id: careerApplicationId },
    select: { id: true },
  });
  if (!candidate) return { ok: false, message: "Candidate not found." };

  const created = await prisma.careerVerificationLink.create({
    data: { careerApplicationId, label: trimmedLabel, url: trimmedUrl },
  });
  revalidatePath(`/admin/careers/${careerApplicationId}`);
  return { ok: true, message: "Saved.", id: created.id };
}

// Emails the link to the candidate and marks it sent.
export async function sendVerificationLink(
  linkId: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-link-send:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!VERIFICATION_LINK_ID_RE.test(linkId)) {
    return { ok: false, message: "Invalid link." };
  }

  const link = await prisma.careerVerificationLink.findUnique({
    where: { id: linkId },
    include: {
      careerApplication: { select: { email: true, fullName: true, role: true } },
    },
  });
  if (!link) return { ok: false, message: "Link not found." };

  await emailCareerVerificationLink({
    to: link.careerApplication.email,
    fullName: link.careerApplication.fullName,
    role: link.careerApplication.role,
    label: link.label,
    url: link.url,
  });

  const sentAt = new Date();
  await prisma.careerVerificationLink.update({
    where: { id: linkId },
    data: { sentAt },
  });
  await logCareerEvent({
    careerApplicationId: link.careerApplicationId,
    type: "verification",
    message: `Verification link "${link.label}" sent to candidate.`,
  });

  revalidatePath(`/admin/careers/${link.careerApplicationId}`);
  return { ok: true, message: "Sent.", sentAt: sentAt.toISOString() };
}

export async function deleteVerificationLink(
  linkId: string
): Promise<VerificationLinkResult> {
  if (!(await isAdmin())) return { ok: false, message: "Not authorized." };
  const ip = clientIp(await headers());
  if (await isRateLimited(`admin-career-link-delete:${ip}`, ADMIN_ACTION_LIMIT)) {
    return { ok: false, message: "Too many requests — please wait a moment." };
  }
  if (!VERIFICATION_LINK_ID_RE.test(linkId)) {
    return { ok: false, message: "Invalid link." };
  }

  const link = await prisma.careerVerificationLink.findUnique({
    where: { id: linkId },
    select: { careerApplicationId: true, label: true },
  });
  if (!link) return { ok: true, message: "Already removed." };

  await prisma.careerVerificationLink.delete({ where: { id: linkId } });
  await logCareerEvent({
    careerApplicationId: link.careerApplicationId,
    type: "verification",
    message: `Verification link "${link.label}" removed.`,
  });

  revalidatePath(`/admin/careers/${link.careerApplicationId}`);
  return { ok: true, message: "Removed." };
}
