import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { buildCareerFilter } from "@/lib/career-filter";
import { isJobRole } from "@/lib/career-roles";
import { isCareerStatus } from "@/lib/career-status";
import { prisma } from "@/lib/prisma";
import {
  ADMIN_ACTION_LIMIT,
  clientIp,
  isRateLimited,
} from "@/lib/rate-limit";

const COLUMNS = [
  "id",
  "role",
  "fullName",
  "email",
  "phone",
  "location",
  "experience",
  "resumeName",
  "status",
  "createdAt",
] as const;

function escapeCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  let s = value instanceof Date ? value.toISOString() : String(value);
  // Neutralize CSV formula injection: a leading =, +, -, @, or control char
  // can execute as a formula in Excel/Sheets. Prefix with an apostrophe so the
  // cell is treated as text. (Applied before quoting.)
  if (/^[=+\-@\t\r]/.test(s)) {
    s = "'" + s;
  }
  if (/[",\n\r]/.test(s)) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function GET(req: Request) {
  if (!(await isAdmin())) {
    return new NextResponse("Unauthorized", { status: 401 });
  }
  if (await isRateLimited(`admin-careers-export:${clientIp(req.headers)}`, ADMIN_ACTION_LIMIT)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 100);
  const statusParam = url.searchParams.get("status");
  const status = isCareerStatus(statusParam) ? statusParam : null;
  const roleParam = url.searchParams.get("role");
  const role = isJobRole(roleParam) ? roleParam : null;

  const where = buildCareerFilter({ q, status, role });
  const candidates = await prisma.careerApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = COLUMNS.join(",");
  const rows = candidates.map((c) =>
    COLUMNS.map((col) => escapeCell((c as Record<string, unknown>)[col])).join(",")
  );
  // BOM so Excel opens UTF-8 correctly.
  const csv = "﻿" + [header, ...rows].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fast-loan-advance-candidates-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
