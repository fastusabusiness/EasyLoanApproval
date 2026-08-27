import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Easy Loan Approval collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="June 15, 2026">
      <p>
        This Privacy Policy explains how <strong>[LEGAL BUSINESS NAME]</strong>{" "}
        (&ldquo;Easy Loan Approval,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or
        &ldquo;our&rdquo;) collects, uses, and protects information you provide
        when you use our website and loan application service (the
        &ldquo;Service&rdquo;). By using the Service, you agree to this Policy.
      </p>

      <h2>1. Information we collect</h2>
      <p>
        When you submit a loan application, we collect the information you
        provide directly, which may include:
      </p>
      <ul>
        <li>Full name</li>
        <li>Email address</li>
        <li>Phone number</li>
        <li>Postal address</li>
        <li>Date of birth (used to confirm you are at least 18)</li>
        <li>Requested loan amount and loan purpose</li>
        <li>Any additional details you choose to include</li>
      </ul>
      <p>
        We also automatically collect limited technical data such as your IP
        address, which we use for security and rate-limiting. We do not use
        third-party advertising or analytics tracking cookies. We use a single
        secure session cookie solely to keep authorized administrators signed
        in.
      </p>

      <h2>2. How we use your information</h2>
      <ul>
        <li>To receive, review, and process your loan application</li>
        <li>To contact you about your application and its status</li>
        <li>
          To send transactional emails (application confirmation and status
          updates)
        </li>
        <li>To verify eligibility, prevent fraud, and maintain security</li>
        <li>To comply with legal and regulatory obligations</li>
      </ul>
      <p>
        We do <strong>not</strong> sell your personal information.
      </p>

      <h2>3. Service providers</h2>
      <p>
        We share information only with vendors that help us operate the
        Service, each of which processes data on our behalf:
      </p>
      <ul>
        <li>
          <strong>Hosting &amp; database</strong> — our application is hosted on
          Vercel and stored in a managed PostgreSQL database (Neon).
        </li>
        <li>
          <strong>Email delivery</strong> — transactional emails are sent
          through Resend.
        </li>
        <li>
          <strong>Live chat</strong> — if you start a chat, your messages are
          processed by our chat provider (Tawk.to). Do not share sensitive
          financial details over chat.
        </li>
      </ul>
      <p>
        We may also disclose information when required by law, to enforce our
        agreements, or to protect the rights, safety, and property of Easy Loan Approval
        or others.
      </p>

      <h2>4. Data retention</h2>
      <p>
        We retain application data for as long as necessary to fulfill the
        purposes described in this Policy and to meet legal, accounting, or
        reporting requirements. When data is no longer needed, we delete or
        anonymize it.
      </p>

      <h2>5. Security</h2>
      <p>
        Information is transmitted over encrypted connections (HTTPS) and stored
        with access controls. No method of transmission or storage is completely
        secure, so we cannot guarantee absolute security, but we take reasonable
        measures to protect your information.
      </p>

      <h2>6. Your rights</h2>
      <p>
        Depending on where you live, you may have the right to access, correct,
        or delete the personal information we hold about you, or to object to or
        restrict certain processing. To make a request, contact us at{" "}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>. We will respond as
        required by applicable law.
      </p>

      <h2>7. Children</h2>
      <p>
        The Service is intended only for individuals who are at least 18 years
        old. We do not knowingly collect information from anyone under 18.
      </p>

      <h2>8. Changes to this Policy</h2>
      <p>
        We may update this Policy from time to time. When we do, we will revise
        the &ldquo;Last updated&rdquo; date above. Continued use of the Service
        after changes take effect constitutes acceptance of the updated Policy.
      </p>

      <h2>9. Contact us</h2>
      <p>
        Questions about this Policy or your information? Contact{" "}
        <strong>[LEGAL BUSINESS NAME]</strong> at{" "}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>
        {" "}or [BUSINESS MAILING ADDRESS].
      </p>

      <p>
        <strong>
          This document is a template and not legal advice. Have it reviewed by
          a qualified attorney before relying on it.
        </strong>
      </p>
    </LegalLayout>
  );
}
