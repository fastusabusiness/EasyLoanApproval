// Public surface of the email module. Import sites use "@/lib/email" —
// the split into transport / shell / templates is an internal detail.

export { sendCustomEmail } from "./transport";
export {
  emailAdminNewApplication,
  emailApplicantConfirmation,
  emailApplicantStatusChange,
  emailApplicantVerificationLink,
} from "./templates/loans";
export {
  emailCareersApplication,
  emailCareerStatusChange,
  emailCareerVerificationLink,
} from "./templates/careers";
