"use client";

import { useActionState } from "react";
import { recordDecision, type ActionState } from "@/app/admin/actions";
import { currencySymbol } from "@/lib/currency";

const INITIAL: ActionState = { ok: false, message: "" };

const fieldClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20";
const labelClass = "mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-400";

export default function DecisionForm({
  id,
  approvedAmount,
  apr,
  termMonths,
  disbursedAt,
  currency = "USD",
}: {
  id: string;
  approvedAmount: number | null;
  apr: number | null;
  termMonths: number | null;
  disbursedAt: string | null;
  currency?: string;
}) {
  const [state, formAction, pending] = useActionState(recordDecision, INITIAL);

  return (
    <form action={formAction} className="mt-4 space-y-4">
      <input type="hidden" name="id" value={id} />
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="approvedAmount" className={labelClass}>
            Approved amount ({currencySymbol(currency)})
          </label>
          <input
            id="approvedAmount"
            name="approvedAmount"
            inputMode="decimal"
            defaultValue={approvedAmount ?? ""}
            placeholder="5000"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="apr" className={labelClass}>
            APR (%)
          </label>
          <input
            id="apr"
            name="apr"
            inputMode="decimal"
            defaultValue={apr ?? ""}
            placeholder="9.99"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="termMonths" className={labelClass}>
            Term (months)
          </label>
          <input
            id="termMonths"
            name="termMonths"
            inputMode="numeric"
            defaultValue={termMonths ?? ""}
            placeholder="24"
            className={fieldClass}
          />
        </div>
        <div>
          <label htmlFor="disbursedAt" className={labelClass}>
            Disbursement date
          </label>
          <input
            id="disbursedAt"
            name="disbursedAt"
            type="date"
            defaultValue={disbursedAt ?? ""}
            className={fieldClass}
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-sun px-6 py-2.5 font-display text-sm font-bold text-white shadow-lg shadow-sun/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save decision"}
        </button>
        {state.message && (
          <span
            role="status"
            className={`text-sm font-medium ${state.ok ? "text-leaf-deep" : "text-red-600"}`}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
