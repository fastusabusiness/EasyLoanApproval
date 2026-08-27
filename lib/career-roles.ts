// Open roles shown on the careers page and offered as choices on the
// application form. Single source of truth — used by the public form, the
// admin filter/column, and CSV export.

export const JOB_ROLES = [
  "Loan Marketer",
  "Data Analyst",
  "Data Entry",
  "Social Media Manager",
  "Software Engineer",
] as const;

export type JobRole = (typeof JOB_ROLES)[number];

export function isJobRole(value: unknown): value is JobRole {
  return typeof value === "string" && (JOB_ROLES as readonly string[]).includes(value);
}

export interface JobRoleDetail {
  summary: string;
  responsibilities: string[];
  lookingFor: string[];
}

export const JOB_ROLE_DETAILS: Record<JobRole, JobRoleDetail> = {
  "Loan Marketer": {
    summary:
      "Help people discover Easy Loan Approval and guide them to apply — flexible, commission-based, and fully remote.",
    responsibilities: [
      "Spread the word about Easy Loan Approval in your community and network",
      "Refer and guide potential borrowers to our online application",
      "Be a friendly first point of contact for people with questions",
      "Represent the Easy Loan Approval brand honestly and professionally",
    ],
    lookingFor: [
      "A self-starter with hustle and good people skills",
      "A network or audience you can reach (online or offline)",
      "Honesty and professionalism — no spam, no false promises",
      "Sales or marketing experience is a plus, not a must",
    ],
  },
  "Data Analyst": {
    summary:
      "Turn our application and lending data into clear insights that guide decisions across the business.",
    responsibilities: [
      "Build and maintain reports and dashboards on applications, approvals, and funding",
      "Analyze trends in loan performance, applicant demographics, and conversion",
      "Partner with the admin team and leadership to answer ad-hoc data questions",
      "Flag data quality issues and help keep our records clean and reliable",
    ],
    lookingFor: [
      "Comfortable working with spreadsheets, SQL, or similar data tools",
      "Strong attention to detail and a knack for spotting patterns",
      "Able to explain findings clearly to a non-technical audience",
      "Prior experience with financial or lending data is a plus, not required",
    ],
  },
  "Data Entry": {
    summary:
      "Keep applicant and loan records accurate, organized, and up to date.",
    responsibilities: [
      "Review and enter applicant information into our systems accurately",
      "Cross-check records for completeness and correct errors",
      "Help organize and maintain document files (IDs, verification links, notes)",
      "Flag inconsistencies or missing information to the team",
    ],
    lookingFor: [
      "Strong attention to detail and comfort with precise, repetitive work",
      "Reliable, organized, and able to meet deadlines",
      "Basic computer literacy — spreadsheets and web-based tools",
      "No prior experience required — we'll train you on our systems",
    ],
  },
  "Social Media Manager": {
    summary: "Grow our audience and manage our voice across social channels.",
    responsibilities: [
      "Plan and post content across our social media channels",
      "Respond to comments and messages in a timely, on-brand way",
      "Track engagement and suggest what's working (and what isn't)",
      "Collaborate with the team on campaigns and promotions",
    ],
    lookingFor: [
      "Experience managing social accounts (personal or professional)",
      "A good eye for content and an ear for tone and voice",
      "Comfortable with basic content creation and scheduling tools",
      "Creative, consistent, and responsive",
    ],
  },
  "Software Engineer": {
    summary: "Build and improve the systems that power our loan platform.",
    responsibilities: [
      "Build and maintain features across our web application",
      "Fix bugs and improve performance, reliability, and security",
      "Collaborate on technical decisions and code reviews",
      "Help evolve our admin tools and internal workflows",
    ],
    lookingFor: [
      "Solid experience with modern web development (JavaScript/TypeScript, React, or similar)",
      "Comfortable working across the stack — frontend, backend, and databases",
      "Able to write clear, maintainable code and work well in a small team",
      "Experience with Next.js or similar frameworks is a plus",
    ],
  },
};
