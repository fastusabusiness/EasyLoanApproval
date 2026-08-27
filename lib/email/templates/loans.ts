import { STATUS_META, type ApplicationStatus } from "../../application-status";
import { formatMoney } from "../../currency";
import { appUrl, escapeHtml, shell, statusLookupButton } from "../shell";
import {
  CONFIRMATION_STRINGS,
  STATUS_CHANGE_STRINGS,
  VERIFICATION_LINK_STRINGS,
  localeForMarket,
} from "../strings";
import { ADMIN_EMAIL, send } from "../transport";

// Applicant-facing emails render in the applicant's market language
// (English, Bahasa Indonesia, Portuguese, or Spanish); admin notifications
// are always English.

export async function emailApplicantConfirmation(input: {
  to: string;
  fullName: string;
  id: string;
  amount: number;
  currency?: string;
  market?: string;
}) {
  const firstName = input.fullName.split(/\s+/)[0] || "there";
  const t = CONFIRMATION_STRINGS[localeForMarket(input.market)];
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0f2a18;">${escapeHtml(t.heading)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.dear(firstName))}
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.received(formatMoney(input.amount, input.currency)))}
    </p>
    <p style="margin:24px 0 8px;font-size:13px;font-weight:700;color:#2e7d32;letter-spacing:0.02em;">${escapeHtml(t.refLabel)}</p>
    <p style="margin:0;background:#eaf6e4;border:2px dashed #43a83a;padding:18px;border-radius:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:18px;font-weight:700;letter-spacing:0.06em;text-align:center;color:#2e7d32;">${escapeHtml(input.id)}</p>
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;">
      ${escapeHtml(t.keepRef)}
    </p>
    <p style="margin:16px 0 0;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.reviewTime)}
    </p>
    ${statusLookupButton(input.id, t.checkStatus)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      ${t.signoffHtml}
    </p>
  `;
  await send({
    category: "confirmation",
    to: input.to,
    subject: t.subject(input.id),
    html: shell({ preheader: t.preheader(input.id), body }),
    logHtml: body,
    reply_to: ADMIN_EMAIL || undefined,
  });
}

export async function emailAdminNewApplication(input: {
  id: string;
  fullName: string;
  email: string;
  amount: number;
  currency?: string;
  purpose: string;
}) {
  if (!ADMIN_EMAIL) {
    console.warn(
      "[email] ADMIN_NOTIFICATION_EMAIL not set — skipping admin notification"
    );
    return;
  }
  const body = `
    <h1 style="margin:0 0 16px;font-size:22px;font-weight:800;color:#0f2a18;">New application submitted</h1>
    <p style="margin:0 0 16px;font-size:14px;line-height:1.55;color:#334155;">
      A new loan application has been submitted and is awaiting review.
    </p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:8px;">
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;width:35%;">Applicant</td><td style="padding:6px 0;font-weight:700;font-size:15px;">${escapeHtml(input.fullName)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Email</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.email)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Amount requested</td><td style="padding:6px 0;font-weight:700;font-size:15px;">${escapeHtml(formatMoney(input.amount, input.currency))}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Purpose</td><td style="padding:6px 0;font-size:15px;">${escapeHtml(input.purpose)}</td></tr>
      <tr><td style="padding:6px 0;color:#64748b;font-size:13px;">Reference</td><td style="padding:6px 0;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:14px;color:#2e7d32;">${escapeHtml(input.id)}</td></tr>
    </table>
    <p style="margin:24px 0 0;"><a href="${appUrl()}/admin?q=${encodeURIComponent(input.id)}" style="display:inline-block;background:#0f2a18;color:#ffffff;padding:12px 22px;border-radius:9999px;font-weight:700;text-decoration:none;font-size:14px;">Review in admin dashboard</a></p>
  `;
  await send({
    category: "admin-notice",
    to: ADMIN_EMAIL,
    reply_to: input.email,
    subject: `New application submitted — ${input.fullName} (${formatMoney(input.amount, input.currency)})`,
    html: shell({
      preheader: `${input.fullName} applied for ${formatMoney(input.amount, input.currency)} (${input.purpose}).`,
      body,
    }),
    logHtml: body,
  });
}

export async function emailApplicantStatusChange(input: {
  to: string;
  fullName: string;
  id: string;
  status: ApplicationStatus;
  market?: string;
}) {
  const firstName = input.fullName.split(/\s+/)[0] || "there";
  const meta = STATUS_META[input.status];
  const t = STATUS_CHANGE_STRINGS[localeForMarket(input.market)];
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0f2a18;">${escapeHtml(t.heading)}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.dear(firstName))}
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${t.changed(`<strong>${escapeHtml(meta.label)}</strong>`)}
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">${escapeHtml(meta.description)}</p>
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;">${escapeHtml(t.refLabel)} <span style="font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;color:#2e7d32;font-weight:700;">${escapeHtml(input.id)}</span></p>
    ${statusLookupButton(input.id, t.checkStatus)}
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      ${t.thanksHtml}
    </p>
  `;
  await send({
    category: "status-update",
    to: input.to,
    subject: t.subject(input.id),
    html: shell({ preheader: t.preheader(meta.label), body }),
    logHtml: body,
    reply_to: ADMIN_EMAIL || undefined,
  });
}

export async function emailApplicantVerificationLink(input: {
  to: string;
  fullName: string;
  id: string;
  label: string;
  url: string;
  market?: string;
}) {
  const firstName = input.fullName.split(/\s+/)[0] || "there";
  const t = VERIFICATION_LINK_STRINGS[localeForMarket(input.market)];
  const body = `
    <h1 style="margin:0 0 16px;font-size:24px;font-weight:800;color:#0f2a18;">${escapeHtml(t.heading(input.label))}</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.dear(firstName))}
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${t.intro(`<strong>${escapeHtml(input.label)}</strong>`)}
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:1.55;color:#334155;">
      ${escapeHtml(t.whatToExpect)}
    </p>
    <p style="margin:24px 0 8px;font-size:13px;font-weight:700;color:#2e7d32;letter-spacing:0.02em;">${escapeHtml(t.refLabel)}</p>
    <p style="margin:0;background:#eaf6e4;border:2px dashed #43a83a;padding:18px;border-radius:14px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:18px;font-weight:700;letter-spacing:0.06em;text-align:center;color:#2e7d32;">${escapeHtml(input.id)}</p>
    <p style="margin:24px 0 0;"><a href="${escapeHtml(input.url)}" style="display:inline-block;background:#43a83a;color:#ffffff;padding:14px 28px;border-radius:9999px;font-weight:700;text-decoration:none;font-size:15px;">${escapeHtml(input.label)}</a></p>
    <p style="margin:16px 0 0;font-size:13px;color:#64748b;word-break:break-all;">${escapeHtml(t.copyLink)} ${escapeHtml(input.url)}</p>
    <p style="margin:20px 0 0;font-size:13px;color:#64748b;">${escapeHtml(t.security)}</p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#334155;">${escapeHtml(t.afterSubmit)}</p>
    <p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:#334155;">${escapeHtml(t.questions)}</p>
    <p style="margin:28px 0 0;font-size:14px;line-height:1.6;color:#334155;">
      ${t.thanksHtml}
    </p>
  `;
  await send({
    category: "verification",
    to: input.to,
    subject: t.subject(input.label),
    html: shell({ preheader: t.preheader(input.label), body }),
    logHtml: body,
    reply_to: ADMIN_EMAIL || undefined,
  });
}
