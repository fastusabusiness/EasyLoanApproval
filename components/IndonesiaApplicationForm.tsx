"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Turnstile from "@/components/Turnstile";
import {
  EDUCATION_LABELS,
  EDUCATION_LEVELS,
  EMPLOYMENT_STATUSES,
  LOAN_PURPOSES,
  validateApplication,
  type ApplicationPayload,
  type FieldErrors,
} from "@/lib/validation";

// Standalone form for Indonesian applicants — deliberately separate from
// ApplicationForm.tsx (the US form) so nothing here can ever regress the
// original flow. Posts to the same /api/applications route with
// market: "ID"; lib/validation.ts branches on that to apply the right rules.

const EMPTY_FORM: ApplicationPayload = {
  market: "ID",
  fullName: "",
  email: "",
  phone: "",
  address: "",
  state: "",
  postalCode: "",
  education: "",
  employment: "",
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

const QUICK_AMOUNTS = ["1.000.000", "5.000.000", "10.000.000", "25.000.000"];

// Visible labels for the canonical EMPLOYMENT_STATUSES values.
const EMPLOYMENT_LABELS: Record<string, string> = {
  Employed: "Karyawan (Employed)",
  "Self-employed": "Wiraswasta (Self-employed)",
  "Business owner": "Pemilik Usaha (Business Owner)",
  Student: "Pelajar/Mahasiswa (Student)",
  Unemployed: "Tidak Bekerja (Unemployed)",
  Retired: "Pensiunan (Retired)",
};

const STEPS = ["Tentang Anda", "Pinjaman Anda", "Tinjau & Kirim"];

const STEP_FIELDS: (keyof FieldErrors)[][] = [
  ["fullName", "email", "phone", "address", "postalCode", "dob", "education", "employment"],
  ["amount", "purpose", "purposeDetail"],
  [],
];

const baseInputClass = (hasError: boolean) =>
  `rounded-xl border-2 bg-white px-4 py-3 text-ink placeholder:text-slate-400 transition-all focus:outline-none focus:ring-4 ${
    hasError
      ? "border-red-400 ring-red-100 focus:border-red-500 focus:ring-red-100"
      : "border-slate-200 focus:border-sun focus:ring-sun/20 hover:border-slate-300"
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

export default function IndonesiaApplicationForm() {
  const router = useRouter();
  const [form, setForm] = useState<ApplicationPayload>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const topRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("amount");
    if (!raw) return;
    const cleaned = raw.replace(/[^\d]/g, "");
    if (!cleaned) return;
    const n = Number(cleaned);
    if (n > 0 && n <= 10_000_000_000) {
      setForm((f) =>
        f.amount ? f : { ...f, amount: n.toLocaleString("id-ID") }
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

  // Native <input type="date"> always emits/accepts value in YYYY-MM-DD.
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

  function errorsForStep(all: FieldErrors, s: number): FieldErrors {
    return Object.fromEntries(
      Object.entries(all).filter(([key]) =>
        STEP_FIELDS[s].includes(key as keyof FieldErrors)
      )
    );
  }

  function stepForErrors(all: FieldErrors): number {
    const idx = STEP_FIELDS.findIndex((fields) =>
      fields.some((f) => all[f] !== undefined)
    );
    return idx;
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
        return;
      }

      if (res.status === 429) {
        setSubmitError(
          "Anda telah mengirim terlalu banyak permohonan. Silakan tunggu sebentar dan coba lagi. / Too many requests — please wait a minute and try again."
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
          "Permohonan gagal dikirim. Silakan periksa kembali data Anda. / We couldn't submit your application. Please check your details."
        );
      }
    } catch {
      setSubmitError(
        "Terjadi kesalahan. Silakan periksa koneksi Anda. / Something went wrong. Please check your connection."
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
  const bilingual = (id: string, en: string) => (
    <>
      {en} <span className="font-normal text-slate-400">/ {id}</span>
    </>
  );

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
        <div className="mb-8">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Langkah {step + 1} dari {STEPS.length} / Step {step + 1} of{" "}
              {STEPS.length}
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
                  i <= step ? "bg-sun" : "bg-slate-100"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {step === 0 && (
        <div key="step-0" className="animate-step-in space-y-6">
          <div>
            <label htmlFor="fullName" className={labelClass}>
              {bilingual("Nama Lengkap", "Full Name")}
            </label>
            {iconField(
              "user",
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                placeholder="Budi Santoso"
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
                {bilingual("Alamat Email", "Email Address")}
              </label>
              {iconField(
                "mail",
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="budi@contoh.com"
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
                {bilingual("Nomor HP", "Phone Number")}
              </label>
              {iconField(
                "phone",
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  placeholder="+62 812 3456 7890"
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
                {bilingual("Alamat Lengkap", "Full Address")}
              </label>
              {iconField(
                "pin",
                <input
                  id="address"
                  name="address"
                  type="text"
                  autoComplete="street-address"
                  placeholder="Jl. Sudirman No. 25, Jakarta Selatan"
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
              <label htmlFor="postalCode" className={labelClass}>
                {bilingual("Kode Pos", "Postal Code")}
              </label>
              <input
                id="postalCode"
                name="postalCode"
                inputMode="numeric"
                autoComplete="postal-code"
                placeholder="12190"
                maxLength={5}
                value={form.postalCode}
                onChange={(e) =>
                  set("postalCode")(e.target.value.replace(/\D/g, "").slice(0, 5))
                }
                aria-invalid={!!errors.postalCode}
                aria-describedby={
                  errors.postalCode ? "postalCode-error" : undefined
                }
                className={`${baseInputClass(!!errors.postalCode)} w-full text-center font-bold sm:w-32`}
              />
              <FieldError id="postalCode-error" message={errors.postalCode} />
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="dob" className={labelClass}>
                {bilingual("Tanggal Lahir", "Date of Birth")}
              </label>
              <input
                id="dob"
                name="dob"
                type="date"
                aria-label="Date of birth"
                value={dobValue}
                onChange={(e) => handleDobChange(e.target.value)}
                aria-invalid={!!errors.dob}
                aria-describedby={errors.dob ? "dob-error" : undefined}
                className={`${baseInputClass(!!errors.dob)} w-full`}
              />
              <FieldError id="dob-error" message={errors.dob} />
            </div>

            <div>
              <label htmlFor="education" className={labelClass}>
                {bilingual("Pendidikan Terakhir", "Educational Qualification")}
              </label>
              <select
                id="education"
                name="education"
                value={form.education}
                onChange={(e) => set("education")(e.target.value)}
                aria-invalid={!!errors.education}
                aria-describedby={
                  errors.education ? "education-error" : undefined
                }
                className={`${baseInputClass(!!errors.education)} w-full font-bold`}
              >
                <option value="">Pilih / Select</option>
                {EDUCATION_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {EDUCATION_LABELS[level]}
                  </option>
                ))}
              </select>
              <FieldError id="education-error" message={errors.education} />
            </div>
          </div>

          <div>
            <label htmlFor="employment" className={labelClass}>
              {bilingual("Status Pekerjaan", "Employment Status")}
            </label>
            <select
              id="employment"
              name="employment"
              value={form.employment ?? ""}
              onChange={(e) => set("employment")(e.target.value)}
              aria-invalid={!!errors.employment}
              aria-describedby={
                errors.employment ? "employment-error" : undefined
              }
              className={`${baseInputClass(!!errors.employment)} w-full font-bold`}
            >
              <option value="">Pilih / Select</option>
              {EMPLOYMENT_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {EMPLOYMENT_LABELS[s]}
                </option>
              ))}
            </select>
            <FieldError id="employment-error" message={errors.employment} />
          </div>
        </div>
      )}

      {step === 1 && (
        <div key="step-1" className="animate-step-in space-y-6">
          <div>
            <label htmlFor="amount" className={labelClass}>
              {bilingual("Jumlah Pinjaman (Rupiah)", "Loan Amount Needed")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center font-display text-lg font-bold text-navy">
                Rp
              </span>
              <input
                id="amount"
                name="amount"
                inputMode="decimal"
                placeholder="5.000.000"
                value={form.amount}
                onChange={(e) => set("amount")(e.target.value)}
                aria-invalid={!!errors.amount}
                aria-describedby={errors.amount ? "amount-error" : undefined}
                className={`${inputClass(!!errors.amount)} pl-12 font-display text-lg font-bold`}
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
                        ? "border-sun bg-sun text-white"
                        : "border-slate-200 text-slate-500 hover:border-sun hover:text-ink"
                    }`}
                  >
                    Rp {qa}
                  </button>
                );
              })}
            </div>
            <FieldError id="amount-error" message={errors.amount} />
          </div>

          <fieldset>
            <legend className={labelClass}>
              {bilingual("Tujuan Pinjaman", "Loan Purpose")}
            </legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {LOAN_PURPOSES.map((p) => {
                const selected = form.purpose === p;
                return (
                  <label
                    key={p}
                    className={`cursor-pointer rounded-xl border-2 px-3 py-3 text-center text-sm font-bold transition-all has-focus-visible:ring-4 has-focus-visible:ring-sun/30 ${
                      selected
                        ? "border-sun bg-sun-soft text-ink shadow-sm"
                        : errors.purpose
                          ? "border-red-300 text-slate-500"
                          : "border-slate-200 text-slate-500 hover:border-sun/60 hover:text-ink"
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
              {bilingual(
                "Ada yang ingin Anda tambahkan? (opsional)",
                "Anything else we should know? (optional)"
              )}
            </label>
            <textarea
              id="purposeDetail"
              name="purposeDetail"
              rows={3}
              placeholder="Ceritakan sedikit tentang tujuan pinjaman Anda…"
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
        </div>
      )}

      {step === 2 && (
        <div key="step-2" className="animate-step-in space-y-5">
          <p className="text-sm text-slate-600">
            Hampir selesai — periksa kembali data Anda sebelum mengirim. /
            Almost there — check everything before you submit.
          </p>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">
                Tentang Anda / About you
              </h3>
              <button
                type="button"
                onClick={() => goToStep(0)}
                className="text-sm font-bold text-navy underline-offset-4 hover:underline"
              >
                Ubah / Edit
              </button>
            </div>
            <dl className="mt-1 divide-y divide-slate-100">
              <ReviewRow label="Nama / Name" value={form.fullName} />
              <ReviewRow label="Email" value={form.email} />
              <ReviewRow label="Telepon / Phone" value={form.phone} />
              <ReviewRow label="Alamat / Address" value={form.address} />
              <ReviewRow label="Kode Pos / Postal" value={form.postalCode || "—"} />
              <ReviewRow
                label="Pendidikan / Education"
                value={form.education || "—"}
              />
              <ReviewRow
                label="Pekerjaan / Employment"
                value={
                  form.employment
                    ? EMPLOYMENT_LABELS[form.employment] ?? form.employment
                    : "—"
                }
              />
            </dl>
          </section>

          <section className="rounded-2xl border-2 border-slate-100 px-5 py-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-ink">
                Pinjaman Anda / Your loan
              </h3>
              <button
                type="button"
                onClick={() => goToStep(1)}
                className="text-sm font-bold text-navy underline-offset-4 hover:underline"
              >
                Ubah / Edit
              </button>
            </div>
            <dl className="mt-1 divide-y divide-slate-100">
              <ReviewRow label="Jumlah / Amount" value={`Rp ${form.amount}`} />
              <ReviewRow label="Tujuan / Purpose" value={form.purpose} />
              {form.purposeDetail.trim() && (
                <ReviewRow label="Detail" value={form.purposeDetail.trim()} />
              )}
            </dl>
          </section>
        </div>
      )}

      {step === 2 && <Turnstile className="mt-6 flex justify-center" />}

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
            Kembali / Back
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="group flex-1 rounded-full bg-sun px-8 py-4 font-display text-lg font-bold text-white shadow-lg shadow-sun/40 transition-all duration-200 hover:-translate-y-0.5 hover:bg-sun-deep hover:shadow-xl hover:shadow-sun/50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-navy disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
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
              Mengirim… / Submitting…
            </span>
          ) : step < STEPS.length - 1 ? (
            <span className="inline-flex items-center justify-center gap-2">
              Lanjut / Continue
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
              Kirim Permohonan / Submit
            </span>
          )}
        </button>
      </div>

      <p className="mt-6 flex items-center justify-center gap-1.5 text-xs text-slate-400">
        <Icon name="lock" className="h-3.5 w-3.5" />
        Data Anda aman. Permohonan tidak memengaruhi skor kredit Anda. / Your
        details are secure. Applying won&apos;t affect your credit score.
      </p>
    </form>
  );
}
