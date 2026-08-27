import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import { JOB_ROLES, JOB_ROLE_DETAILS, isJobRole } from "@/lib/career-roles";
import CareersForm from "./CareersForm";

export const metadata: Metadata = {
  title: "Careers — Join Easy Loan Approval",
  description:
    "We're hiring across Loan Marketing, Data, Social Media, and Engineering. Flexible, remote-friendly roles at Easy Loan Approval.",
};

const WHY_US = [
  {
    title: "Remote-friendly",
    body: "Work from wherever you're most productive — most roles are fully remote.",
  },
  {
    title: "Room to grow",
    body: "We're a small, fast-moving team — your impact (and growth) compounds quickly.",
  },
  {
    title: "Straightforward process",
    body: "A short application and a real conversation. No lengthy back-and-forth.",
  },
  {
    title: "A product people need",
    body: "Help build and run a platform that gets people fast, simple access to loans.",
  },
];

export default async function CareersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const params = await searchParams;
  const defaultRole = isJobRole(params.role) ? params.role : "";

  return (
    <main className="min-h-screen bg-sun-soft/40">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <Link href="/" className="flex items-center gap-2.5">
          <BrandLogo className="h-9 w-9" />
          <span className="font-display text-2xl font-bold tracking-tight text-navy">
            Easy Loan Approval
          </span>
        </Link>
        <Link
          href="/"
          className="text-sm font-medium text-navy underline-offset-4 hover:underline"
        >
          ← Back to home
        </Link>
      </header>

      <div className="mx-auto max-w-3xl px-4 pb-24 pt-4 sm:px-6">
        {/* Hero */}
        <section className="text-center">
          <span className="inline-block rounded-full bg-sun px-4 py-1.5 font-display text-sm font-bold text-white">
            We&apos;re hiring
          </span>
          <h1 className="font-display mt-5 text-4xl font-bold leading-tight tracking-tight text-ink sm:text-6xl">
            Join{" "}
            <span className="relative inline-block">
              <span className="relative z-10">Easy Loan Approval</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 z-0 h-3 -rotate-1 rounded-sm bg-sun sm:h-5"
              />
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
            We&apos;re building a faster, simpler way to get people access to
            loans — and hiring across marketing, data, social, and
            engineering to do it.
          </p>
          <a
            href="#apply"
            className="mt-8 inline-block rounded-full bg-sun px-10 py-4 font-display text-lg font-bold text-white shadow-lg shadow-sun/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Apply Now
          </a>
        </section>

        {/* Open roles */}
        <section className="mt-16">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Open roles
          </h2>
          <p className="mt-2 text-slate-600">
            Tap a role to see the full description, or jump straight to the
            application.
          </p>
          <div className="mt-5 space-y-3">
            {JOB_ROLES.map((role) => {
              const detail = JOB_ROLE_DETAILS[role];
              return (
                <details
                  key={role}
                  className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4">
                    <span className="font-display font-bold text-ink">
                      {role}
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-5 w-5 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </summary>

                  <div className="border-t border-slate-100 px-5 py-5">
                    <p className="text-sm leading-relaxed text-slate-600">
                      {detail.summary}
                    </p>

                    <h4 className="font-display mt-4 text-sm font-bold text-ink">
                      What you&apos;ll do
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {detail.responsibilities.map((r) => (
                        <li
                          key={r}
                          className="flex gap-2.5 text-sm text-slate-600"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun"
                          />
                          {r}
                        </li>
                      ))}
                    </ul>

                    <h4 className="font-display mt-4 text-sm font-bold text-ink">
                      What we&apos;re looking for
                    </h4>
                    <ul className="mt-2 space-y-2">
                      {detail.lookingFor.map((r) => (
                        <li
                          key={r}
                          className="flex gap-2.5 text-sm text-slate-600"
                        >
                          <span
                            aria-hidden="true"
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sun"
                          />
                          {r}
                        </li>
                      ))}
                    </ul>

                    <a
                      href={`?role=${encodeURIComponent(role)}#apply`}
                      className="mt-5 inline-flex w-fit items-center gap-1 rounded-full bg-sun px-5 py-2.5 font-display text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep"
                    >
                      Apply for this role →
                    </a>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* Why us */}
        <section className="mt-14">
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink">
            Why work with us
          </h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {WHY_US.map((o) => (
              <div
                key={o.title}
                className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5"
              >
                <h3 className="font-display font-bold text-ink">{o.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
                  {o.body}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Apply */}
        <section id="apply" className="mt-16 scroll-mt-8">
          <h2 className="font-display text-3xl font-bold tracking-tight text-ink">
            Apply to join
          </h2>
          <p className="mt-2 text-slate-600">
            Pick a role and fill in the form — our team will be in touch. It
            takes a minute.
          </p>
          <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 sm:p-10">
            <CareersForm defaultRole={defaultRole} />
          </div>
        </section>
      </div>
    </main>
  );
}
