// Single source of truth for career-application (job candidate)
// statuses — used by the admin dropdown, badge color, and the validation
// guard in updateCareerStatus().

export const CAREER_STATUSES = [
  "applied",
  "reviewing",
  "interviewing",
  "hired",
  "rejected",
] as const;

export type CareerStatus = (typeof CAREER_STATUSES)[number];

export function isCareerStatus(value: unknown): value is CareerStatus {
  return (
    typeof value === "string" &&
    (CAREER_STATUSES as readonly string[]).includes(value)
  );
}

interface CareerStatusMeta {
  label: string;
  description: string;
  // Tailwind classes for the badge background, border, and text.
  badgeClasses: string;
}

export const CAREER_STATUS_META: Record<CareerStatus, CareerStatusMeta> = {
  applied: {
    label: "Applied",
    description: "Application received, not yet reviewed.",
    badgeClasses: "border-slate-200 bg-slate-50 text-slate-700",
  },
  reviewing: {
    label: "Reviewing",
    description: "Our team is reviewing this candidate.",
    badgeClasses: "border-blue-200 bg-blue-50 text-blue-700",
  },
  interviewing: {
    label: "Interviewing",
    description: "This candidate is in the interview process.",
    badgeClasses: "border-amber-200 bg-amber-50 text-amber-700",
  },
  hired: {
    label: "Hired",
    description: "Welcome aboard — this candidate has been hired.",
    badgeClasses: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  rejected: {
    label: "Not selected",
    description: "This candidate was not selected at this time.",
    badgeClasses: "border-red-200 bg-red-50 text-red-700",
  },
};
