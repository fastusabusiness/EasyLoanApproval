"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Turnstile from "@/components/Turnstile";
import {
  ID_TYPES,
  LOAN_PURPOSES,
  US_STATES,
  validateApplication,
  type ApplicationPayload,
  type FieldErrors,
} from "@/lib/validation";

const EMPTY_FORM: ApplicationPayload = {
  fullName: "",
  email: "",
  phone: "",
  address: "",
  state: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  ssn: "",
  idType: "",
  idImage: "",
  amount: "",
  purpose: "",
  purposeDetail: "",
};

const QUICK_AMOUNTS = ["1,000", "5,000", "10,000", "25,000"];

const STEPS = ["Your details", "Review & submit"];

// Which validation errors belong to which step, so Continue only checks the
// fields the user has seen. DOB and SSN are collected on step 1 (alongside
// the review), everything else is on step 0.
const STEP_FIELDS: (keyof FieldErrors)[][] = [
  [
    "fullName", "email", "phone", "address", "state",
    "amount", "purpose", "purposeDetail",
    "idType", "idImage",
  ],
  ["dob", "ssn"],
];

const sectionHeadingClass =
  "font-display text-sm font-bold uppercase tracking-wider text-navy/60";

// Read an image file and re-encode it downscaled to keep the upload small
// (legible IDs stay well under ~500 KB), which also keeps us clear of
// serverless request-body limits. Falls back to the original on any failure.
const MAX_ID_DIMENSION = 1400;

async function fileToDownscaledDataUrl(file: File): Promise<string> {
  const original = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("decode failed"));
    image.src = original;
  });

  let { width, height } = img;
  if (width > MAX_ID_DIMENSION || height > MAX_ID_DIMENSION) {
    const scale = Math.min(MAX_ID_DIMENSION / width, MAX_ID_DIMENSION / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return original;
  ctx.drawImage(img, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.82);
}

const baseInputClass = (hasError: boolean) =>
  `rounded-xl border-2 bg-white px-4 py-3 text-ink placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 ring-red-100 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-navy focus:ring-navy/20 hover:border-slate-300"
  }`;

const inputClass = (hasError: boolean) => `w-full ${baseInputClass(hasError)}`;

const ICON_PATHS: Record<string, React.ReactNode> = {
  user: (
    <>
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </>
  ),
  mail: (
    <>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </>
  ),
  phone: (
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
  ),
  pin: (
    <>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </>
  ),
  lock: (
    <>
      <rect width="18" height="11" x="3" y="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </>
  ),
  check: <path d="M20 6 9 17l-5-5" />,
  idcard: (
    <>
      <rect width="18" height="14" x="3" y="5" rx="2" />
      <circle cx="8.5" cy="11" r="1.8" />
      <path d="M13 9.5h4M13 12.5h4" />
    </>
  ),
};

function Icon({ name, className }: { name: string; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {ICON_PATHS[name]}
    </svg>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="mt-1.5 text-sm font-medium text-red-600">
      {message}
    </p>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm font-bold text-navy">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

export default function ApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState<ApplicationPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [idFileName, setIdFileName] = useState("");
  const [idProcessing, setIdProcessing] = useState(false);

  const topRef = useRef<HTMLDivElement>(null);

  // Pre-fill amount when the user comes from the homepage calculator
  // (e.g. /apply?amount=5000). Skipped silently for malformed values.
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("amount");
    if (!raw) return;
    const cleaned = raw.replace(/[^\d]/g, "");
    if (!cleaned) return;
    const n = Number(cleaned);
    if (n > 0 && n <= 10_000_000) {
      setForm((f) =>
        f.amount ? f : { ...f, amount: n.toLocaleString("en-US") }
      );
    }
  }, []);

  const set = (field: keyof ApplicationPayload) => (value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => {
      if (field.startsWith("dob")) {
        const { dob: _dob, ...rest } = e;
        return rest;
      }
      const { [field]: _cleared, ...rest } = e;
      return rest;
    });
  };

  // Native <input type="date"> always emits/accepts value in YYYY-MM-DD,
  // regardless of how the browser displays it (MM/DD/YYYY for en-US locales)
  // — split it back into the day/month/year fields the payload expects.
  const dobValue =
    form.dobYear && form.dobMonth && form.dobDay
      ? `${form.dobYear.padStart(4, "0")}-${form.dobMonth.padStart(2, "0")}-${form.dobDay.padStart(2, "0")}`
      : "";

  function handleDobChange(value: string) {
    const [year = "", month = "", day = ""] = value.split("-");
    setForm((f) => ({ ...f, dobYear: year, dobMonth: month, dobDay: day }));
    setErrors((e) => {
      const { dob: _dob, ...rest } = e;
      return rest;
    });
  }

  function formatSsn(raw: string): string {
    const digits = raw.replace(/\D/g, "").slice(0, 9);
    const parts = [digits.slice(0, 3), digits.slice(3, 5), digits.slice(5, 9)].filter(
      Boolean
    );
    return parts.join("-");
  }

  async function handleIdFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // let the same file be re-picked after a removal
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((prev) => ({
        ...prev,
        idImage: "Please upload an image file (JPG or PNG).",
      }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        idImage: "Image must be 10 MB or smaller.",
      }));
      return;
    }
    setIdProcessing(true);
    try {
      const dataUrl = await fileToDownscaledDataUrl(file);
      set("idImage")(dataUrl);
      setIdFileName(file.name);
    } catch {
      setErrors((prev) => ({
        ...prev,
        idImage: "We couldn't read that image. Please try another file.",
      }));
    } finally {
      setIdProcessing(false);
    }
  }

  function clearIdImage() {
    set("idImage")("");
    setIdFileName("");
  }

  function errorsForStep(all: FieldErrors, s: number): FieldErrors {
    return Object.fromEntries(
      Object.entries(all).filter(([key]) =>
        STEP_FIELDS[s].includes(key as keyof FieldErrors)
      )
    );
  }

  function stepForErrors(all: FieldErrors): number {
    return STEP_FIELDS.findIndex((fields) =>
      fields.some((f) => all[f] !== undefined)
    );
  }

  function goToStep(next: number) {
    setStep(next);
    setSubmitError(null);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function handleContinue() {
    const { errors: all } = validateApplication(form);
    const own = errorsForStep(all, step);
    if (Object.keys(own).length > 0) {
      setErrors(own);
      return;
    }
    setErrors({});
    goToStep(step + 1);
  }

  async function submitApplication() {
    const { errors: all } = validateApplication(form);
    if (Object.keys(all).length > 0) {
      setErrors(all);
      goToStep(Math.max(stepForErrors(all), 0));
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      // Turnstile injects this hidden input into the form when enabled; absent
      // (empty) when bot protection isn't configured, which the server treats
      // as a no-op.
      const turnstileToken =
        (
          document.querySelector(
            '[name="cf-turnstile-response"]'
          ) as HTMLInputElement | null
        )?.value ?? "";

      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });

      if (res.ok) {
        const { id } = (await res.json()) as { id: string };
        router.push(`/confirmation?id=${encodeURIComponent(id)}`);
        return; // keep the button in its loading state while navigating
      }

      if (res.status === 429) {
        setSubmitError(
          "You've submitted too many applications in a short time. Please wait a minute and try again."
        );
      } else {
        const data = (await res.json().catch(() => null)) as {
          errors?: FieldErrors;
        } | null;
        if (data?.errors) {
          setErrors(data.errors);
          const errStep = stepForErrors(data.errors);
          if (errStep >= 0) goToStep(errStep);
        }
        setSubmitError(
          "We couldn't submit your application. Please check your details and try again."
        );
      }
    } catch {
      setSubmitError(
        "Something went wrong on our end. Please check your connection and try again."
      );
    }
    setSubmitting(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (step < STEPS.length - 1) {
      handleContinue();
    } else {
      void submitApplication();
    }
  }

  const labelClass = "mb-1.5 block text-sm font-bold text-navy";

  const iconField = (icon: string, input: React.ReactNode) => (
    <div className="relative">
      <Icon
        name={icon}
        className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
      />
      {input}
    </div>
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div ref={topRef} className="scroll-mt-24">
        {/* progress */}
        <div className="mb-8">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Step {step + 1} of {STEPS.length}
            </p>
            <p className="font-display text-sm font-bold text-navy">
              {STEPS[step]}
            </p>
          </div>
          <div className="mt-2.5 flex gap-2" aria-hidden="true">
            {STEPS.map((label, i) => (
              <div
                key={label}
                className={`h-2 flex-1 rounded-full transition-colors duration-300 ${
                  i <= step ? "bg-navy" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {step === 0 && (
        <div key="step-0" className="animate-step-in space-y-6">
          <p className={sectionHeadingClass}>Your information</p>
          <div>
            <label htmlFor="fullName" className={labelClass}>
              Full Name
            </label>
            {iconField(
              "user",
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Jane Appleseed"
                value={form.fullName}
                onChange={(e) => set("fullName")(e.target.value)}
                aria-invalid={!!errors.fullName}
                aria-describedby={errors.fullName ? "fullName-error" : undefined}
                className={`${inputClass(!!errors.fullName)} pl-11`}
              />
            )}
            <FieldError id="fullName-error" message={errors.fullName} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="email" className={labelClass}>
                Email
              </label>
              {iconField(
                "mail",
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="jane@example.com"
                  value={form.email}
                  onChange={(e) => set("email")(e.target.value)}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className={`${inputClass(!!errors.email)} pl-11`}
                />
              )}
              <FieldError id="email-error" message={errors.email} />
            </div>

            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone Number
              </label>
              {iconField(
                "phone",
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="(555) 123-4567"
                  value={form.phone}
                  onChange={(e) => set("phone")(e.target.value)}
                  aria-invalid={!!errors.phone}
                  aria-describedby={errors.phone ? "phone-error" : undefined}
                  className={`${inputClass(!!errors.phone)} pl-11`}
                />
              )}
              <FieldError id="phone-error" message={errors.phone} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-[1fr_auto]">
            <div>
              <label htmlFor="address" className={labelClass}>
                Address
              </label>
              {iconField(
                "pin",
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="123 Sunny St, Springfield"
                  value={form.address}
                  onChange={(e) => set("address")(e.target.value)}
                  aria-invalid={!!errors.address}
                  aria-describedby={errors.address ? "address-error" : undefined}
                  className={`${inputClass(!!errors.address)} pl-11`}
                />
              )}
              <FieldError id="address-error" message={errors.address} />
            </div>

            <div>
              <label htmlFor="state" className={labelClass}>
                State
              </label>
              <select
                id="state"
                name="state"
                autoComplete="address-level1"
                value={form.state}
                onChange={(e) => set("state")(e.target.value)}
                aria-invalid={!!errors.state}
                aria-describedby={errors.state ? "state-error" : undefined}
                className={`${baseInputClass(!!errors.state)} w-full font-bold sm:w-28`}
              >
                <option value="">Select</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
              <FieldError id="state-error" message={errors.state} />
            </div>
          </div>

          <p className={`${sectionHeadingClass} pt-2`}>Your loan</p>
          <div>
            <label htmlFor="amount" className={labelClass}>
              Loan Amount Needed
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-display text-lg font-bold text-navy">
                $
              </span>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="5,000"
                value={form.amount}
                onChange={(e) => set("amount")(e.target.value)}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "amount-error" : undefined}
                className={`${inputClass(!!errors.amount)} pl-10 font-display text-lg font-bold`}
              />
            </div>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {QUICK_AMOUNTS.map((qa) => {
                const selected = form.amount === qa;
                return (
                  <button
                    key={qa}
                    type="button"
                    onClick={() => set("amount")(qa)}
                    aria-pressed={selected}
                    className={`rounded-full border-2 px-4 py-1.5 text-sm font-bold transition-all ${
                      selected
                        ? "border-navy bg-navy text-white"
                        : "border-slate-200 text-slate-500 hover:border-navy hover:text-ink"
                    }`}
                  >
                    ${qa}
                  </button>
                );
              })}
            </div>
            <FieldError id="amount-error" message={errors.amount} />
          </div>

          <fieldset>
            <legend className={labelClass}>Loan Purpose</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LOAN_PURPOSES.map((p) => {
                const selected = form.purpose === p;
                return (
                  <label
                    key={p}
                    className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center text-sm font-bold transition-all has-focus-visible:ring-4 has-focus-visible:ring-navy/30 ${
                      selected
                        ? "border-navy bg-navy/10 text-ink shadow-sm"
                        : errors.purpose
                          ? "border-red-300 text-slate-500"
                          : "border-slate-200 text-slate-500 hover:border-navy/60 hover:text-ink"
                    }`}
                  >
                    <input
                      type="radio"
                      name="purpose"
                      value={p}
                      checked={selected}
                      onChange={(e) => set("purpose")(e.target.value)}
                      className="sr-only"
                      aria-describedby={
                        errors.purpose ? "purpose-error" : undefined
                      }
                    />
                    {p}
                  </label>
                );
              })}
            </div>
            <FieldError id="purpose-error" message={errors.purpose} />
          </fieldset>

          <div>
            <label htmlFor="purposeDetail" className={labelClass}>
              Anything else we should know?{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="purposeDetail"
              name="purposeDetail"
              rows={3}
              placeholder="A sentence or two about what the loan is for…"
              value={form.purposeDetail}
              onChange={(e) => set("purposeDetail")(e.target.value)}
              aria-invalid={!!errors.purposeDetail}
              aria-describedby={
                errors.purposeDetail ? "purposeDetail-error" : undefined
              }
              className={`${inputClass(!!errors.purposeDetail)} resize-none`}
            />
            <FieldError id="purposeDetail-error" message={errors.purposeDetail} />
          </div>

          <p className={`${sectionHeadingClass} pt-2`}>Government ID</p>
          <div>
              <fieldset>
                <legend className={labelClass}>ID Type</legend>
                <div className="grid grid-cols-2 gap-2">
                  {ID_TYPES.map((t) => {
                    const selected = form.idType === t;
                    return (
                      <label
                        key={t}
                        className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center text-sm font-bold transition-all has-focus-visible:ring-4 has-focus-visible:ring-navy/30 ${
                          selected
                            ? "border-navy bg-navy/10 text-ink shadow-sm"
                            : errors.idType
                              ? "border-red-300 text-slate-500"
                              : "border-slate-200 text-slate-500 hover:border-navy/60 hover:text-ink"
                        }`}
                      >
                        <input
                          type="radio"
                          name="idType"
                          value={t}
                          checked={selected}
                          onChange={(e) => set("idType")(e.target.value)}
                          className="sr-only"
                          aria-describedby={errors.idType ? "idType-error" : undefined}
                        />
                        {t}
                      </label>
                    );
                  })}
                </div>
                <FieldError id="idType-error" message={errors.idType} />
              </fieldset>

              <div className="mt-5">
                <label className={labelClass}>Upload your ID</label>
                {!form.idImage ? (
                  <label
                    className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 text-center transition-colors ${
                      errors.idImage
                        ? "border-red-400 bg-red-50/40"
                        : "border-slate-300 hover:border-navy hover:bg-navy/10"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleIdFile}
                      className="sr-only"
                      aria-describedby={errors.idImage ? "idImage-error" : "idImage-help"}
                    />
                    <Icon name="idcard" className="h-7 w-7 text-slate-400" />
                    <span className="text-sm font-bold text-navy">
                      {idProcessing ? "Processing…" : "Tap to upload a photo of your ID"}
                    </span>
                    <span className="text-xs text-slate-400">
                      Front of your {form.idType || "ID"} · JPG or PNG
                    </span>
                  </label>
                ) : (
                  <div className="flex items-center gap-4 rounded-xl border-2 border-slate-200 p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={form.idImage}
                      alt="Uploaded ID preview"
                      className="h-16 w-24 shrink-0 rounded-lg object-cover ring-1 ring-navy/10"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="flex items-center gap-1.5 text-sm font-bold text-navy">
                        <Icon name="check" className="h-4 w-4 text-green-600" />
                        ID uploaded
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {idFileName || "Photo selected"}
                      </p>
                      <div className="mt-1.5 flex gap-4 text-xs font-bold">
                        <label className="cursor-pointer text-navy underline-offset-2 hover:underline">
                          Replace
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleIdFile}
                            className="sr-only"
                          />
                        </label>
                        <button
                          type="button"
                          onClick={clearIdImage}
                          className="text-red-600 underline-offset-2 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                <FieldError id="idImage-error" message={errors.idImage} />
                {!errors.idImage && (
                  <p id="idImage-help" className="mt-1.5 text-xs text-slate-400">
                    We use this only to verify your identity.
                  </p>
                )}
              </div>
            </div>
          </div>
      )}

      {step === 1 && (
        <div key="step-1" className="animate-step-in space-y-5">
          <p className="text-sm text-slate-600">
            Almost there — check everything looks right before you submit.
          </p>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <h3 className="font-display font-bold text-ink">
              Verify your identity
            </h3>
            <div className="mt-4">
              <div>
                <label htmlFor="dob" className={labelClass}>
                  Date of Birth
                </label>
                <input
                  id="dob"
                  name="dob"
                  type="date"
                  aria-label="Date of birth (month/day/year)"
                  value={dobValue}
                  onChange={(e) => handleDobChange(e.target.value)}
                  aria-invalid={!!errors.dob}
                  aria-describedby={errors.dob ? "dob-error" : undefined}
                  className={`${baseInputClass(!!errors.dob)} max-w-56`}
                />
                <FieldError id="dob-error" message={errors.dob} />
              </div>

              <div className="mt-5">
                <label htmlFor="ssn" className={labelClass}>
                  Social Security Number
                </label>
                <input
                  id="ssn"
                  name="ssn"
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="123-45-6789"
                  maxLength={11}
                  value={form.ssn}
                  onChange={(e) => set("ssn")(formatSsn(e.target.value))}
                  aria-invalid={!!errors.ssn}
                  aria-describedby={errors.ssn ? "ssn-error" : undefined}
                  className={`${inputClass(!!errors.ssn)} max-w-56`}
                />
                <FieldError id="ssn-error" message={errors.ssn} />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">About you</h3>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="text-sm font-bold text-navy underline-offset-4 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="mt-1 divide-y divide-slate-100">
              <ReviewRow label="Full Name" value={form.fullName} />
              <ReviewRow label="Email" value={form.email} />
              <ReviewRow label="Phone" value={form.phone} />
              <ReviewRow label="Address" value={form.address} />
              <ReviewRow label="State" value={form.state || "—"} />
            </dl>
          </section>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Your loan</h3>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="text-sm font-bold text-navy underline-offset-4 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="mt-1 divide-y divide-slate-100">
              <ReviewRow label="Amount" value={`$${form.amount}`} />
              <ReviewRow label="Purpose" value={form.purpose} />
              {form.purposeDetail.trim() && (
                <ReviewRow label="Details" value={form.purposeDetail.trim()} />
              )}
            </dl>
          </section>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">Government ID</h3>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="text-sm font-bold text-navy underline-offset-4 hover:underline"
              >
                Edit
              </button>
            </div>
            <dl className="mt-1 divide-y divide-slate-100">
              <ReviewRow label="ID Type" value={form.idType || "—"} />
              <ReviewRow label="ID Photo" value={form.idImage ? "Uploaded ✓" : "—"} />
            </dl>
          </section>
        </div>
      )}

      {step === 1 && <Turnstile className="mt-6 flex justify-center" />}

      {submitError && (
        <div
          role="alert"
          className="mt-6 rounded-xl border-2 border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
        >
          {submitError}
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <button
            type="button"
            onClick={() => goToStep(step - 1)}
            disabled={submitting}
            className="rounded-full border-2 border-slate-200 px-7 py-4 font-display font-bold text-navy transition-colors hover:border-navy disabled:cursor-not-allowed disabled:opacity-60"
          >
            Back
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="group flex-1 rounded-full bg-navy px-8 py-4 font-display text-lg font-bold text-white shadow-lg shadow-navy/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-ink hover:shadow-xl hover:shadow-navy/50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
        >
          {submitting ? (
            <span className="inline-flex items-center justify-center gap-2.5">
              <svg
                className="h-5 w-5 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                />
              </svg>
              Submitting…
            </span>
          ) : step < STEPS.length - 1 ? (
            <span className="inline-flex items-center justify-center gap-2">
              Continue
              <span
                aria-hidden="true"
                className="transition-transform duration-200 group-hover:translate-x-1"
              >
                →
              </span>
            </span>
          ) : (
            <span className="inline-flex items-center justify-center gap-2">
              <Icon name="check" className="h-5 w-5" />
              Submit Application
            </span>
          )}
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Your details are encrypted in transit. Applying won&apos;t affect your
        credit score.
      </p>
    </form>
  );
}
