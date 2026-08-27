import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms governing your use of the Easy Loan Approval website and service.",
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service" updated="June 15, 2026">
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern your use of the
        website and loan application service (the &ldquo;Service&rdquo;) operated
        by <strong>[LEGAL BUSINESS NAME]</strong> (&ldquo;Easy Loan Approval,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;). By accessing or
        using the Service, you agree to be bound by these Terms. If you do not
        agree, do not use the Service.
      </p>

      <h2>1. Eligibility</h2>
      <p>
        You must be at least 18 years old and legally able to enter into a
        contract to use the Service. By submitting an application, you confirm
        that you meet these requirements.
      </p>

      <h2>2. Nature of the Service</h2>
      <p>
        The Service lets you submit a loan application for our review.{" "}
        <strong>
          Submitting an application does not guarantee approval, funding, or any
          particular loan terms.
        </strong>{" "}
        All applications are subject to review, verification, and our approval
        criteria. We may approve, decline, or request additional information at
        our discretion, subject to applicable law.
      </p>

      <h2>3. Accuracy of information</h2>
      <p>
        You agree to provide true, accurate, and complete information. Providing
        false or misleading information may result in rejection of your
        application and may constitute fraud. You are responsible for keeping
        your contact details current.
      </p>

      <h2>4. Loan calculator and estimates</h2>
      <p>
        Any payment figures, rates, or amounts shown by our loan calculator or
        elsewhere on the site are{" "}
        <strong>illustrative estimates only</strong>. They are not an offer of
        credit and do not reflect your actual rate, payment, or terms, which
        depend on review of your application and applicable law. The rate used
        in the calculator is a sample and not a quoted rate.
      </p>

      <h2>5. Your application ID</h2>
      <p>
        On submission you receive a unique application ID. You are responsible
        for keeping it confidential; anyone with your ID and email may be able
        to view your application status.
      </p>

      <h2>6. Acceptable use</h2>
      <ul>
        <li>Do not submit applications on behalf of another person without authorization.</li>
        <li>Do not attempt to disrupt, overload, or gain unauthorized access to the Service.</li>
        <li>Do not use the Service for any unlawful or fraudulent purpose.</li>
      </ul>

      <h2>7. Intellectual property</h2>
      <p>
        The Service, including its design, text, logos, and software, is owned
        by Easy Loan Approval or its licensors and is protected by applicable laws. You may
        not copy, modify, or distribute it without our permission.
      </p>

      <h2>8. Disclaimers</h2>
      <p>
        The Service is provided &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; without warranties of any kind, whether express or
        implied, to the fullest extent permitted by law. We do not warrant that
        the Service will be uninterrupted, error-free, or secure.
      </p>

      <h2>9. Limitation of liability</h2>
      <p>
        To the maximum extent permitted by law, Easy Loan Approval and its affiliates will
        not be liable for any indirect, incidental, special, consequential, or
        punitive damages, or any loss of data, arising from your use of the
        Service.
      </p>

      <h2>10. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Changes are effective when
        posted, and we will update the &ldquo;Last updated&rdquo; date above.
        Continued use of the Service after changes take effect constitutes
        acceptance.
      </p>

      <h2>11. Governing law</h2>
      <p>
        These Terms are governed by the laws of{" "}
        <strong>[STATE / COUNTRY]</strong>, without regard to its conflict-of-law
        rules. Any disputes will be resolved in the courts located in{" "}
        <strong>[JURISDICTION]</strong>.
      </p>

      <h2>12. Contact us</h2>
      <p>
        Questions about these Terms? Contact{" "}
        <strong>[LEGAL BUSINESS NAME]</strong> at{" "}
        <a href="mailto:[CONTACT EMAIL]">[CONTACT EMAIL]</a>
        {" "}or [BUSINESS MAILING ADDRESS].
      </p>

      <p>
        <strong>
          This document is a template and not legal advice. Lending is heavily
          regulated; have these Terms reviewed by a qualified attorney before
          relying on them.
        </strong>
      </p>
    </LegalLayout>
  );
}
