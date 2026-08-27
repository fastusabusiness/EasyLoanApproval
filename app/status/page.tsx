import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import StatusLookupForm from "./StatusLookupForm";

export const metadata: Metadata = {
  title: "Check application status",
  description: "Look up the status of your Easy Loan Approval application.",
};

export default function StatusPage() {
  return (
    <main className="min-h-screen bg-sun-soft/50">
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

      <div className="mx-auto max-w-md px-4 pb-20 pt-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink">
          Check your status
        </h1>
        <p className="mt-2 text-slate-600">
          Enter the Application ID we sent you, plus the email you applied
          with.
        </p>

        <div className="mt-8 rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 sm:p-8">
          <StatusLookupForm />
        </div>
      </div>
    </main>
  );
}
