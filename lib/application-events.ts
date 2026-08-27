import { prisma } from "./prisma";

// Append-only timeline of what happened to an application — status changes,
// decisions, notes, archiving. Writing an event is soft: a logging failure
// must never break the action that triggered it.

export type ApplicationEventType =
  | "created"
  | "status"
  | "decision"
  | "note"
  | "verification"
  | "archived"
  | "unarchived";

export async function logApplicationEvent(entry: {
  applicationId: string;
  type: ApplicationEventType;
  message: string;
}): Promise<void> {
  try {
    await prisma.applicationEvent.create({
      data: {
        applicationId: entry.applicationId,
        type: entry.type,
        message: entry.message,
      },
    });
  } catch (err) {
    console.error(
      "[application-events] failed to record event:",
      err instanceof Error ? err.name : "UnknownError"
    );
  }
}
