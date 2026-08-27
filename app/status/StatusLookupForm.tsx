"use client";

import { useActionState } from "react";
import Turnstile from "@/components/Turnstile";
import { lookupStatus, type LookupResult } from "./actions";
import { STATUS_META } from "@/lib/application-status";

const INITIAL: LookupResult = { state: "idle" };

const inputClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-ink placeholder:text-slate-400 transition-all hover:border-slate-300 focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20";

const money = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });

const submittedAt = (iso: string) =>
  new Date(iso).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

export default function StatusLookupForm() {
  const [result, action, pending] = useActionState(lookupStatus, INITIAL);

  return (
    <>
      <form action={action} className="space-y-5">
        <div>
          <label htmlFor="id" className="mb-1.5 block text-sm font-bold text-navy">
            Application ID
          </label>
          <input
            id="id"
            name="id"
            type="text"
            required
            placeholder="ELA-2026-ABC123"
            autoComplete="off"
            className={`${inputClass} font-mono uppercase tracking-wider`}
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-bold text-navy"
          >
            Email you applied with
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            autoComplete="email"
            className={inputClass}
          />
        </div>

        <Turnstile />

        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-full bg-sun px-8 py-4 font-display text-lg font-bold text-white shadow-lg shadow-sun/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl hover:shadow-sun/50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {pending ? "Checking…" : "Check status"}
        </button>
      </form>

      {result.state === "found" && (
        <div
          role="status"
          className="mt-6 rounded-2xl border-2 border-slate-100 bg-white p-6"
        >
          <p className="font-mono text-xs font-bold tracking-wider text-navy">
            {result.id}
          </p>
          <div className="mt-4 flex items-baseline justify-between gap-4">
            <p className="text-sm font-bold text-slate-400">Current status</p>
            <p
              className={`font-display text-xl font-bold ${STATUS_META[result.status].publicTextClass}`}
            >
              {STATUS_META[result.status].label}
            </p>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            {STATUS_META[result.status].description}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 border-t-2 border-slate-100 pt-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Amount
              </dt>
              <dd className="font-display mt-0.5 font-bold text-ink">
                {money(result.amount)}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Submitted
              </dt>
              <dd className="mt-0.5 font-medium text-ink">
                {submittedAt(result.submittedAt)}
              </dd>
            </div>
          </dl>
        </div>
      )}

      {result.state === "not_found" && (
        <p
          role="alert"
          className="mt-5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          We couldn&apos;t find an application matching that ID and email.
          Double-check both — the ID is case-sensitive and looks like
          <span className="font-mono">{" ELA-YYYY-XXXXXX"}</span>.
        </p>
      )}

      {result.state === "rate_limited" && (
        <p
          role="alert"
          className="mt-5 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          Too many lookups in a short time. Please wait a minute and try
          again.
        </p>
      )}
    </>
  );
}
