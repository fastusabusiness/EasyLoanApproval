// Shared HTML chrome for every branded email: the outer shell, escaping,
// and button helpers. Inline-styled throughout — email clients ignore
// <style> sheets, classes, and most modern CSS, so every styled element
// gets its own style="" attribute.

export function appUrl(): string {
  if (process.env.APP_URL) return process.env.APP_URL.replace(/\/$/, "");
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3005";
}

export const escapeHtml = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      }[c]!)
  );

interface BrandShellOptions {
  preheader: string;
  body: string;
}

export function shell({ preheader, body }: BrandShellOptions): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#eaf6e4;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#0f2a18;">
    <span style="display:none;font-size:1px;color:#eaf6e4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(preheader)}</span>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;">
      <tr>
        <td style="background:linear-gradient(135deg,#6dbe45,#2e7d32);padding:24px 32px;border-radius:18px 18px 0 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="padding-right:12px;">
                <img src="${appUrl()}/logo.jpg" width="34" height="34" alt="" style="display:block;border-radius:9999px;" />
              </td>
              <td>
                <p style="margin:0;font-size:22px;font-weight:800;letter-spacing:-0.01em;color:#ffffff;">Easy Loan Approval</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="background:#ffffff;padding:32px;border-radius:0 0 18px 18px;">
          ${body}
        </td>
      </tr>
      <tr>
        <td style="padding:16px 8px;text-align:center;font-size:12px;line-height:1.6;color:#94a3b8;">
          © ${new Date().getFullYear()} Easy Loan Approval<br />
          <!-- TODO: add Easy Loan Approval's real mailing address here before going live -->
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function statusLookupButton(id: string, label = "Check your status"): string {
  const url = `${appUrl()}/status?id=${encodeURIComponent(id)}`;
  return `<p style="margin:24px 0 0;"><a href="${url}" style="display:inline-block;background:#43a83a;color:#ffffff;padding:14px 28px;border-radius:9999px;font-weight:700;text-decoration:none;font-size:15px;">${escapeHtml(label)}</a></p>`;
}
