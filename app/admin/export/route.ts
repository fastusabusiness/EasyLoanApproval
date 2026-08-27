import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { isApplicationStatus } from "@/lib/application-status";
import { prisma } from "@/lib/prisma";
import { buildApplicationFilter } from "@/lib/application-filter";
import {
  ADMIN_ACTION_LIMIT,
  clientIp,
  isRateLimited,
} from "@/lib/rate-limit";

const COLUMNS = [
  "id",
  "market",
  "fullName",
  "email",
  "phone",
  "address",
  "state",
  "postalCode",
  "education",
  "employment",
  "dateOfBirth",
  "ssn",
  "idType",
  "amount",
  "currency",
  "purpose",
  "purposeDetail",
  "status",
  "approvedAmount",
  "apr",
  "termMonths",
  "disbursedAt",
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
  if (await isRateLimited(`admin-export:${clientIp(req.headers)}`, ADMIN_ACTION_LIMIT)) {
    return new NextResponse("Too many requests", { status: 429 });
  }

  const url = new URL(req.url);
  const q = (url.searchParams.get("q") ?? "").slice(0, 100);
  const statusParam = url.searchParams.get("status");
  const status = isApplicationStatus(statusParam) ? statusParam : null;

  const where = buildApplicationFilter({ q, status });
  const apps = await prisma.application.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  const header = COLUMNS.join(",");
  const rows = apps.map((a) =>
    COLUMNS.map((c) => escapeCell((a as Record<string, unknown>)[c])).join(",")
  );
  // BOM so Excel opens UTF-8 correctly.
  const csv = "﻿" + [header, ...rows].join("\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="fast-loan-advance-applications-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
