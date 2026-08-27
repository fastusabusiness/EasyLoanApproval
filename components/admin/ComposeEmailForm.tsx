"use client";

import { useActionState } from "react";
import { sendAdminEmail } from "@/app/admin/email/actions";
import { FROM_ADDRESSES, type SendState } from "@/app/admin/email/addresses";

const INITIAL: SendState = { status: "idle", message: "" };

const fieldClass =
  "w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20";

const rowClass =
  "grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr] sm:items-center sm:gap-4 sm:px-6";

const labelClass = "text-sm font-bold text-navy";

export default function ComposeEmailForm() {
  const [state, formAction, pending] = useActionState(sendAdminEmail, INITIAL);

  return (
    <form
      action={formAction}
      className="mt-6 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-navy/5"
    >
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-ink">
          Compose Email
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {/* From */}
        <div className={rowClass}>
          <label htmlFor="from" className={labelClass}>
            From
          </label>
          <select id="from" name="from" required defaultValue="" className={fieldClass}>
            <option value="" disabled>
              Choose a sender…
            </option>
            {FROM_ADDRESSES.map((address) => (
              <option key={address} value={address}>
                {address}
              </option>
            ))}
          </select>
        </div>

        {/* To */}
        <div className={rowClass}>
          <label htmlFor="to" className={labelClass}>
            To
          </label>
          <input
            id="to"
            name="to"
            type="email"
            required
            autoComplete="off"
            placeholder="recipient@example.com"
            className={fieldClass}
          />
        </div>

        {/* Subject */}
        <div className={rowClass}>
          <label htmlFor="subject" className={labelClass}>
            Subject
          </label>
          <input
            id="subject"
            name="subject"
            type="text"
            required
            maxLength={200}
            placeholder="What is this email about?"
            className={fieldClass}
          />
        </div>

        {/* Message */}
        <div className="grid gap-2 px-5 py-4 sm:grid-cols-[120px_1fr] sm:items-start sm:gap-4 sm:px-6">
          <label htmlFor="message" className={`${labelClass} sm:pt-2.5`}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            maxLength={5000}
            rows={10}
            placeholder="Write your message…"
            className={`${fieldClass} resize-y`}
          />
        </div>
      </div>

      {/* Footer: feedback + send */}
      <div className="flex flex-col gap-3 border-t border-slate-100 bg-leaf-soft/40 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p
          role="status"
          aria-live="polite"
          className={`text-sm font-medium ${
            state.status === "success"
              ? "text-leaf-deep"
              : state.status === "error"
                ? "text-red-600"
                : "text-slate-400"
          }`}
        >
          {state.message ||
            "This sends a real email when Resend is configured."}
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-sun px-6 py-2.5 font-display text-sm font-bold text-white shadow-lg shadow-sun/30 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sun disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {pending ? (
            "Sending…"
          ) : (
            <>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
              Send email
            </>
          )}
        </button>
      </div>
    </form>
  );
}
