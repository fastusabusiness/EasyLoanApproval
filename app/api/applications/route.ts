import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import {
  emailAdminNewApplication,
  emailApplicantConfirmation,
} from "@/lib/email";
import { logApplicationEvent } from "@/lib/application-events";
import { formatMoney } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { clientIp, isRateLimited } from "@/lib/rate-limit";
import { verifyTurnstile } from "@/lib/turnstile";
import { validateApplication, type ApplicationPayload } from "@/lib/validation";

// The body carries a downscaled ID photo (data URL) plus small text fields.
// Cap it generously but firmly so a giant payload can't be parsed into memory.
const MAX_BODY_BYTES = 8 * 1024 * 1024;

// Privacy note: this handler intentionally never logs request bodies or
// applicant fields — only error names/codes on failure.

const ID_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

function generateApplicationId(): string {
  const year = new Date().getFullYear();
  let suffix = "";
  for (let i = 0; i < 6; i++) {
    suffix += ID_ALPHABET[randomInt(ID_ALPHABET.length)];
  }
  return `ELA-${year}-${suffix}`;
}

function toPayload(body: Record<string, unknown>): ApplicationPayload {
  const str = (key: string) => {
    const v = body[key];
    return typeof v === "string" ? v : "";
  };
  return {
    market: str("market") || "US",
    fullName: str("fullName"),
    email: str("email"),
    phone: str("phone"),
    address: str("address"),
    state: str("state"),
    postalCode: str("postalCode"),
    education: str("education"),
    employment: str("employment"),
    dobDay: str("dobDay"),
    dobMonth: str("dobMonth"),
    dobYear: str("dobYear"),
    ssn: str("ssn"),
    idType: str("idType"),
    idImage: str("idImage"),
    amount: str("amount"),
    purpose: str("purpose"),
    purposeDetail: str("purposeDetail"),
  };
}

export async function POST(req: Request) {
  const ip = clientIp(req.headers);
  if (await isRateLimited(`applications:${ip}`)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again in a minute." },
      { status: 429 }
    );
  }

  // Reject oversized payloads before reading the body into memory.
  const declaredLength = Number(req.headers.get("content-length") ?? "0");
  if (Number.isFinite(declaredLength) && declaredLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  // Read as text with a hard cap (covers chunked requests with no
  // Content-Length), then parse.
  const raw = await req.text();
  if (raw.length > MAX_BODY_BYTES) {
    return NextResponse.json({ error: "Payload too large." }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const record = body as Record<string, unknown>;
  const turnstileToken =
    typeof record.turnstileToken === "string" ? record.turnstileToken : null;
  if (!(await verifyTurnstile(turnstileToken, ip))) {
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 400 }
    );
  }

  const { errors, values } = validateApplication(toPayload(record));
  if (!values) {
    return NextResponse.json(
      { error: "Validation failed.", errors },
      { status: 400 }
    );
  }

  // The ID space is large (36^6 per year), but retry on the off chance of a
  // collision with the unique primary key.
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = generateApplicationId();
    try {
      await prisma.application.create({
        data: { id, ...values },
      });
      await logApplicationEvent({
        applicationId: id,
        type: "created",
        message: `Application submitted for ${formatMoney(values.amount, values.currency)} (${values.purpose}).`,
      });
      // Fire confirmation + admin notification in parallel. Both swallow
      // their own errors so a flaky email provider can't fail submission.
      await Promise.all([
        emailApplicantConfirmation({
          to: values.email,
          fullName: values.fullName,
          id,
          amount: values.amount,
          currency: values.currency,
          market: values.market,
        }),
        emailAdminNewApplication({
          id,
          fullName: values.fullName,
          email: values.email,
          amount: values.amount,
          currency: values.currency,
          purpose: values.purpose,
        }),
      ]);
      return NextResponse.json({ id }, { status: 201 });
    } catch (err) {
      const isIdCollision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002";
      if (!isIdCollision) {
        console.error(
          "Application submission failed:",
          err instanceof Error ? err.name : "UnknownError"
        );
        return NextResponse.json(
          { error: "We couldn't save your application. Please try again." },
          { status: 500 }
        );
      }
    }
  }

  console.error("Application submission failed: exhausted ID retries");
  return NextResponse.json(
    { error: "We couldn't save your application. Please try again." },
    { status: 500 }
  );
}
