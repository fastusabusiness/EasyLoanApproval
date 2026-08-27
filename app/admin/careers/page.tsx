import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import StatusSelect from "@/components/admin/StatusSelect";
import { isAdmin } from "@/lib/admin-auth";
import { buildCareerFilter } from "@/lib/career-filter";
import {
  CAREER_STATUSES,
  CAREER_STATUS_META,
  isCareerStatus,
  type CareerStatus,
} from "@/lib/career-status";
import { JOB_ROLES, isJobRole } from "@/lib/career-roles";
import { prisma } from "@/lib/prisma";
import { logout } from "../actions";
import { updateCareerStatus } from "./actions";

export const metadata: Metadata = {
  title: "Careers — Admin",
  robots: { index: false, follow: false },
};

const submitted = (d: Date) =>
  d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }) + " UTC";

export default async function AdminCareersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    role?: string;
    archived?: string;
  }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const params = await searchParams;
  const q = (params.q ?? "").slice(0, 100);
  const status: CareerStatus | null = isCareerStatus(params.status)
    ? params.status
    : null;
  const role = isJobRole(params.role) ? params.role : null;
  const showArchived = params.archived === "1";

  const where = buildCareerFilter({ q, status, role, archived: showArchived });

  const [candidates, totalCount, archivedCount, statusGroups] =
    await Promise.all([
      prisma.careerApplication.findMany({
        where,
        orderBy: { createdAt: "desc" },
      }),
      prisma.careerApplication.count({ where: { archivedAt: null } }),
      prisma.careerApplication.count({
        where: { archivedAt: { not: null } },
      }),
      prisma.careerApplication.groupBy({
        by: ["status"],
        where: { archivedAt: showArchived ? { not: null } : null },
        _count: { _all: true },
      }),
    ]);

  const isFiltered = Boolean(q) || status !== null || role !== null;

  const exportParams = new URLSearchParams();
  if (q) exportParams.set("q", q);
  if (status) exportParams.set("status", status);
  if (role) exportParams.set("role", role);
  const exportHref = `/admin/careers/export${exportParams.toString() ? `?${exportParams}` : ""}`;

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
            Candidates
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
            >
              ← Applications
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
              {isFiltered ? "Matching candidates" : "Total candidates"}
            </p>
            <p className="font-display mt-1 text-3xl font-bold text-ink">
              {candidates.length}
              {isFiltered && (
                <span className="ml-2 text-lg font-bold text-slate-400">
                  of {totalCount}
                </span>
              )}
            </p>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5">
            <p className="text-sm font-bold text-slate-400">Hired</p>
            <p className="font-display mt-1 text-3xl font-bold text-ink">
              {statusGroups.find((g) => g.status === "hired")?._count._all ?? 0}
            </p>
          </div>
        </div>

        <div className="mt-6 inline-flex rounded-full border-2 border-slate-200 bg-white p-1">
          <a
            href={`/admin/careers${q || status || role ? `?${new URLSearchParams({ ...(q ? { q } : {}), ...(status ? { status } : {}), ...(role ? { role } : {}) })}` : ""}`}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition-colors ${
              !showArchived ? "bg-navy text-white" : "text-navy hover:bg-slate-50"
            }`}
          >
            Active ({totalCount})
          </a>
          <a
            href={`/admin/careers?${new URLSearchParams({ archived: "1", ...(q ? { q } : {}), ...(status ? { status } : {}), ...(role ? { role } : {}) })}`}
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
            action="/admin/careers"
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
                placeholder="Name, email, phone, or location"
                className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20"
              />
            </div>
            <div>
              <label
                htmlFor="role"
                className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                defaultValue={role ?? ""}
                className="rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-ink transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20"
              >
                <option value="">All roles</option>
                {JOB_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
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
                {CAREER_STATUSES.map((s) => {
                  const count =
                    statusGroups.find((g) => g.status === s)?._count._all ?? 0;
                  return (
                    <option key={s} value={s}>
                      {CAREER_STATUS_META[s].label} ({count})
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
                  href="/admin/careers"
                  className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
                >
                  Clear
                </a>
              )}
            </div>
          </form>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5">
          {candidates.length === 0 ? (
            <p className="px-6 py-16 text-center text-slate-500">
              {isFiltered
                ? "No candidates match these filters."
                : "No applications yet."}
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b-2 border-slate-100 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <th className="px-5 py-4">Candidate</th>
                    <th className="px-5 py-4">Role</th>
                    <th className="px-5 py-4">Contact</th>
                    <th className="px-5 py-4">Location</th>
                    <th className="px-5 py-4">Pitch</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Submitted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {candidates.map((c) => (
                    <tr key={c.id} className="align-top hover:bg-sun-soft/40">
                      <td className="px-5 py-4">
                        <a
                          href={`/admin/careers/${c.id}`}
                          className="inline-flex items-center gap-1.5 font-bold text-ink hover:text-navy"
                        >
                          {c.fullName}
                          {c.resumeData && (
                            <svg
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              className="h-3.5 w-3.5 shrink-0 text-slate-400"
                              aria-hidden="true"
                            >
                              <title>CV attached</title>
                              <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                          )}
                        </a>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4">
                        <span className="inline-block rounded-full bg-sun-soft px-3 py-1 text-xs font-bold text-navy">
                          {c.role}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-ink">{c.email}</p>
                        <p className="mt-0.5 text-xs text-slate-500">{c.phone}</p>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-ink">
                        {c.location}
                      </td>
                      <td className="px-5 py-4">
                        <p className="max-w-64 truncate text-xs text-slate-500">
                          {c.experience || "—"}
                        </p>
                      </td>
                      <td className="px-5 py-4">
                        <StatusSelect
                          id={c.id}
                          initialStatus={
                            isCareerStatus(c.status) ? c.status : "applied"
                          }
                          statuses={CAREER_STATUSES}
                          meta={CAREER_STATUS_META}
                          action={updateCareerStatus}
                        />
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        {submitted(c.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
