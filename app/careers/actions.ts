"use server";

import { headers } from "next/headers";
import { logCareerEvent } from "@/lib/career-events";
import { isJobRole } from "@/lib/career-roles";
import { emailCareersApplication } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// Result consumed by useActionState in the client form. Errors are keyed by
// field so the form can show inline messages; `values` echoes input back so a
// failed submit doesn't wipe what the candidate typed.
export interface CareersValues {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
}

type CareersErrors = Partial<Record<keyof CareersValues | "resume", string>>;

export type CareersResult =
  | { state: "idle" }
  | { state: "error"; errors: CareersErrors; values: CareersValues }
  | { state: "rate_limited"; values: CareersValues }
  | { state: "success" };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

export async function submitCareersApplication(
  _prev: CareersResult,
  formData: FormData
): Promise<CareersResult> {
  // Cap raw field length before any processing so an oversized field can't be
  // used to bloat memory or the notification email.
  const field = (name: string, max: number) =>
    String(formData.get(name) ?? "").trim().slice(0, max);
  const values: CareersValues = {
    role: field("role", 60),
    fullName: field("fullName", 100),
    email: field("email", 254),
    phone: field("phone", 20),
    location: field("location", 120),
    experience: field("experience", 2000),
  };

  const ip = clientIp(await headers());
  if (await isRateLimited(`careers:${ip}`)) {
    return { state: "rate_limited", values };
  }

  const turnstileOk = await verifyTurnstile(
    formData.get("cf-turnstile-response")?.toString(),
    ip
  );
  if (!turnstileOk) {
    return {
      state: "error",
      errors: { fullName: "Verification failed. Please try again." },
      values,
    };
  }

  const errors: CareersErrors = {};
  if (!isJobRole(values.role))
    errors.role = "Please select a role.";
  if (values.fullName.length < 2 || values.fullName.length > 100)
    errors.fullName = "Please enter your full name.";
  if (!EMAIL_RE.test(values.email) || values.email.length > 254)
    errors.email = "Please enter a valid email address.";
  const digits = values.phone.replace(/\D/g, "").length;
  if (!PHONE_RE.test(values.phone) || digits < 7 || digits > 15)
    errors.phone = "Please enter a valid phone number.";
  if (values.location.length < 2 || values.location.length > 120)
    errors.location = "Please enter your city or area.";
  if (values.experience.length > 2000)
    errors.experience = "Please keep this under 2000 characters.";

  // CV/resume is optional — an empty file input still submits a zero-byte File.
  const resumeFile = formData.get("resume");
  const hasResume =
    resumeFile instanceof File && resumeFile.size > 0 && resumeFile.name;
  if (hasResume) {
    if (!RESUME_MIME_TYPES.has(resumeFile.type)) {
      errors.resume = "Please upload a PDF or Word document.";
    } else if (resumeFile.size > MAX_RESUME_BYTES) {
      errors.resume = "File must be 5 MB or smaller.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return { state: "error", errors, values };
  }

  let resumeName: string | null = null;
  let resumeData: string | null = null;
  if (hasResume && resumeFile instanceof File) {
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    resumeName = resumeFile.name.slice(0, 200);
    resumeData = `data:${resumeFile.type};base64,${buffer.toString("base64")}`;
  }

  const created = await prisma.careerApplication.create({
    data: { ...values, resumeName, resumeData },
  });
  await logCareerEvent({
    careerApplicationId: created.id,
    type: "created",
    message: hasResume
      ? "Application submitted with a CV attached."
      : "Application submitted.",
  });
  await emailCareersApplication(values);
  return { state: "success" };
}
