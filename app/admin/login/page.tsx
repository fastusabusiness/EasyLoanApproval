import type { Metadata } from "next";
import { redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import { isAdmin } from "@/lib/admin-auth";
import { login } from "../actions";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

const ERROR_MESSAGES: Record<string, string> = {
  invalid: "Incorrect username or password.",
  rate: "Too many attempts. Please wait a minute and try again.",
};

const inputClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-ink placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await isAdmin()) redirect("/admin");
  const { error } = await searchParams;
  const message = error ? (ERROR_MESSAGES[error] ?? ERROR_MESSAGES.invalid) : null;

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-sun-soft/50 px-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-xl shadow-navy/10 ring-1 ring-navy/5">
        <div className="flex items-center justify-center gap-2.5">
          <BrandLogo className="h-8 w-8" />
          <span className="font-display text-xl font-bold tracking-tight text-navy">
            Easy Loan Approval
          </span>
        </div>
        <h1 className="font-display mt-6 text-center text-2xl font-bold tracking-tight text-ink">
          Admin sign in
        </h1>

        {message && (
          <p
            role="alert"
            className="mt-4 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          >
            {message}
          </p>
        )}

        <form action={login} className="mt-6 space-y-5">
          <div>
            <label
              htmlFor="username"
              className="mb-1.5 block text-sm font-bold text-navy"
            >
              Username
            </label>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              required
              className={inputClass}
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-bold text-navy"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className={inputClass}
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-full bg-sun px-8 py-3.5 font-display font-bold text-white shadow-lg shadow-sun/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy"
          >
            Sign in
          </button>
        </form>
      </div>
    </main>
  );
}
