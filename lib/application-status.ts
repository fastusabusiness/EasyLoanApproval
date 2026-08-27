// Single source of truth for application statuses — used by the admin
// dropdown, the status badge color, the public /status page, and the
// validation guard in updateStatus().

export const STATUSES = [
  "received",
  "reviewing",
  "approved",
  "rejected",
  "funded",
] as const;

export type ApplicationStatus = (typeof STATUSES)[number];

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === "string" && (STATUSES as readonly string[]).includes(value);
}

interface StatusMeta {
  label: string;
  description: string;
  // Tailwind classes for the badge background, border, and text.
  badgeClasses: string;
  // Tailwind text color used on the public status page.
  publicTextClass: string;
}

export const STATUS_META: Record<ApplicationStatus, StatusMeta> = {
  received: {
    label: "Received",
    description: "We have your application and will start reviewing it soon.",
    badgeClasses: "border-slate-200 bg-slate-50 text-slate-700",
    publicTextClass: "text-slate-700",
  },
  reviewing: {
    label: "Reviewing",
    description: "Our team is reviewing your application.",
    badgeClasses: "border-blue-200 bg-blue-50 text-blue-700",
    publicTextClass: "text-blue-700",
  },
  approved: {
    label: "Approved",
    description: "Your application has been approved. Funding details coming next.",
    badgeClasses: "border-emerald-200 bg-emerald-50 text-emerald-700",
    publicTextClass: "text-emerald-700",
  },
  rejected: {
    label: "Rejected",
    description: "Unfortunately we couldn't approve this application.",
    badgeClasses: "border-red-200 bg-red-50 text-red-700",
    publicTextClass: "text-red-700",
  },
  funded: {
    label: "Funded",
    description: "Funds have been disbursed.",
    badgeClasses: "border-sun bg-sun-soft text-navy",
    publicTextClass: "text-navy",
  },
};
