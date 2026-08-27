import type { Metadata } from "next";
import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import IndonesiaApplicationForm from "@/components/IndonesiaApplicationForm";

export const metadata: Metadata = {
  title: "Ajukan Pinjaman — Apply (Indonesia)",
  description:
    "Ajukan pinjaman Easy Loan Approval dalam Rupiah. / Apply for a Easy Loan Approval loan in Indonesian Rupiah.",
};

export default function ApplyIndonesiaPage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-sun-soft/50">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-sun/20 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-40 top-1/2 h-96 w-96 rounded-full bg-navy/5 blur-3xl"
      />
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
          ← Kembali / Back to home
        </Link>
      </header>

      <div className="relative mx-auto max-w-2xl px-4 pb-28 pt-4 sm:px-6">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-sun px-4 py-1.5 font-display text-sm font-bold text-white">
          🇮🇩 Indonesia
        </span>
        <h1 className="font-display mt-4 text-4xl font-bold tracking-tight text-ink">
          Ajukan pinjaman
          <span className="block text-2xl text-slate-500">Apply for a loan</span>
        </h1>
        <p className="mt-2 text-slate-600">
          Ceritakan sedikit tentang diri Anda. Hanya butuh waktu dua menit. /
          Tell us a little about yourself. It takes about two minutes.
        </p>

        <div className="mt-8 overflow-hidden rounded-3xl bg-white shadow-xl shadow-navy/10 ring-1 ring-navy/5">
          <div className="h-1.5 bg-gradient-to-r from-sun via-sun-deep to-sun" />
          <div className="p-6 sm:p-10">
            <IndonesiaApplicationForm />
          </div>
        </div>
      </div>
    </main>
  );
}
