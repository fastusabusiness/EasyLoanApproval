import type { Prisma } from "@prisma/client";
import type { ApplicationStatus } from "./application-status";

// Shared between the admin page and the CSV export so they always match.
// SQLite is case-sensitive by default and Postgres requires `mode: "insensitive"`
// for case-insensitive contains, so for portability we lower-case the haystack
// in Postgres via a future migration if needed. For now both adapters work with
// plain contains for the typical search terms (names/emails) people use.

export interface FilterParams {
  q: string;
  status: ApplicationStatus | null;
  // "active" (default) hides archived; "archived" shows only archived.
  archived?: boolean;
}

export function buildApplicationFilter(
  params: FilterParams
): Prisma.ApplicationWhereInput {
  const where: Prisma.ApplicationWhereInput = {};
  where.archivedAt = params.archived ? { not: null } : null;
  if (params.status) where.status = params.status;
  const q = params.q.trim();
  if (q) {
    where.OR = [
      { id: { contains: q.toUpperCase() } },
      { fullName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
    ];
  }
  return where;
}
