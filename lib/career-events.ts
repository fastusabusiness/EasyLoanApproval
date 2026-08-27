import { prisma } from "./prisma";

// Append-only timeline of what happened to a career (job) candidate
// — status changes, notes, archiving. Writing an event is soft: a logging
// failure must never break the action that triggered it. See
// lib/application-events.ts for the loan-application equivalent.

export type CareerEventType =
  | "created"
  | "status"
  | "note"
  | "verification"
  | "archived"
  | "unarchived";

export async function logCareerEvent(entry: {
  careerApplicationId: string;
  type: CareerEventType;
  message: string;
}): Promise<void> {
  try {
    await prisma.careerEvent.create({
      data: {
        careerApplicationId: entry.careerApplicationId,
        type: entry.type,
        message: entry.message,
      },
    });
  } catch (err) {
    console.error(
      "[career-events] failed to record event:",
      err instanceof Error ? err.name : "UnknownError"
    );
  }
}
