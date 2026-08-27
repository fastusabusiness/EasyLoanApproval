import Link from "next/link";
import BrandLogo from "@/components/BrandLogo";
import LoanCalculator from "@/components/LoanCalculator";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const trustStats = [
  { value: "$240M+", label: "Funded" },
  { value: "120K+", label: "Approved" },
  { value: "<24H", label: "Decision" },
  { value: "4.9/5", label: "Rated" },
];

const ledgerRows = [
  {
    title: "Personal Loans",
    range: "$500 – $50,000",
    body: "Bills, a move, a big purchase, or just breathing room.",
    icon: <path d="M12 2 3 14h9l-1 8 10-12h-9l1-8z" />,
  },
  {
    title: "Business Loans",
    range: "$1,000 – $50,000",
    body: "Payroll, inventory, or equipment — without weeks on a bank.",
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
    body: "Repairs, renovations, upgrades — funded before the contractor starts.",
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
    body: "A repair, a used-car gap, or anything that doesn't fit a category.",
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

const stamps = [
  {
    mark: "1",
    title: "Applied",
    body: "A short form — your details and one photo ID. About two minutes.",
  },
  {
    mark: "2",
    title: "Reviewed",
    body: "We read your full picture, not just a score. Most reviews finish same-day.",
  },
  {
    mark: "3",
    title: "Approved",
    body: "Funds land in your account, on the exact terms you were quoted.",
  },
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
/* Signature element                                                   */
/* ------------------------------------------------------------------ */

// The page's one memorable mark: a circular ink stamp, curved text top and
// bottom, a checkmark at center — "approval" made literal rather than
// illustrated as speed (no flying cash, no motion-blurred mascot). Single
// color via currentColor so it reads as stamped ink wherever it's placed.
function ApprovalStamp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 240 240" className={className} aria-hidden="true">
      <defs>
        <path id="stampTopArc" d="M 28 122 A 92 92 0 0 1 212 122" />
        <path id="stampBottomArc" d="M 212 122 A 92 92 0 0 1 28 122" />
      </defs>
      <circle
        cx="120" cy="122" r="113"
        fill="none" stroke="currentColor" strokeWidth="2.5"
        strokeDasharray="1.5 8" strokeLinecap="round" opacity="0.7"
      />
      <circle cx="120" cy="122" r="98" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="120" cy="122" r="87" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.55" />
      <text fontSize="16.5" fontWeight="800" letterSpacing="2.5" fill="currentColor">
        <textPath href="#stampTopArc" startOffset="50%" textAnchor="middle">
          EASY LOAN APPROVAL
        </textPath>
      </text>
      <text fontSize="11" fontWeight="700" letterSpacing="3.5" fill="currentColor" opacity="0.8">
        <textPath href="#stampBottomArc" startOffset="50%" textAnchor="middle">
          VERIFIED · DECIDED · FUNDED
        </textPath>
      </text>
      <circle cx="120" cy="122" r="47" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.45" />
      <path
        d="M96 124 L113 141 L147 101"
        fill="none" stroke="currentColor" strokeWidth="9"
        strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Small pieces                                                        */
/* ------------------------------------------------------------------ */

function LedgerRow({
  icon,
  title,
  range,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  range: string;
  body: string;
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] items-start gap-4 border-t border-paper-line/80 py-6 sm:grid-cols-[auto_1fr_auto] sm:items-center sm:gap-6">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-navy/15 text-navy">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
          {icon}
        </svg>
      </span>
      <div>
        <h3 className="font-serif text-xl font-semibold tracking-tight text-ink">{title}</h3>
        <p className="mt-1 max-w-md text-sm leading-relaxed text-ink/60">{body}</p>
      </div>
      <p className="font-ledger text-sm font-medium text-leaf-deep sm:text-right sm:text-base">
        {range}
      </p>
    </div>
  );
}

function StampBadge({ mark, title, body, last = false }: { mark: string; title: string; body: string; last?: boolean }) {
  return (
    <div className="relative flex flex-1 flex-col items-start gap-3">
      <div className="flex items-center gap-3">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-leaf-deep font-serif text-lg font-bold text-leaf-deep">
          {mark}
        </span>
        {!last && (
          <span
            aria-hidden="true"
            className="hidden h-px flex-1 border-t-2 border-dotted border-paper-line sm:block"
            style={{ minWidth: "2rem" }}
          />
        )}
      </div>
      <h3 className="font-serif text-lg font-semibold tracking-tight text-ink">{title}</h3>
      <p className="max-w-[22rem] text-sm leading-relaxed text-ink/60">{body}</p>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <main className="min-h-screen bg-paper text-ink">
      {/* ============================= NAV ============================= */}
      <header className="sticky top-0 z-50 border-b border-paper-line bg-paper/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3.5">
          <Link href="/" className="flex items-center gap-2.5">
            <BrandLogo className="h-9 w-9" />
            <span className="font-serif text-lg font-semibold tracking-tight text-ink">
              Easy Loan Approval
            </span>
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-medium text-ink/65 md:flex">
            <a href="#ledger" className="transition-colors hover:text-navy">The ledger</a>
            <a href="#how" className="transition-colors hover:text-navy">How it works</a>
            <a href="#calculator" className="transition-colors hover:text-navy">Calculator</a>
            <a href="#faq" className="transition-colors hover:text-navy">FAQ</a>
            <Link href="/careers" className="transition-colors hover:text-navy">Careers</Link>
            <Link href="/status" className="transition-colors hover:text-navy">Check status</Link>
          </nav>

          <Link
            href="/apply"
            className="inline-flex items-center gap-1.5 rounded-full bg-leaf px-5 py-2.5 font-semibold text-white shadow-sm transition-colors hover:bg-leaf-deep"
          >
            Apply now
          </Link>
        </div>
      </header>

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 sm:py-28 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3.5 py-1.5 font-ledger text-xs font-medium uppercase tracking-wider text-white/80">
              <span className="h-1.5 w-1.5 rounded-full bg-leaf-bright" aria-hidden="true" />
              Decisions in under 24 hours
            </span>

            <h1 className="font-serif mt-6 text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl">
              A clear yes.
              <br />
              <span className="italic font-semibold text-leaf-bright">Not a runaround.</span>
            </h1>

            <p className="mt-6 max-w-lg text-lg leading-relaxed text-white/75">
              Every application gets a real decision — not a maze of forms,
              not a maybe. All credit profiles considered, and checking your
              rate never touches your score.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/apply"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-navy shadow-lg transition-transform hover:-translate-y-0.5"
              >
                Apply now
                <span aria-hidden="true">→</span>
              </Link>
              <a
                href="#calculator"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-7 py-3.5 font-semibold text-white transition-colors hover:bg-white/10"
              >
                See my payment
              </a>
            </div>

            <dl className="font-ledger mt-10 flex flex-wrap gap-x-8 gap-y-3 border-t border-white/15 pt-6 text-xs uppercase tracking-wider text-white/60">
              {trustStats.map((s) => (
                <div key={s.label} className="flex items-baseline gap-2">
                  <dt className="text-base font-semibold text-white">{s.value}</dt>
                  <dd>{s.label}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative h-[19rem] w-[19rem] sm:h-[24rem] sm:w-[24rem]">
              <ApprovalStamp className="animate-stamp-drop h-full w-full text-leaf-bright drop-shadow-[0_18px_40px_rgba(0,0,0,0.35)]" />
            </div>
          </div>
        </div>
      </section>

      {/* ========================== THE LEDGER ========================== */}
      <section id="ledger" className="scroll-mt-24 border-b border-paper-line bg-paper">
        <div className="mx-auto max-w-4xl px-6 py-20 sm:py-24">
          <p className="font-ledger text-xs font-semibold uppercase tracking-[0.15em] text-leaf-deep">
            The ledger
          </p>
          <h2 className="font-serif mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Four ways to borrow. Nothing hidden.
          </h2>
          <p className="mt-3 max-w-xl text-ink/60">
            Every rate is fixed and shown up front — what you&apos;re quoted
            is what you pay.
          </p>

          <div className="mt-4">
            {ledgerRows.map((row) => (
              <LedgerRow key={row.title} {...row} />
            ))}
            <div className="border-t border-paper-line/80" />
          </div>

          <div className="mt-16 overflow-hidden rounded-2xl border border-paper-line bg-white">
            <div className="border-b border-paper-line px-6 py-4">
              <p className="text-sm font-semibold text-ink">
                Sample monthly payments
              </p>
              <p className="text-xs text-ink/50">
                Illustrative at 9.99% APR over 24 months — your actual rate
                depends on your profile.
              </p>
            </div>
            <table className="font-ledger w-full text-sm">
              <thead>
                <tr className="border-b border-paper-line text-left text-xs uppercase tracking-wider text-ink/45">
                  <th className="px-6 py-3 font-medium">Amount</th>
                  <th className="px-6 py-3 font-medium">Monthly</th>
                  <th className="px-6 py-3 font-medium">Total interest</th>
                </tr>
              </thead>
              <tbody>
                {rateRows.map((row) => (
                  <tr key={row.amount} className="border-b border-paper-line/70 last:border-0">
                    <td className="px-6 py-3.5 font-semibold text-ink">{row.amount}</td>
                    <td className="px-6 py-3.5 text-ink/75">{row.payment}</td>
                    <td className="px-6 py-3.5 text-ink/75">{row.interest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================ PROCESS =========================== */}
      <section id="how" className="scroll-mt-24 bg-white">
        <div className="mx-auto max-w-5xl px-6 py-20 sm:py-24">
          <p className="font-ledger text-xs font-semibold uppercase tracking-[0.15em] text-leaf-deep">
            How approval works
          </p>
          <h2 className="font-serif mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Three stamps, then it&apos;s funded.
          </h2>

          <div className="mt-14 flex flex-col gap-10 sm:flex-row sm:gap-6">
            {stamps.map((s, i) => (
              <StampBadge key={s.title} {...s} last={i === stamps.length - 1} />
            ))}
          </div>
        </div>
      </section>

      {/* =========================== CALCULATOR ========================== */}
      {/* LoanCalculator brings its own heading/card (and a small -mt-4 that
          was designed to tuck under a hero) — no extra label here to avoid
          a redundant, overlapping eyebrow above it. */}
      <section id="calculator" className="scroll-mt-24 bg-paper pt-8 sm:pt-10">
        <LoanCalculator />
      </section>

      {/* ============================== FAQ =============================== */}
      <section id="faq" className="scroll-mt-24 border-t border-paper-line bg-white">
        <div className="mx-auto max-w-3xl px-6 py-20 sm:py-24">
          <p className="font-ledger text-xs font-semibold uppercase tracking-[0.15em] text-leaf-deep">
            The fine print, made plain
          </p>
          <h2 className="font-serif mt-3 text-4xl font-medium tracking-tight text-ink sm:text-5xl">
            Questions, answered straight.
          </h2>

          <div className="mt-10">
            {faqs.map((f, i) => (
              <details
                key={f.q}
                className="group border-t border-paper-line py-5 last:border-b"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4">
                  <span className="flex gap-4">
                    <span className="font-ledger shrink-0 pt-0.5 text-xs font-semibold text-leaf-deep">
                      §{String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="font-serif text-lg font-medium text-ink">{f.q}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className="mt-1 shrink-0 text-ink/40 transition-transform group-open:rotate-45"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
                      <path d="M12 5v14M5 12h14" />
                    </svg>
                  </span>
                </summary>
                <p className="mt-3 pl-9 text-sm leading-relaxed text-ink/60">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ========================= CLOSING BAND ========================= */}
      <section className="bg-navy">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-14 sm:flex-row sm:items-center">
          <h2 className="font-serif text-3xl font-medium tracking-tight text-white">
            Ready when you are.
          </h2>
          <Link
            href="/apply"
            className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-7 py-3.5 font-semibold text-navy shadow-lg transition-transform hover:-translate-y-0.5"
          >
            Apply now — about two minutes
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      {/* ========================== FOOTER =========================== */}
      <footer className="bg-forest text-white">
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="flex flex-col gap-10 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-xs">
              <div className="flex items-center gap-2.5">
                <BrandLogo className="h-9 w-9" />
                <span className="font-serif text-lg font-semibold text-white">
                  Easy Loan Approval
                </span>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-white/60">
                A clear yes, plainly priced — not a runaround.
              </p>
            </div>

            <nav className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm font-medium text-white/75">
              <Link href="/apply" className="transition-colors hover:text-leaf-bright">Apply</Link>
              <Link href="/status" className="transition-colors hover:text-leaf-bright">Check status</Link>
              <Link href="/careers" className="transition-colors hover:text-leaf-bright">Careers</Link>
              <Link href="/privacy" className="transition-colors hover:text-leaf-bright">Privacy Policy</Link>
              <Link href="/terms" className="transition-colors hover:text-leaf-bright">Terms of Service</Link>
            </nav>
          </div>

          <div className="font-ledger mt-12 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row">
            <p>© {new Date().getFullYear()} Easy Loan Approval. All rights reserved.</p>
            <p>Applying won&apos;t affect your credit score.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
