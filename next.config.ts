import type { NextConfig } from "next";

// Defense-in-depth security headers applied to every response. We intentionally
// do NOT set a strict Content-Security-Policy here because the site loads
// third-party scripts (Tawk.to) and generated OG images; CSP is noted as a
// future hardening step in the README security section.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains",
  },
];

const nextConfig: NextConfig = {
  // Reject oversized Server Action payloads. Most forms here are a few KB;
  // the one exception is the careers CV upload, which caps the file itself
  // at 5 MB (see app/careers/actions.ts) — this ceiling just needs headroom
  // above that for the surrounding multipart/form-data overhead.
  experimental: {
    serverActions: {
      bodySizeLimit: "6mb",
    },
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
