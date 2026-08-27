import type { Metadata } from "next";
import { Fraunces, IBM_Plex_Mono, Inter, Space_Grotesk } from "next/font/google";
import TawkChat from "@/components/TawkChat";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Homepage-only typefaces (the "approval ledger" redesign) — kept separate
// from the site-wide --font-display (Space Grotesk) so admin/apply/legal
// pages are unaffected.
const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "900"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-plex-mono",
});

const SITE_URL = process.env.APP_URL ?? "https://www.easyloansapprovals.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Easy Loan Approval — Simple Loans, Easy Approval",
    template: "%s — Easy Loan Approval",
  },
  description:
    "Apply for a loan in minutes with Easy Loan Approval. No paperwork mountains, no hidden fees — just fast, simple loans.",
  openGraph: {
    title: "Easy Loan Approval — Simple Loans, Easy Approval",
    description:
      "Apply in under two minutes. No paperwork, no hidden fees. See your monthly payment instantly.",
    url: SITE_URL,
    siteName: "Easy Loan Approval",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Easy Loan Approval — Simple Loans, Easy Approval",
    description:
      "Apply in under two minutes. No paperwork, no hidden fees. See your monthly payment instantly.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} ${fraunces.variable} ${plexMono.variable} font-sans bg-white text-ink antialiased`}
      >
        {children}
        <TawkChat />
      </body>
    </html>
  );
}
