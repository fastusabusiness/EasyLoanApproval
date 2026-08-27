import type { Prisma } from "@prisma/client";
import type { CareerStatus } from "./career-status";

// Shared between the admin careers page and the CSV export so they always
// match. See lib/application-filter.ts for the loan-application equivalent.

export interface CareerFilterParams {
  q: string;
  status: CareerStatus | null;
  role?: string | null;
  // "active" (default) hides archived; "archived" shows only archived.
  archived?: boolean;
}

export function buildCareerFilter(
  params: CareerFilterParams
): Prisma.CareerApplicationWhereInput {
  const where: Prisma.CareerApplicationWhereInput = {};
  where.archivedAt = params.archived ? { not: null } : null;
  if (params.status) where.status = params.status;
  if (params.role) where.role = params.role;
  const q = params.q.trim();
  if (q) {
    where.OR = [
      { fullName: { contains: q } },
      { email: { contains: q } },
      { phone: { contains: q } },
      { location: { contains: q } },
    ];
  }
  return where;
}
