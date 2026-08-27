"use client";

import { useActionState, useRef, useState } from "react";
import Turnstile from "@/components/Turnstile";
import { JOB_ROLES } from "@/lib/career-roles";
import {
  submitCareersApplication,
  type CareersResult,
} from "./actions";

const INITIAL: CareersResult = { state: "idle" };

const inputClass = (hasError: boolean) =>
  `w-full rounded-xl border-2 bg-white px-4 py-3 text-ink placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 ring-red-100 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-sun focus:ring-sun/20 hover:border-slate-300"
  }`;

const labelClass = "mb-1.5 block text-sm font-bold text-navy";

function errorOf(r: CareersResult, field: string): string | undefined {
  return r.state === "error" ? r.errors[field as keyof typeof r.errors] : undefined;
}
function valueOf(r: CareersResult, field: string): string {
  if (r.state === "error" || r.state === "rate_limited") {
    return r.values[field as keyof typeof r.values] ?? "";
  }
  return "";
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

export default function CareersForm({
  defaultRole = "",
}: {
  defaultRole?: string;
}) {
  const [result, action, pending] = useActionState(
    submitCareersApplication,
    INITIAL
  );
  const [resumeFileName, setResumeFileName] = useState<string | null>(null);
  const resumeInputRef = useRef<HTMLInputElement>(null);

  function clearResume() {
    setResumeFileName(null);
    if (resumeInputRef.current) resumeInputRef.current.value = "";
  }

  if (result.state === "success") {
    return (
      <div role="status" className="text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sun text-white">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-7 w-7 text-white"
            aria-hidden="true"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <h3 className="font-display mt-4 text-2xl font-bold text-ink">
          Application sent!
        </h3>
        <p className="mt-2 text-slate-600">
          Thanks for your interest in joining Easy Loan Approval. Our team will review
          your application and reach out if it&apos;s a fit.
        </p>
      </div>
    );
  }

  const roleValue =
    result.state === "error" || result.state === "rate_limited"
      ? result.values.role
      : defaultRole;

  return (
    <form action={action} className="space-y-5">
      <div>
        <label htmlFor="role" className={labelClass}>
          Role you&apos;re applying for
        </label>
        <select
          id="role"
          name="role"
          defaultValue={roleValue}
          className={inputClass(!!errorOf(result, "role"))}
        >
          <option value="" disabled>
            Select a role
          </option>
          {JOB_ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <FieldError message={errorOf(result, "role")} />
      </div>

      <div>
        <label htmlFor="fullName" className={labelClass}>
          Full Name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          autoComplete="name"
          defaultValue={valueOf(result, "fullName")}
          placeholder="Jane Appleseed"
          className={inputClass(!!errorOf(result, "fullName"))}
        />
        <FieldError message={errorOf(result, "fullName")} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={valueOf(result, "email")}
            placeholder="jane@example.com"
            className={inputClass(!!errorOf(result, "email"))}
          />
          <FieldError message={errorOf(result, "email")} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone / WhatsApp
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            defaultValue={valueOf(result, "phone")}
            placeholder="(555) 123-4567"
            className={inputClass(!!errorOf(result, "phone"))}
          />
          <FieldError message={errorOf(result, "phone")} />
        </div>
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          City / Area
        </label>
        <input
          id="location"
          name="location"
          type="text"
          defaultValue={valueOf(result, "location")}
          placeholder="Where are you based?"
          className={inputClass(!!errorOf(result, "location"))}
        />
        <FieldError message={errorOf(result, "location")} />
      </div>

      <div>
        <label htmlFor="experience" className={labelClass}>
          Tell us about your experience{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <textarea
          id="experience"
          name="experience"
          rows={4}
          defaultValue={valueOf(result, "experience")}
          placeholder="Relevant background, skills, and why you'd be a good fit for this role…"
          className={`${inputClass(!!errorOf(result, "experience"))} resize-none`}
        />
        <FieldError message={errorOf(result, "experience")} />
      </div>

      <div>
        <label className={labelClass}>
          Upload your CV / resume{" "}
          <span className="font-normal text-slate-400">(optional)</span>
        </label>
        {!resumeFileName ? (
          <label
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
              errorOf(result, "resume")
                ? "border-red-400 bg-red-50/40"
                : "border-slate-300 hover:border-sun hover:bg-sun-soft/40"
            }`}
          >
            <input
              ref={resumeInputRef}
              type="file"
              name="resume"
              accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              onChange={(e) => setResumeFileName(e.target.files?.[0]?.name ?? null)}
              className="sr-only"
              aria-describedby={
                errorOf(result, "resume") ? "resume-error" : "resume-help"
              }
            />
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-7 w-7 text-slate-400"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6" />
            </svg>
            <span className="text-sm font-bold text-navy">
              Tap to upload your CV
            </span>
            <span className="text-xs text-slate-400">PDF or Word · up to 5 MB</span>
          </label>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border-2 border-slate-200 p-3">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-sun-soft">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-5 w-5 text-sun-deep"
                aria-hidden="true"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4 text-green-600"
                  aria-hidden="true"
                >
                  <path d="M20 6 9 17l-5-5" />
                </svg>
                CV attached
              </p>
              <p className="truncate text-xs text-slate-500">{resumeFileName}</p>
              <button
                type="button"
                onClick={clearResume}
                className="mt-1.5 text-xs font-bold text-red-600 underline-offset-2 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
        <FieldError message={errorOf(result, "resume")} />
        {!errorOf(result, "resume") && (
          <p id="resume-help" className="mt-1.5 text-xs text-slate-400">
            Optional, but it helps us learn more about you.
          </p>
        )}
      </div>

      {result.state === "rate_limited" && (
        <div
          role="alert"
          className="rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          You&apos;ve submitted a few times already. Please wait a minute and
          try again.
        </div>
      )}

      <Turnstile />

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-sun px-8 py-4 font-display text-lg font-bold text-white shadow-lg shadow-sun/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl hover:shadow-sun/50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
      >
        {pending ? "Sending…" : "Apply to join"}
      </button>
    </form>
  );
}
