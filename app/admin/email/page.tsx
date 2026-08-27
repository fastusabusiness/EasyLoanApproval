import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ComposeEmailForm from "@/components/admin/ComposeEmailForm";
import { isAdmin } from "@/lib/admin-auth";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: "Send Email — Admin",
  robots: { index: false, follow: false },
};

export default async function AdminEmailPage() {
  if (!(await isAdmin())) redirect("/admin/login");

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

      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
            Send Email
          </h1>
          <div className="flex items-center gap-3">
            <a
              href="/admin"
              className="inline-flex items-center gap-1.5 rounded-full border-2 border-slate-200 bg-white px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
            >
              ← Applications
            </a>
          </div>
        </div>

        <p className="mt-2 text-sm text-slate-500">
          Send a one-off message to an applicant or contact.
        </p>

        <ComposeEmailForm />
      </div>
    </main>
  );
}
