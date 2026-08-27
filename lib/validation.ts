// Shared validation rules — used by the client form for instant feedback and
// re-run on the server so the API never trusts the browser.

export const LOAN_PURPOSES = [
  "Personal",
  "Business",
  "Home",
  "Auto",
  "Education",
  "Other",
] as const;

export type LoanPurpose = (typeof LOAN_PURPOSES)[number];

export const ID_TYPES = ["Driver's License", "State ID"] as const;

export type IdType = (typeof ID_TYPES)[number];

export const MARKETS = ["US", "ID", "BR", "MM", "MX"] as const;

export type Market = (typeof MARKETS)[number];

export const MARKET_META: Record<Market, { label: string; flag: string }> = {
  US: { label: "United States", flag: "🇺🇸" },
  ID: { label: "Indonesia", flag: "🇮🇩" },
  BR: { label: "Brazil", flag: "🇧🇷" },
  MM: { label: "Myanmar", flag: "🇲🇲" },
  MX: { label: "Mexico", flag: "🇲🇽" },
};

// One currency per non-US market. US applicants never send a market at all.
export const MARKET_CURRENCY: Record<Market, string> = {
  US: "USD",
  ID: "IDR",
  BR: "BRL",
  MM: "MMK",
  MX: "MXN",
};

// Indonesian education levels (Pendidikan Terakhir), stored as the short code.
export const EDUCATION_LEVELS_ID = [
  "SD",
  "SMP",
  "SMA/SMK",
  "D3",
  "S1",
  "S2",
  "S3",
] as const;

export const EDUCATION_LABELS_ID: Record<
  (typeof EDUCATION_LEVELS_ID)[number],
  string
> = {
  SD: "SD (Elementary)",
  SMP: "SMP (Junior High)",
  "SMA/SMK": "SMA/SMK (Senior High)",
  D3: "D3 (Diploma)",
  S1: "S1 (Bachelor's)",
  S2: "S2 (Master's)",
  S3: "S3 (Doctorate)",
};

// Brazilian education levels (Escolaridade).
export const EDUCATION_LEVELS_BR = [
  "Fundamental",
  "Médio",
  "Técnico",
  "Superior",
  "Pós-graduação",
  "Mestrado",
  "Doutorado",
] as const;

export const EDUCATION_LABELS_BR: Record<
  (typeof EDUCATION_LEVELS_BR)[number],
  string
> = {
  Fundamental: "Ensino Fundamental (Elementary)",
  Médio: "Ensino Médio (High School)",
  Técnico: "Técnico (Technical)",
  Superior: "Superior (Bachelor's)",
  "Pós-graduação": "Pós-graduação (Postgraduate)",
  Mestrado: "Mestrado (Master's)",
  Doutorado: "Doutorado (Doctorate)",
};

// Myanmar education levels.
export const EDUCATION_LEVELS_MM = [
  "Primary",
  "Middle School",
  "High School",
  "Diploma",
  "Bachelor's",
  "Master's",
  "Doctorate",
] as const;

export const EDUCATION_LABELS_MM: Record<
  (typeof EDUCATION_LEVELS_MM)[number],
  string
> = {
  Primary: "Primary School",
  "Middle School": "Middle School",
  "High School": "High School",
  Diploma: "Diploma",
  "Bachelor's": "Bachelor's Degree",
  "Master's": "Master's Degree",
  Doctorate: "Doctorate",
};

// Mexican education levels (Escolaridad).
export const EDUCATION_LEVELS_MX = [
  "Primaria",
  "Secundaria",
  "Preparatoria",
  "Técnico",
  "Licenciatura",
  "Maestría",
  "Doctorado",
] as const;

export const EDUCATION_LABELS_MX: Record<
  (typeof EDUCATION_LEVELS_MX)[number],
  string
> = {
  Primaria: "Primaria (Elementary)",
  Secundaria: "Secundaria (Middle School)",
  Preparatoria: "Preparatoria (High School)",
  Técnico: "Técnico (Technical)",
  Licenciatura: "Licenciatura (Bachelor's)",
  Maestría: "Maestría (Master's)",
  Doctorado: "Doctorado (Doctorate)",
};

// Kept for backward compatibility with existing imports (Indonesia's form).
export const EDUCATION_LEVELS = EDUCATION_LEVELS_ID;
export const EDUCATION_LABELS = EDUCATION_LABELS_ID;
export type EducationLevel = (typeof EDUCATION_LEVELS_ID)[number];

// Employment status for non-US applicants. Unlike education (whose
// vocabulary differs per country), the statuses are the same everywhere,
// so we store one canonical English value and let each form translate
// the visible label.
export const EMPLOYMENT_STATUSES = [
  "Employed",
  "Self-employed",
  "Business owner",
  "Student",
  "Unemployed",
  "Retired",
] as const;

export type EmploymentStatus = (typeof EMPLOYMENT_STATUSES)[number];

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "DC", "FL",
  "GA", "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME",
  "MD", "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH",
  "NJ", "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI",
  "SC", "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export type UsState = (typeof US_STATES)[number];

export interface ApplicationPayload {
  // "US" (default, and the only value the original US form ever sends) or
  // "ID" — which form variant / field set applies. Optional so the
  // US form's payload shape is untouched; validateApplication() treats a
  // missing market as "US".
  market?: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  state: string; // US only
  postalCode?: string; // non-US only
  education?: string; // non-US only
  employment?: string; // non-US only; canonical EMPLOYMENT_STATUSES value
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  ssn: string; // US only; stored unencrypted, no encryption needed
  idType: string; // US only
  idImage: string; // US only; data URL of the uploaded ID photo
  amount: string;
  purpose: string;
  purposeDetail: string;
}

export type FieldErrors = Partial<
  Record<keyof ApplicationPayload | "dob", string>
>;

export interface ValidatedApplication {
  market: Market;
  currency: string; // derived from market via MARKET_CURRENCY, never client-supplied
  fullName: string;
  email: string;
  phone: string;
  address: string;
  state: UsState | null; // US applicants only
  postalCode: string | null; // non-US applicants only
  education: string | null; // non-US applicants only
  employment: EmploymentStatus | null; // non-US applicants only
  dateOfBirth: Date;
  ssn: string | null; // US only; stored as-is, unencrypted
  idType: IdType | null; // US only
  idImage: string | null; // US only; data URL, stored as-is (no encryption)
  amount: number;
  purpose: LoanPurpose;
  purposeDetail: string | null;
}

const MAX_ID_IMAGE_CHARS = 7_000_000; // ~5 MB once base64-encoded

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

// Loan amount limits, per market currency. These are placeholder ranges —
// review against actual lending limits before relying on them.
const AMOUNT_LIMITS: Record<Market, { min: number; max: number; label: string }> = {
  US: { min: 100, max: 10_000_000, label: "$100" },
  ID: { min: 500_000, max: 1_000_000_000, label: "Rp 500.000" }, // Rp 500rb – 1 miliar
  BR: { min: 500, max: 5_000_000, label: "R$ 500" },
  MM: { min: 100_000, max: 500_000_000, label: "K 100,000" },
  MX: { min: 1_000, max: 5_000_000, label: "$1,000" },
};

// Postal code format, per non-US market. Falls back to "at least 3
// characters" for any market not listed here.
const POSTAL_CODE_PATTERNS: Partial<Record<Market, RegExp>> = {
  ID: /^\d{5}$/, // kode pos: 5 digits
  BR: /^\d{5}-?\d{3}$/, // CEP: 00000-000 or 00000000
  MM: /^\d{5}$/, // 5 digits
  MX: /^\d{5}$/, // código postal: 5 digits
};

export function validateApplication(input: ApplicationPayload): {
  errors: FieldErrors;
  values: ValidatedApplication | null;
} {
  const errors: FieldErrors = {};

  // The original US form never sends `market` at all — a missing value
  // defaults to "US" so its validation is completely unaffected. Every
  // non-US market shares the same "postal code + education, no SSN/ID"
  // field set; only currency, postal format, and amount limits differ.
  const rawMarket = input.market;
  const isValidMarket =
    rawMarket !== undefined && (MARKETS as readonly string[]).includes(rawMarket);
  if (rawMarket !== undefined && !isValidMarket) {
    errors.market = "Please select your location.";
  }
  const market: Market = isValidMarket ? (rawMarket as Market) : "US";
  const isUS = market === "US";

  const fullName = input.fullName.trim();
  if (fullName.length < 2) {
    errors.fullName = "Please enter your full name.";
  } else if (fullName.length > 100) {
    errors.fullName = "Name must be 100 characters or fewer.";
  }

  const email = input.email.trim();
  if (!email) {
    errors.email = "Please enter your email address.";
  } else if (!EMAIL_RE.test(email) || email.length > 254) {
    errors.email = "Please enter a valid email address.";
  }

  const phone = input.phone.trim();
  const digitCount = phone.replace(/\D/g, "").length;
  if (!phone) {
    errors.phone = "Please enter your phone number.";
  } else if (!PHONE_RE.test(phone) || digitCount < 7 || digitCount > 15) {
    errors.phone = "Please enter a valid phone number.";
  }

  const address = input.address.trim();
  if (address.length < 5) {
    errors.address = "Please enter your full address.";
  } else if (address.length > 300) {
    errors.address = "Address must be 300 characters or fewer.";
  }

  // Market-specific location fields: the US uses a state; every other
  // market uses a postal code + education level. Each market's own form
  // constrains the actual education options via its dropdown, so here we
  // only check it was filled in — the specific vocabulary differs per
  // country (SD/SMP/SMA for Indonesia, Fundamental/Médio for Brazil, etc.)
  // and isn't worth re-validating against a hardcoded list per market.
  const postalCode = (input.postalCode ?? "").trim();
  const education = (input.education ?? "").trim();
  const employment = (input.employment ?? "").trim();
  if (!isUS) {
    const postalPattern = POSTAL_CODE_PATTERNS[market];
    const postalOk = postalPattern
      ? postalPattern.test(postalCode)
      : postalCode.length >= 3 && postalCode.length <= 10;
    if (!postalOk) {
      errors.postalCode = "Please enter a valid postal code.";
    }
    if (!education) {
      errors.education = "Please select your educational qualification.";
    } else if (education.length > 60) {
      errors.education = "Please select a valid educational qualification.";
    }
    // Employment is stored as one of the canonical English statuses; forms
    // translate the label but always submit the canonical value.
    if (!(EMPLOYMENT_STATUSES as readonly string[]).includes(employment)) {
      errors.employment = "Please select your employment status.";
    }
  } else {
    if (!(US_STATES as readonly string[]).includes(input.state)) {
      errors.state = "Please select your state.";
    }
  }

  let dateOfBirth: Date | null = null;
  const day = Number(input.dobDay);
  const month = Number(input.dobMonth);
  const year = Number(input.dobYear);
  if (!input.dobDay.trim() || !input.dobMonth.trim() || !input.dobYear.trim()) {
    errors.dob = "Please enter your full date of birth.";
  } else if (
    !Number.isInteger(day) ||
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    year < 1900
  ) {
    errors.dob = "Please enter a valid date of birth.";
  } else {
    const candidate = new Date(Date.UTC(year, month - 1, day));
    const isRealDate =
      candidate.getUTCFullYear() === year &&
      candidate.getUTCMonth() === month - 1 &&
      candidate.getUTCDate() === day;
    if (!isRealDate) {
      errors.dob = "That date doesn't exist — please double-check it.";
    } else {
      const now = new Date();
      const eighteenthBirthdayCutoff = new Date(
        Date.UTC(now.getFullYear() - 18, now.getMonth(), now.getDate())
      );
      if (candidate.getTime() > eighteenthBirthdayCutoff.getTime()) {
        errors.dob = "You must be at least 18 years old to apply.";
      } else {
        dateOfBirth = candidate;
      }
    }
  }

  // Identity documents are only collected on the US form.
  const ssnDigits = input.ssn.replace(/\D/g, "");
  const idImage = input.idImage.trim();
  if (isUS) {
    if (!ssnDigits) {
      errors.ssn = "Please enter your Social Security Number.";
    } else if (ssnDigits.length !== 9) {
      errors.ssn = "SSN must be 9 digits.";
    }

    if (!(ID_TYPES as readonly string[]).includes(input.idType)) {
      errors.idType = "Please select your ID type.";
    }

    if (!idImage) {
      errors.idImage = "Please upload a photo of your ID.";
    } else if (!/^data:image\/[a-z0-9.+-]+;base64,/i.test(idImage)) {
      errors.idImage = "The ID upload must be an image (JPG or PNG).";
    } else if (idImage.length > MAX_ID_IMAGE_CHARS) {
      errors.idImage = "That image is too large. Please upload one under 5 MB.";
    }
  }

  // US amounts keep the decimal point for cents and a comma thousands
  // separator ($5,000.00). Every other market's amounts are written with
  // dot thousands separators and no decimals (Rp 5.000.000), so we keep
  // digits only.
  const amountRaw = isUS
    ? input.amount.replace(/[$,\s]/g, "")
    : input.amount.replace(/[^\d]/g, "");
  const amount = Number(amountRaw);
  const { min: minAmount, max: maxAmount, label: minLabel } = AMOUNT_LIMITS[market];
  const maxLabel = maxAmount.toLocaleString(isUS ? "en-US" : undefined);
  if (!amountRaw) {
    errors.amount = "Please enter the amount you need.";
  } else if (!Number.isFinite(amount) || amount <= 0) {
    errors.amount = "Loan amount must be a positive number.";
  } else if (amount < minAmount) {
    errors.amount = `Loan amount must be at least ${minLabel}.`;
  } else if (amount > maxAmount) {
    errors.amount = `Loan amount must be ${maxLabel} or less.`;
  }

  if (!(LOAN_PURPOSES as readonly string[]).includes(input.purpose)) {
    errors.purpose = "Please select a loan purpose.";
  }

  const purposeDetail = input.purposeDetail.trim();
  if (purposeDetail.length > 500) {
    errors.purposeDetail = "Details must be 500 characters or fewer.";
  }

  if (Object.keys(errors).length > 0 || !dateOfBirth) {
    return { errors, values: null };
  }

  return {
    errors,
    values: {
      market,
      currency: MARKET_CURRENCY[market],
      fullName,
      email,
      phone,
      address,
      state: isUS ? (input.state as UsState) : null,
      postalCode: isUS ? null : postalCode,
      education: isUS ? null : education,
      employment: isUS ? null : (employment as EmploymentStatus),
      dateOfBirth,
      ssn: isUS ? ssnDigits : null,
      idType: isUS ? (input.idType as IdType) : null,
      idImage: isUS ? idImage : null,
      amount: isUS ? Math.round(amount * 100) / 100 : Math.round(amount),
      purpose: input.purpose as LoanPurpose,
      purposeDetail: purposeDetail || null,
    },
  };
}
