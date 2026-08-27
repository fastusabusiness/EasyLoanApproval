import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import StatusSelect from "@/components/admin/StatusSelect";
import IdThumbnail from "@/components/admin/IdThumbnail";
import { isAdmin } from "@/lib/admin-auth";
import {
  STATUSES,
  STATUS_META,
  isApplicationStatus,
  type ApplicationStatus,
} from "@/lib/application-status";
import { buildApplicationFilter } from "@/lib/application-filter";
import { formatMoney as money } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { MARKET_META, type Market } from "@/lib/validation";
import { logout, updateStatus } from "./actions";

export const metadata: Metadata = {
  title: "Applications — Admin",
  robots: { index: false, follow: false },
};

const dob = (d: Date) =>
  d.toLocaleDateString("en-GB", { timeZone: "UTC" }); // DD/MM/YYYY

const submitted = (d: Date) =>
  d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; archived?: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100);
  const status: ApplicationStatus | null = isApplicationStatus(params.status)
    ? params.status
    : null;
  const showArchived = params.archived === "1";

  const where = buildApplicationFilter({ q, status, archived: showArchived });

  const [applications, totalCount, archivedCount, statusGroups, emailGroups, phoneGroups] =
    await Promise.all([
      prisma.application.findMany({ where, orderBy: { createdAt: "desc" } }),
      prisma.application.count({ where: { archivedAt: null } }),
      prisma.application.count({ where: { archivedAt: { not: null } } }),
      prisma.application.groupBy({
        by: ["status"],
        where: { archivedAt: showArchived ? { not: null } : null },
        _count: { _all: true },
      }),
      // Repeat-applicant detection: emails/phones that appear more than once
      // among active applications.
      prisma.application.groupBy({
        by: ["email"],
        where: { archivedAt: null },
        _count: { _all: true },
      }),
      prisma.application.groupBy({
        by: ["phone"],
        where: { archivedAt: null },
        _count: { _all: true },
      }),
    ]);

  const dupEmails = new Set(
    emailGroups.filter((g) => g._count._all > 1).map((g) => g.email)
  );
  const dupPhones = new Set(
    phoneGroups.filter((g) => g._count._all > 1).map((g) => g.phone)
  );

  // Different currencies can't be summed together — total each separately.
  // USD always shown first (as the headline figure) even if zero; any other
  // currency present shows as a secondary line underneath.
  const totalsByCurrency = new Map<string, number>();
  for (const a of applications) {
    const cur = a.currency ?? "USD";
    totalsByCurrency.set(cur, (totalsByCurrency.get(cur) ?? 0) + a.amount);
  }
  const totalUsd = totalsByCurrency.get("USD") ?? 0;
  const otherTotals = [...totalsByCurrency.entries()].filter(
    ([cur]) => cur !== "USD"
  );
  const isFiltered = Boolean(q) || status !== null;

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  const exportHref = `/admin/export${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <main className="min-h-screen bg-sun-soft/50">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-9 w-9" />
          <span className="font-display text-2xl font-bold tracking-tight text-navy">
            Easy Loan Approval
          </span>
          <span className="ml-2 rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Admin
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
          >
            Log out
          </button>
        </form>
      </header>

      <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Applications
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin/analytics"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M3 3v18h18" />
                <path d="M18 17V9M13 17V5M8 17v-3" />
              </svg>
              Analytics
            </a>
            <a
              href="/admin/careers"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Careers
            </a>
            <a
              href="/admin/email"
              className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-2 text-sm font-bold text-white shadow-lg shadow-sun/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Send email
            </a>
            <a
              href={exportHref}
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </a>
          </div>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
            <p className="text-sm font-bold text-slate-400">
              {isFiltered ? "Matching applications" : "Total applications"}
            </p>
            <p className="font-display mt-1 text-3xl font-bold text-ink">
              {applications.length}
              {isFiltered && (
                <span className="ml-2 text-lg font-bold text-slate-400">
                  of {totalCount}
                </span>
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
            <p className="text-sm font-bold text-slate-400">
              {isFiltered ? "Matching amount" : "Total requested"}
            </p>
            <p className="font-display mt-1 text-3xl font-bold text-ink">
              {money(totalUsd)}
            </p>
            {otherTotals.length > 0 && (
              <p className="font-display mt-0.5 text-lg font-bold text-slate-500">
                {otherTotals
                  .map(([cur, amt]) => `+ ${money(amt, cur)}`)
                  .join(" ")}
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 inline-flex rounded-full border-2 border-slate-200 bg-white p-1">
          <a
            href={`/admin${q || status ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}) })}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              !showArchived ? "bg-navy text-white" : "text-navy hover:bg-slate-50"
            }`}
          >
            Active ({totalCount})
          </a>
          <a
            href={`/admin?${new URLSearchParams({ archived: "1", ...(q ? { q } : {}), ...(status ? { status } : {}) })}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              showArchived ? "bg-navy text-white" : "text-navy hover:bg-slate-50"
            }`}
          >
            Archived ({archivedCount})
          </a>
        </div>

        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-navy/5 sm:p-5">
          <form
            method="get"
            action="/admin"
            className="flex flex-wrap items-end gap-3"
          >
            {showArchived && <input type="hidden" name="archived" value="1" />}
            <div className="min-w-48 flex-1">
              <label
                htmlFor="q"
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Search
              </label>
              <input
                id="q"
                name="q"
                type="search"
                defaultValue={q}
                placeholder="Name, email, phone, or application ID"
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20"
              />
            </div>
            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={status ?? ""}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20"
              >
                <option value="">All</option>
                {STATUSES.map((s) => {
                  const count =
                    statusGroups.find((g) => g.status === s)?._count._all ?? 0;
                  return (
                    <option key={s} value={s}>
                      {STATUS_META[s].label} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-ink"
              >
                Apply
              </button>
              {isFiltered && (
                <a
                  href="/admin"
                  className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
                >
                  Clear
                </a>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
          {applications.length === 0 ? (
            <p className="px-6 py-16 text-center text-slate-500">
              {isFiltered
                ? "No applications match these filters."
                : "No applications yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4">ID</th>
                    <th className="px-5 py-4">Applicant</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Date of Birth</th>
                    <th className="px-5 py-4">SSN</th>
                    <th className="px-5 py-4">ID Document</th>
                    <th className="px-5 py-4 text-right">Amount</th>
                    <th className="px-5 py-4">Purpose</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {applications.map((a) => {
                    const isRepeat =
                      dupEmails.has(a.email) || dupPhones.has(a.phone);
                    return (
                    <tr key={a.id} className="align-top hover:bg-sun-soft/40">
                      <td className="whitespace-nowrap px-5 py-4">
                        <a
                          href={`/admin/applications/${a.id}`}
                          className="font-mono text-xs font-bold text-navy underline-offset-2 hover:underline"
                        >
                          {a.id}
                        </a>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <a
                            href={`/admin/applications/${a.id}`}
                            className="font-bold text-ink hover:text-navy"
                          >
                            {a.fullName}
                          </a>
                          {a.market !== "US" && a.market in MARKET_META && (
                            <span
                              className="rounded-full bg-sun-soft px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-navy"
                              title={`Applied from ${MARKET_META[a.market as Market].label}`}
                            >
                              {MARKET_META[a.market as Market].flag} {a.market}
                            </span>
                          )}
                          {isRepeat && (
                            <span
                              className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700"
                              title="This email or phone appears on more than one application"
                            >
                              Repeat
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 max-w-52 text-xs text-slate-500">
                          {a.address}
                          {a.state ? `, ${a.state}` : ""}
                          {a.postalCode ? `, ${a.postalCode}` : ""}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-ink">{a.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{a.phone}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink">
                        {dob(a.dateOfBirth)}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 font-mono text-ink">
                        {a.ssn ?? "—"}
                      </td>
                      <td className="px-5 py-4">
                        {a.idImage ? (
                          <IdThumbnail
                            src={a.idImage}
                            label={a.idType ?? "ID"}
                            name={a.fullName}
                          />
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-right font-display font-bold text-ink">
                        {money(a.amount, a.currency ?? "USD")}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-block rounded-full bg-sun-soft px-3 py-1 text-xs font-bold text-navy">
                          {a.purpose}
                        </span>
                        {a.purposeDetail && (
                          <p className="mt-1.5 max-w-56 text-xs text-slate-500">
                            {a.purposeDetail}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <StatusSelect
                          id={a.id}
                          initialStatus={
                            isApplicationStatus(a.status) ? a.status : "received"
                          }
                          statuses={STATUSES}
                          meta={STATUS_META}
                          action={updateStatus}
                        />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {submitted(a.createdAt)}
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
