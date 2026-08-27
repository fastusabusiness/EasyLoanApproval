import { CAREER_STATUS_META, type CareerStatus } from "../../career-status";
import { escapeHtml, shell } from "../shell";
import { ADMIN_EMAIL, send } from "../transport";

// Careers emails are English-only — hiring is US-facing.

export async function emailCareersApplication(input: {
  role: string;
  fullName: string;
  email: string;
  phone: string;
  location: string;
  experience: string;
}) {
  if (!ADMIN_EMAIL) {
    console.warn(
      "[email] ADMIN_NOTIFICATION_EMAIL not set — skipping careers notification"
    );
    return;
  }
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f2a18;">New ${escapeHtml(input.role)} application</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">
      A new candidate has applied for the ${escapeHtml(input.role)} position.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:32%;">Name</td><td style="padding:6px 0;font-weight:700;font-size:15px;">${escapeHtml(input.fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Role</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.role)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.email)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Phone</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.phone)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Location</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.location)}</td></tr>
    </table>
    ${
      input.experience
        ? `<p style="margin:20px 0 6px;font-size:13px;font-weight:700;color:#2e7d32;">EXPERIENCE / PITCH</p>
    <p style="margin:0;font-size:15px;line-height:1.55;color:#334155;white-space:pre-wrap;">${escapeHtml(input.experience)}</p>`
        : ""
    }
    <p style="margin:24px 0 0;font-size:13px;color:#64748b;">You may reply directly to this candidate at <a href="mailto:${escapeHtml(input.email)}" style="color:#2e7d32;">${escapeHtml(input.email)}</a>.</p>
  `;
  await send({
    category: "careers",
    to: ADMIN_EMAIL,
    reply_to: input.email,
    subject: `New ${input.role} application — ${input.fullName}`,
    html: shell({
      preheader: `${input.fullName} (${input.location}) applied for ${input.role}.`,
      body,
    }),
    logHtml: body,
  });
}

export async function emailCareerStatusChange(input: {
  to: string;
  fullName: string;
  role: string;
  status: CareerStatus;
}) {
  const firstName = input.fullName.split(/\s+/)[0] || "there";
  const meta = CAREER_STATUS_META[input.status];
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0f2a18;">Update on your ${escapeHtml(input.role)} application</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      Dear ${escapeHtml(firstName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      We're writing to let you know your Easy Loan Approval ${escapeHtml(input.role)} application has been updated to <strong>${escapeHtml(meta.label)}</strong>.
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">${escapeHtml(meta.description)}</p>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      Thank you for your interest in Easy Loan Approval.<br />Best regards,<br />The Easy Loan Approval Team
    </p>
  `;
  await send({
    category: "careers-status-update",
    to: input.to,
    subject: `Update on your ${input.role} application — ${meta.label}`,
    html: shell({
      preheader: `Your ${input.role} application status changed to ${meta.label}.`,
      body,
    }),
    logHtml: body,
    reply_to: ADMIN_EMAIL || undefined,
  });
}

export async function emailCareerVerificationLink(input: {
  to: string;
  fullName: string;
  role: string;
  label: string;
  url: string;
}) {
  const firstName = input.fullName.split(/\s+/)[0] || "there";
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0f2a18;">Action needed: ${escapeHtml(input.label)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      Dear ${escapeHtml(firstName)},
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      As part of your ${escapeHtml(input.role)} application with Easy Loan Approval, please complete the following: <strong>${escapeHtml(input.label)}</strong>.
    </p>
    <p style="margin:24px 0 0;"><a href="${escapeHtml(input.url)}" style="display:inline-block;background:#43a83a;color:#ffffff;padding:14px 28px;border-radius:9999px;font-weight:700;text-decoration:none;font-size:15px;">${escapeHtml(input.label)}</a></p>
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;word-break:break-all;">Or copy this link: ${escapeHtml(input.url)}</p>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      Thank you,<br />The Easy Loan Approval Team
    </p>
  `;
  await send({
    category: "careers-verification",
    to: input.to,
    subject: `Action required: ${input.label} — Easy Loan Approval`,
    html: shell({
      preheader: `Please complete: ${input.label}.`,
      body,
    }),
    logHtml: body,
    reply_to: ADMIN_EMAIL || undefined,
  });
}
