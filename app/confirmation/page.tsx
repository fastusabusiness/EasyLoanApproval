import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";

export const metadata: Metadata = {
  title: "Application Received",
  description: "Your Easy Loan Approval application has been received.",
};

const APPLICATION_ID_RE = /^ELA-\d{4}-[A-Z0-9]{6}$/;

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id || !APPLICATION_ID_RE.test(id)) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen flex-col bg-sun-soft/50">
      <header className="flex items-center gap-2.5 px-6 py-6 sm:px-10">
        <BrandLogo className="h-9 w-9" />
        <span className="font-display text-2xl font-bold tracking-tight text-navy">
          Easy Loan Approval
        </span>
      </header>

      <div className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="w-full max-w-lg rounded-3xl bg-white p-8 text-center shadow-xl shadow-navy/5 sm:p-12">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sun text-white">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-white"
              aria-hidden="true"
            >
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </div>

          <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-ink">
            Application Received!
          </h1>
          <p className="mt-3 text-slate-600">
            Thanks for applying. Your application ID is:
          </p>

          <p className="mt-5 rounded-2xl border-2 border-dashed border-sun bg-sun-soft px-6 py-4 font-display text-2xl font-bold tracking-wider text-navy sm:text-3xl">
            {id}
          </p>

          <p className="mt-5 text-sm text-slate-500">
            Please save this ID — you&apos;ll need it to check on your
            application. We&apos;ll be in touch by email within 24 hours.
          </p>

          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href={`/status?id=${id}`}
              className="rounded-full bg-navy px-8 py-3.5 font-display font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun"
            >
              Check status
            </Link>
            <Link
              href="/"
              className="rounded-full border-2 border-slate-200 px-8 py-3 font-display font-bold text-navy transition-all duration-200 hover:border-navy focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-sun"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
