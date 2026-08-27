import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";

// Shared shell for /privacy and /terms. The content area uses arbitrary
// descendant utilities so each page can pass plain semantic markup
// (<h2>, <p>, <ul>) and get consistent legal-document styling.
export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
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

      <article className="mx-auto max-w-3xl px-4 pb-24 pt-4 sm:px-6">
        <h1 className="font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          {title}
        </h1>
        <p className="mt-3 text-sm font-medium text-slate-500">
          Last updated: {updated}
        </p>

        <div
          className="mt-10 rounded-3xl bg-white p-6 shadow-xl shadow-navy/5 sm:p-10
            [&_a]:font-medium [&_a]:text-navy [&_a]:underline [&_a]:underline-offset-2
            [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:tracking-tight [&_h2]:text-ink first:[&_h2]:mt-0
            [&_h3]:mt-6 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-navy
            [&_p]:mt-4 [&_p]:text-[15px] [&_p]:leading-relaxed [&_p]:text-slate-600
            [&_ul]:mt-4 [&_ul]:space-y-2 [&_ul]:pl-1
            [&_li]:flex [&_li]:gap-2.5 [&_li]:text-[15px] [&_li]:leading-relaxed [&_li]:text-slate-600
            [&_li]:before:mt-2 [&_li]:before:h-1.5 [&_li]:before:w-1.5 [&_li]:before:shrink-0 [&_li]:before:rounded-full [&_li]:before:bg-sun [&_li]:before:content-['']
            [&_strong]:font-bold [&_strong]:text-ink"
        >
          {children}
        </div>

        <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-navy">
          <Link href="/privacy" className="underline-offset-4 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="underline-offset-4 hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="underline-offset-4 hover:underline">
            Home
          </Link>
        </div>
      </article>
    </main>
  );
}
