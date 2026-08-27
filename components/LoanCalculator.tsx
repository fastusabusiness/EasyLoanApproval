"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// Indicative APR for the homepage calculator — used purely for illustration.
// Real applications get a personalized rate; this is shown alongside a
// "Final rate depends on credit profile" disclaimer below the readout.
const SAMPLE_APR = 0.0999;
const MIN_AMOUNT = 100;
const MAX_AMOUNT = 50_000;
const STEP = 100;

const TERMS = [
  { months: 12, label: "12 mo" },
  { months: 24, label: "24 mo" },
  { months: 36, label: "36 mo" },
] as const;

function monthlyPayment(principal: number, apr: number, months: number) {
  const r = apr / 12;
  if (r === 0) return principal / months;
  return (principal * r) / (1 - Math.pow(1 + r, -months));
}

function useAnimatedNumber(target: number, durationMs = 350): number {
  const [display, setDisplay] = useState(target);
  const displayRef = useRef(target);
  displayRef.current = display;

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(target);
      return;
    }

    const from = displayRef.current;
    if (from === target) return;
    const start = performance.now();
    let rafId = 0;
    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(from + (target - from) * eased);
      if (t < 1) rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, durationMs]);

  return display;
}

const money0 = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const money2 = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export default function LoanCalculator() {
  const [amount, setAmount] = useState(5_000);
  const [months, setMonths] = useState<number>(24);

  const target = monthlyPayment(amount, SAMPLE_APR, months);
  const animated = useAnimatedNumber(target);
  const animatedAmount = useAnimatedNumber(amount);

  const progress = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;
  const totalInterest = target * months - amount;

  return (
    <section className="relative z-10 mx-auto -mt-4 mb-24 max-w-3xl px-4 sm:mb-32 sm:px-6">
      <div className="rounded-3xl bg-white p-6 shadow-2xl shadow-leaf-deep/10 ring-1 ring-leaf-deep/5 sm:p-10">
        <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-leaf-deep/60">
              Loan calculator
            </p>
            <h2 className="font-display mt-1 text-2xl font-bold tracking-tight text-forest sm:text-3xl">
              See your monthly payment
            </h2>
          </div>
          <p className="text-sm font-medium text-slate-500 sm:text-right">
            Indicative at{" "}
            <span className="font-bold text-leaf-deep">
              {(SAMPLE_APR * 100).toFixed(2)}% APR
            </span>
          </p>
        </div>

        <div className="mt-8">
          <div className="flex items-baseline justify-between">
            <label
              htmlFor="calc-amount"
              className="text-sm font-bold text-leaf-deep"
            >
              How much do you need?
            </label>
            <span
              className="font-display text-xl font-bold tabular-nums text-forest"
              aria-live="polite"
            >
              {money0(Math.round(animatedAmount))}
            </span>
          </div>
          <input
            id="calc-amount"
            type="range"
            min={MIN_AMOUNT}
            max={MAX_AMOUNT}
            step={STEP}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            aria-label="Loan amount"
            className="brand-slider mt-4"
            style={{ ["--progress" as string]: progress }}
          />
          <div className="mt-2 flex justify-between text-xs font-medium text-slate-400">
            <span>{money0(MIN_AMOUNT)}</span>
            <span>{money0(MAX_AMOUNT)}</span>
          </div>
        </div>

        <fieldset className="mt-7">
          <legend className="mb-3 text-sm font-bold text-leaf-deep">
            Over how long?
          </legend>
          <div className="grid grid-cols-3 gap-2">
            {TERMS.map((t) => {
              const selected = months === t.months;
              return (
                <label
                  key={t.months}
                  className={`cursor-pointer rounded-xl border-2 py-3 text-center font-display text-base font-bold transition-all ${
                    selected
                      ? "border-leaf bg-leaf-soft text-forest shadow-sm"
                      : "border-slate-200 text-slate-500 hover:border-leaf/60 hover:text-forest"
                  }`}
                >
                  <input
                    type="radio"
                    name="calc-term"
                    value={t.months}
                    checked={selected}
                    onChange={() => setMonths(t.months)}
                    className="sr-only"
                  />
                  {t.label}
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mt-8 grid items-end gap-6 rounded-2xl bg-gradient-to-br from-leaf-soft to-white p-6 sm:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm font-bold text-leaf-deep/70">
              Estimated monthly payment
            </p>
            <p
              className="font-display mt-1 text-5xl font-bold tabular-nums text-forest sm:text-6xl"
              aria-live="polite"
            >
              {money2(animated)}
            </p>
            <p className="mt-2 text-xs font-medium text-slate-500">
              Over {months} months · Total interest ≈{" "}
              <span className="font-bold text-leaf-deep">
                {money0(Math.max(0, totalInterest))}
              </span>
            </p>
          </div>
          <Link
            href={`/apply?amount=${amount}`}
            className="group inline-flex items-center justify-center gap-2 rounded-full bg-leaf px-7 py-4 font-display text-base font-bold text-white shadow-lg shadow-leaf/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-leaf-deep hover:shadow-xl hover:shadow-leaf/50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-leaf-deep"
          >
            Apply for {money0(amount)}
            <span
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-1"
            >
              →
            </span>
          </Link>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Estimate only. Final rate and payment depend on your credit profile.
        </p>
      </div>
    </section>
  );
}
