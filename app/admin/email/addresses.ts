// Shared types + constants for the admin Send-Email feature. Kept in a plain
// module so they can be shared between the client form and the server action
// without exporting a non-function from the "use server" action file.

// Result shape returned by the sendAdminEmail server action.
export type SendState = {
  status: "idle" | "success" | "error";
  message: string;
};

// Allowed "From" addresses for admin-composed email. A dropdown, not free
// text — every address must be verified on the easyloansapprovals.com domain in
// Resend or sending fails. The server action re-validates against this same
// list, since a client-side <select> doesn't stop a direct POST.
export const FROM_ADDRESSES = [
  "verify@easyloansapprovals.com",
  "admin@easyloansapprovals.com",
  "hr@easyloansapprovals.com",
] as const;

export type FromAddress = (typeof FROM_ADDRESSES)[number];
