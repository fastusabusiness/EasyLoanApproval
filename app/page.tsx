import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LoanCalculator from "@/components/LoanCalculator";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const stats = [
  { value: "$240M+", label: "Funded to date" },
  { value: "120k+", label: "Happy borrowers" },
  { value: "< 24h", label: "Avg. decision time" },
  { value: "4.9/5", label: "Customer rating" },
];

const steps = [
  {
    n: "01",
    title: "Apply in two minutes",
    body: "A short, three-step form. No paperwork mountains, no logins to a dozen portals.",
  },
  {
    n: "02",
    title: "Get a decision fast",
    body: "Most applicants hear back within 24 hours. Checking your rate never touches your credit score.",
  },
  {
    n: "03",
    title: "Money flies to you",
    body: "Approved funds land straight in your bank — ready for whatever matters next.",
  },
];

const loanOptions = [
  {
    title: "Personal Loans",
    range: "$500 – $50,000",
    body: "For anything life throws at you — bills, a move, a big purchase, or just breathing room.",
    icon: (
      <path d="M12 2 3 14h9l-1 8 10-12h-9l1-8z" />
    ),
  },
  {
    title: "Business Loans",
    range: "$1,000 – $50,000",
    body: "Cover payroll, inventory, or equipment without waiting weeks on a bank.",
    icon: (
      <>
        <rect x="3" y="7" width="18" height="13" rx="2" />
        <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      </>
    ),
  },
  {
    title: "Home Improvement",
    range: "$1,000 – $50,000",
    body: "Repairs, renovations, or upgrades — funded before the contractor even starts.",
    icon: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 9.5V20a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9.5" />
      </>
    ),
  },
  {
    title: "Auto & Other",
    range: "$500 – $50,000",
    body: "Repairs, a used-car gap, or anything else that doesn't fit a neat category.",
    icon: (
      <>
        <path d="M5 17h14v-4l-2-5H7l-2 5z" />
        <circle cx="7.5" cy="17" r="1.5" />
        <circle cx="16.5" cy="17" r="1.5" />
      </>
    ),
  },
];

// Illustrative only — computed at the homepage's indicative 9.99% APR over 24
// months (same assumptions as LoanCalculator). Real terms depend on the
// applicant's profile.
const rateRows = [
  { amount: "$1,000", payment: "$46", interest: "$107" },
  { amount: "$5,000", payment: "$231", interest: "$536" },
  { amount: "$10,000", payment: "$461", interest: "$1,071" },
  { amount: "$25,000", payment: "$1,153", interest: "$2,679" },
];

const faqs = [
  {
    q: "What credit scores do you consider?",
    a: "All credit profiles are welcome to apply. We look at your full financial picture, not just a single number.",
  },
  {
    q: "How fast will I get a decision?",
    a: "Most applicants hear back within 24 hours of submitting a complete application.",
  },
  {
    q: "Does checking my rate hurt my credit?",
    a: "No. Applying through Easy Loan Approval never affects your credit score.",
  },
  {
    q: "What documents do I need?",
    a: "Just your basic details and a photo of a government ID (driver's license or state ID) — no bank statements or pay stubs required to apply.",
  },
  {
    q: "Are there any hidden fees?",
    a: "No. The rate you're quoted is the rate you get — no origination surprises or fine-print traps.",
  },
  {
    q: "How do I check my application status?",
    a: "Use the application ID from your confirmation email on our Check status page, any time.",
  },
];

/* ------------------------------------------------------------------ */
/* Small visuals                                                       */
/* ------------------------------------------------------------------ */

function MoneyBill({
  className,
  delay,
  size = 48,
}: {
  className: string;
  delay: string;
  size?: number;
}) {
  return (
    <div
      className={`animate-money-rise absolute drop-shadow-lg ${className}`}
      style={{ animationDelay: delay }}
      aria-hidden="true"
    >
      <svg width={size} height={size * 0.62} viewBox="0 0 48 30" fill="none">
        <rect x="1" y="1" width="46" height="28" rx="4" fill="#ffffff" stroke="#cfe3c9" strokeWidth="1.5" />
        <circle cx="24" cy="15" r="7.5" fill="none" stroke="#3f9a3a" strokeWidth="1.4" />
        <text x="24" y="20" textAnchor="middle" fontSize="14" fontWeight="700" fill="#2e7d32" fontFamily="system-ui, sans-serif">$</text>
      </svg>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  body,
  green = false,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  green?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 ${
        green
          ? "bg-gradient-to-br from-leaf to-leaf-deep text-white shadow-xl shadow-leaf-deep/20"
          : "border border-forest/10 bg-white shadow-sm hover:shadow-xl hover:shadow-leaf-deep/10"
      } ${className}`}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-lime-300/30 opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
      />
      <div className="relative">
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${
            green ? "bg-white/20 text-white" : "bg-leaf/12 text-leaf-deep ring-1 ring-leaf/30"
          }`}
        >
          {icon}
        </span>
        <h3
          className={`font-display mt-5 text-xl font-bold tracking-tight ${
            green ? "text-white" : "text-forest"
          }`}
        >
          {title}
        </h3>
        <p className={`mt-2 text-sm leading-relaxed ${green ? "text-leaf-soft" : "text-forest/60"}`}>
          {body}
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-white text-forest">
      {/* ============================= NAV ============================= */}
      <header className="sticky top-0 z-50 border-b border-forest/10 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-10 w-10" />
            <span className="font-display text-xl font-bold tracking-tight text-forest">
              Easy Loan Approval
            </span>
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-forest/70 md:flex">
            <a href="#how" className="transition-colors hover:text-leaf-deep">How it works</a>
            <a href="#calculator" className="transition-colors hover:text-leaf-deep">Calculator</a>
            <a href="#faq" className="transition-colors hover:text-leaf-deep">FAQ</a>
            <Link href="/careers" className="transition-colors hover:text-leaf-deep">Careers</Link>
            <Link href="/status" className="transition-colors hover:text-leaf-deep">Check status</Link>
          </nav>

          <Link
            href="/apply"
            className="rounded-full bg-leaf px-5 py-2.5 font-display text-sm font-bold text-white shadow-lg shadow-leaf/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-leaf-deep hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-leaf"
          >
            Apply now
          </Link>
        </div>
      </header>

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-forest text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-0">
          <div className="absolute inset-x-0 -top-40 h-[40rem] bg-[radial-gradient(60%_60%_at_60%_0%,rgba(255,255,255,0.35),transparent_70%)]" />
          <div className="animate-blob-a absolute -left-24 top-32 h-[26rem] w-[26rem] rounded-full bg-white/10 blur-3xl" />
          <div className="animate-blob-b absolute right-[-6rem] bottom-[-6rem] h-[30rem] w-[30rem] rounded-full bg-leaf-deep/40 blur-3xl" />
          <div
            className="absolute inset-0 [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black,transparent)]"
            style={{
              backgroundImage:
                "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
              backgroundSize: "52px 52px",
            }}
          />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-6 pb-24 pt-16 sm:pt-20 lg:grid-cols-2 lg:gap-8">
          {/* copy */}
          <div className="text-center lg:text-left">
            <div className="animate-rise inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-lime-300 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-lime-300" />
              </span>
              Now funding — decisions in under 24 hours
            </div>

            <h1 className="animate-rise font-display mt-6 text-5xl font-bold leading-[0.98] tracking-tight sm:text-6xl lg:text-7xl">
              Money for what matters,{" "}
              <span className="text-lime-300">delivered fast.</span>
            </h1>

            <p className="animate-rise mt-4 font-display text-xl font-bold text-lime-300 sm:text-2xl">
              Personal loans from $500 to $50,000.
            </p>

            <p className="animate-rise mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/90 lg:mx-0 sm:text-xl">
              Apply in under two minutes. No paperwork mountains, no hidden fees
              — just fast, simple loans that fly straight to you.
            </p>

            <ul className="animate-rise mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm font-semibold text-white/90 lg:justify-start">
              {[
                "All credit profiles considered",
                "Secure, encrypted application",
                "One fixed rate — no surprises",
              ].map((item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4 text-lime-300" aria-hidden="true">
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  {item}
                </li>
              ))}
            </ul>

            <div className="animate-rise mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start sm:justify-center">
              <Link
                href="/apply"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-display text-base font-bold text-leaf-deep shadow-xl shadow-leaf-deep/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
              >
                Apply now
                <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
              </Link>
              <a
                href="#calculator"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-white/35 bg-white/10 px-8 py-4 font-display text-base font-bold text-white backdrop-blur-sm transition-all duration-200 hover:border-white/60 hover:bg-white/20"
              >
                Calculate my payment
              </a>
            </div>

            <p className="animate-rise mt-6 text-sm text-white/70">
              2-minute application&ensp;·&ensp;No impact to your credit score
            </p>
          </div>

          {/* animated dove + flying money */}
          <div className="animate-rise relative mx-auto aspect-square w-full max-w-md">
            <div aria-hidden="true" className="animate-glow-pulse absolute inset-10 rounded-full bg-white/40 blur-3xl" />
            <div className="animate-fly relative">
              <BrandLogo className="h-full w-full drop-shadow-[0_24px_48px_rgba(15,42,24,0.45)]" animated />
            </div>
            <MoneyBill className="left-[6%] top-[10%]" delay="0s" size={52} />
            <MoneyBill className="right-[4%] top-[36%]" delay="1.6s" size={42} />
            <MoneyBill className="left-[16%] bottom-[10%]" delay="0.8s" size={46} />
            <MoneyBill className="right-[18%] bottom-[20%]" delay="2.6s" size={36} />
          </div>
        </div>
      </section>

      {/* =========================== STATS ============================ */}
      <section className="bg-leaf-soft">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-y-8 px-6 py-10 sm:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display text-3xl font-bold tracking-tight text-leaf-deep sm:text-4xl">
                {s.value}
              </p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-forest/55">
                {s.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ======================== LOAN OPTIONS ========================= */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 pt-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-leaf">Loan options</p>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
              One application, four ways to use it.
            </h2>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {loanOptions.map((opt) => (
              <div
                key={opt.title}
                className="rounded-3xl border border-forest/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-leaf-deep/10"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-leaf/12 text-leaf-deep ring-1 ring-leaf/30">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
                    {opt.icon}
                  </svg>
                </span>
                <h3 className="font-display mt-4 text-lg font-bold tracking-tight text-forest">
                  {opt.title}
                </h3>
                <p className="mt-1 text-xs font-bold uppercase tracking-wider text-leaf-deep/70">
                  {opt.range}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-forest/60">
                  {opt.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================== FEATURES ========================== */}
      <section className="bg-white">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-sm font-bold uppercase tracking-wider text-leaf">Why Easy Loan Approval</p>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
              Built to feel effortless.
            </h2>
            <p className="mt-4 text-lg text-forest/60">
              Everything that used to make borrowing painful — gone. Here&apos;s
              what you get instead.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              green
              className="lg:col-span-2"
              title="Apply in two minutes flat"
              body="A clean three-step application that remembers what you've entered. Start on your phone, finish on your laptop — no friction, no dead ends."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              }
            />
            <FeatureCard
              title="Bank-level security"
              body="Your information is encrypted in transit, never sold or shared, and never written to our application logs."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <rect width="18" height="11" x="3" y="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
            />
            <FeatureCard
              title="No hidden fees"
              body="The rate you see is the rate you get. No origination surprises, no fine-print traps."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M9.5 9.5a2.5 2.5 0 0 1 4.5 1.5c0 1.5-2.5 2-2.5 3.5M12 17h.01" />
                </svg>
              }
            />
            <FeatureCard
              title="Decisions in 24 hours"
              body="No waiting weeks. Most applicants get an answer the same business day."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 2" />
                </svg>
              }
            />
            <FeatureCard
              title="Real human support"
              body="Chat with a real person whenever you need one — quick answers from our team, not a bot maze."
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      {/* ========================= CALCULATOR ========================= */}
      <section id="calculator" className="scroll-mt-24 bg-leaf-soft py-20">
        <div className="mx-auto mb-10 max-w-3xl px-6 text-center">
          <p className="text-sm font-bold uppercase tracking-wider text-leaf">See it before you apply</p>
          <h2 className="font-display mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
            Know your payment up front.
          </h2>
          <p className="mt-4 text-lg text-forest/60">
            Drag the slider to see exactly what a loan would cost each month —
            no sign-up, no surprises.
          </p>
        </div>
        <LoanCalculator />
      </section>

      {/* ======================= RATES AT A GLANCE ====================== */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-4xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-leaf">Rates at a glance</p>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
              What a loan actually costs.
            </h2>
            <p className="mt-4 text-lg text-forest/60">
              Sample payments at our indicative 9.99% APR over 24 months —
              your actual rate depends on your credit profile.
            </p>
          </div>

          <div className="mt-10 overflow-hidden rounded-3xl border border-forest/10 shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-leaf-soft text-xs font-bold uppercase tracking-wider text-forest/60">
                  <th className="px-6 py-4">Loan amount</th>
                  <th className="px-6 py-4">Term</th>
                  <th className="px-6 py-4">Est. monthly payment</th>
                  <th className="px-6 py-4">Est. total interest</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10">
                {rateRows.map((row) => (
                  <tr key={row.amount}>
                    <td className="px-6 py-4 font-display font-bold text-forest">{row.amount}</td>
                    <td className="px-6 py-4 text-forest/70">24 months</td>
                    <td className="px-6 py-4 font-bold text-leaf-deep">{row.payment}/mo</td>
                    <td className="px-6 py-4 text-forest/70">{row.interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Estimates only. Try the calculator above for your own amount and term.
          </p>
        </div>
      </section>

      {/* ======================== HOW IT WORKS ======================== */}
      <section id="how" className="relative scroll-mt-24 overflow-hidden bg-gradient-to-br from-leaf-deep to-forest text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 -top-24 h-72 bg-[radial-gradient(50%_60%_at_50%_0%,rgba(190,242,100,0.22),transparent_70%)]" />
        <div className="relative mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-lime-300">How it works</p>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
              Three steps to funded.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.n} className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm">
                <span className="font-display bg-gradient-to-br from-lime-300 to-leaf bg-clip-text text-5xl font-bold text-transparent">
                  {step.n}
                </span>
                <h3 className="font-display mt-4 text-xl font-bold tracking-tight text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-leaf-soft">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================ FAQ =============================== */}
      <section id="faq" className="scroll-mt-24 bg-leaf-soft py-24">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <p className="text-sm font-bold uppercase tracking-wider text-leaf">FAQ</p>
            <h2 className="font-display mt-3 text-4xl font-bold tracking-tight text-forest sm:text-5xl">
              Questions, answered.
            </h2>
          </div>

          <div className="mt-12 space-y-3">
            {faqs.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-forest/10 bg-white px-6 py-4 open:shadow-sm"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display font-bold text-forest">
                  {item.q}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5 shrink-0 text-leaf-deep transition-transform duration-200 group-open:rotate-45"
                    aria-hidden="true"
                  >
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </summary>
                <p className="mt-2.5 text-sm leading-relaxed text-forest/60">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* =========================== CTA ============================== */}
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-forest">
        <div aria-hidden="true" className="animate-glow-pulse pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/30 blur-3xl" />
        <MoneyBill className="left-[12%] top-[20%] hidden sm:block" delay="0s" size={44} />
        <MoneyBill className="right-[16%] bottom-[14%] hidden sm:block" delay="1.4s" size={38} />
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center">
          <BrandLogo className="mx-auto h-16 w-16" animated />
          <h2 className="font-display mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl">
            Ready when you are.
          </h2>
          <p className="mt-5 text-lg text-white/90">
            Two minutes now could mean money in your account tomorrow. No
            paperwork. No pressure.
          </p>
          <Link
            href="/apply"
            className="group mt-9 inline-flex items-center justify-center gap-2 rounded-full bg-white px-10 py-4 font-display text-lg font-bold text-leaf-deep shadow-xl shadow-leaf-deep/30 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-2xl"
          >
            Apply now
            <span aria-hidden="true" className="transition-transform duration-200 group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </section>

      {/* ========================== FOOTER =========================== */}
      <footer className="bg-forest text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <BrandLogo className="h-10 w-10" />
                <span className="font-display text-xl font-bold tracking-tight text-white">
                  Easy Loan Approval
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-leaf-soft/70">
                Fast, simple loans for real life. Money for what matters,
                delivered fast.
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-leaf-soft">
              <Link href="/apply" className="transition-colors hover:text-lime-300">Apply</Link>
              <Link href="/status" className="transition-colors hover:text-lime-300">Check status</Link>
              <Link href="/careers" className="transition-colors hover:text-lime-300">Careers</Link>
              <Link href="/privacy" className="transition-colors hover:text-lime-300">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-lime-300">Terms of Service</Link>
            </nav>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-sm text-leaf-soft/60 sm:flex-row">
            <p>© {new Date().getFullYear()} Easy Loan Approval. All rights reserved.</p>
            <p>Applying won&apos;t affect your credit score.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
