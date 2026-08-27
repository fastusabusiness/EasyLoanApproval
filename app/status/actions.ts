"use server";

import { headers } from "next/headers";
import { isApplicationStatus, type ApplicationStatus } from "@/lib/application-status";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";

// Output of the lookup action — consumed by useActionState in the client form.
// Successful results return only the bare minimum so a stray ID can't be used
// to scrape applicant PII; the public page just confirms the status.
export type LookupResult =
  | { state: "idle" }
  | { state: "not_found" }
  | { state: "rate_limited" }
  | {
      state: "found";
      id: string;
      status: ApplicationStatus;
      amount: number;
      submittedAt: string;
    };

const APPLICATION_ID_RE = /^ELA-\d{4}-[A-Z0-9]{6}$/;

export async function lookupStatus(
  _prev: LookupResult,
  formData: FormData
): Promise<LookupResult> {
  const ip = clientIp(await headers());
  if (await isRateLimited(`status-lookup:${ip}`)) {
    return { state: "rate_limited" };
  }

  const turnstileOk = await verifyTurnstile(
    formData.get("cf-turnstile-response")?.toString(),
    ip
  );
  if (!turnstileOk) {
    return { state: "not_found" };
  }

  const id = String(formData.get("id") ?? "")
    .trim()
    .slice(0, 20)
    .toUpperCase();
  const email = String(formData.get("email") ?? "")
    .trim()
    .slice(0, 254)
    .toLowerCase();

  if (!APPLICATION_ID_RE.test(id) || !email) {
    return { state: "not_found" };
  }

  const app = await prisma.application.findUnique({ where: { id } });
  if (!app || app.email.toLowerCase() !== email) {
    return { state: "not_found" };
  }

  const status = isApplicationStatus(app.status) ? app.status : "received";
  return {
    state: "found",
    id: app.id,
    status,
    amount: app.amount,
    submittedAt: app.createdAt.toISOString(),
  };
}
