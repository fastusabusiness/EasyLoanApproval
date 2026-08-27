"use client";

import Script from "next/script";

// Renders the Cloudflare Turnstile widget inside a form. The widget injects a
// hidden <input name="cf-turnstile-response"> into the surrounding form, which
// the server action / API route reads and verifies. Renders nothing when
// NEXT_PUBLIC_TURNSTILE_SITE_KEY is unset, so forms work unchanged until keys
// are configured.

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

export default function Turnstile({ className = "" }: { className?: string }) {
  if (!SITE_KEY) return null;
  return (
    <div className={className}>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="lazyOnload"
      />
      <div className="cf-turnstile" data-sitekey={SITE_KEY} data-theme="light" />
    </div>
  );
}
