# Easy Loan Approval — Fast, Simple Loans

A modern, minimal loan-application site built with **Next.js (App Router)**,
**Tailwind CSS v4**, and **Prisma** (PostgreSQL in production, SQLite locally).

## Getting Started

```bash
npm install
npm run db:push   # creates prisma/dev.db and generates the Prisma client
npm run dev
```

Open [http://localhost:3005](http://localhost:3005).

> The repo ships without a `.env` (it's gitignored). Create one before
> running `db:push`:
>
> ```bash
> DATABASE_URL="file:./dev.db"
> ADMIN_USERNAME="..."          # /admin login
> ADMIN_PASSWORD="..."
> SESSION_SECRET="..."          # openssl rand -hex 32
> RESEND_API_KEY=""             # leave blank to skip emails (warnings log instead)
> ADMIN_NOTIFICATION_EMAIL=""   # who gets "new application" emails
> ```

## Flow

| Route           | Description                                                              |
| --------------- | ------------------------------------------------------------------------ |
| `/`             | Landing page — hero with a single **Apply Now** call to action            |
| `/apply`        | Three-step form — your details + **ID upload**, loan details, then review |
| `/confirmation` | Shows the generated Application ID (`ELA-YYYY-XXXXXX`)                      |
| `/status`       | Public lookup — applicants enter ID + email to see their status            |
| `/admin`        | Private dashboard listing all submissions (login required)                |

## How it works

- **Validation** lives in [`lib/validation.ts`](lib/validation.ts) and is shared:
  the form runs it for instant inline feedback, and the API route re-runs the
  exact same rules server-side (required fields, email/phone format, positive
  loan amount, real calendar date, and the 18+ age check).
- **Application IDs** are generated server-side in
  [`app/api/applications/route.ts`](app/api/applications/route.ts) using
  `crypto.randomInt`, with retry-on-collision against the unique primary key.
- **Rate limiting**: a simple in-memory sliding window (5 requests/minute per
  IP) in [`lib/rate-limit.ts`](lib/rate-limit.ts). Swap for Redis/Upstash in a
  multi-instance deployment.
- **Privacy**: the submission endpoint never logs form payloads — only error
  names/codes.

## Database

- **Production** uses **PostgreSQL** — the committed
  [`prisma/schema.prisma`](prisma/schema.prisma) targets it directly.
- **Local dev** uses **SQLite**: `scripts/local-schema.mjs` derives a
  gitignored `prisma/schema.local.prisma` (same models, sqlite provider).
  The `db:push`, `db:studio`, and `dev` scripts handle this automatically —
  just keep `DATABASE_URL="file:./dev.db"` in your local `.env`.
- Browse local data with `npm run db:studio` (Prisma Studio).
- Note: running `npm run build` locally regenerates the Prisma client for
  Postgres; the next `npm run dev` switches it back automatically.

## Deploying (Vercel + Neon)

1. Push this repo to GitHub.
2. Create a free Postgres database at [neon.tech](https://neon.tech) and copy
   the connection string.
3. Create the table once:
   `DATABASE_URL="<neon-connection-string>" npx prisma db push`
4. Import the repo at [vercel.com](https://vercel.com) and set the environment
   variables: `DATABASE_URL` (the Neon connection string), plus
   `ADMIN_USERNAME`, `ADMIN_PASSWORD`, and `SESSION_SECRET` for the `/admin`
   dashboard. The build script already runs `prisma generate`.

### Admin dashboard

`/admin` lists every submission (with totals) behind a username/password
login. Credentials are read from `ADMIN_USERNAME` / `ADMIN_PASSWORD`, and
sessions are HMAC-signed cookies (8-hour expiry) using `SESSION_SECRET` —
if any of the three env vars is missing, login fails closed. Login attempts
are rate-limited, and the pages send `noindex` robots metadata.

The dashboard supports:

- **Search & filter** by name/email/phone/ID and by status (URL-driven, so
  views are shareable). Status counts are shown inside the dropdown.
- **Inline status updates** — each row has a status dropdown
  (received / reviewing / approved / rejected / funded) that persists via a
  server action. The badge re-colors to match.
- **CSV export** at `/admin/export` (honors the current filters), opens in
  Excel-friendly UTF-8.

### Email notifications

Transactional emails go out via [Resend](https://resend.com):

| Trigger                              | Recipient            | Subject pattern                          |
| ------------------------------------ | -------------------- | ---------------------------------------- |
| Application submitted                | Applicant            | `Application received — ELA-YYYY-XXXXXX`  |
| Application submitted                | `ADMIN_NOTIFICATION_EMAIL` | `New application: NAME — $X`        |
| Admin changes status (real change)   | Applicant            | `Application ELA-... — now {Status}`      |
| Admin sends a verification link      | Applicant            | `Action required: {label} — Easy Loan Approval` |

Applicant-facing emails (confirmation, status change, verification link)
render in the applicant's market language — English, Bahasa Indonesia,
Portuguese, or Spanish, based on which `/apply/*` form they used — and set
a `reply_to` back to `ADMIN_NOTIFICATION_EMAIL` so replies reach a real
inbox. Admin-notification emails set `reply_to` to the applicant's own
address, so you can just hit reply.

Wiring lives in [`lib/email/`](lib/email/) (`transport.ts` for the Resend
client and logging, `shell.ts` for the shared HTML chrome, `strings.ts` for
per-language copy, `templates/` for the actual messages). It fails soft: if
`RESEND_API_KEY` isn't set the helper logs a warning and no-ops, so the
app keeps running. Sandbox mode uses `onboarding@resend.dev` as the from
address, which only delivers to the address registered on your Resend
account — once you verify a domain, set `RESEND_FROM_EMAIL` to a sender
on it (e.g. `"Easy Loan Approval <noreply@easyloansapprovals.com>"`).

### Live chat

An optional **Tawk.to widget** renders only when its env vars are set
(otherwise nothing renders): set `NEXT_PUBLIC_TAWK_PROPERTY_ID` and
`NEXT_PUBLIC_TAWK_WIDGET_ID` from your Tawk dashboard's embed snippet
(`https://embed.tawk.to/<PROPERTY_ID>/<WIDGET_ID>`). Loads with
`next/script` `lazyOnload`, so it doesn't affect first paint.

> **Privacy note.** Tawk's servers see every chat — applicants on a loan
> site will share PII. Disclose third-party chat in your privacy policy if
> you enable Tawk.

### Status lookup (`/status`)

Applicants can check their application progress by entering their ID and
the email they applied with. To avoid enumeration, the page returns the
same "not found" message whether the ID is missing or the email doesn't
match; lookups are rate-limited per IP.

## Security

- **Rate limiting** — all endpoints are limited per IP. Auth (`/admin/login`)
  is 5 attempts / 15 min; public forms 5 / min; admin mutations 60 / min.
  Limits use **Upstash Redis** when `UPSTASH_REDIS_REST_URL` +
  `UPSTASH_REDIS_REST_TOKEN` are set (correct across serverless instances),
  and fall back to a per-process in-memory window otherwise.
- **Bot protection** — the apply, careers, and status forms support
  **Cloudflare Turnstile**. Set `NEXT_PUBLIC_TURNSTILE_SITE_KEY` +
  `TURNSTILE_SECRET_KEY` to enforce; unset = disabled (forms work unchanged).
- **ID upload** — the application form collects a government-ID type
  (Driver's License / State ID) and a photo of it. The image is downscaled
  client-side (max 1400px, JPEG) and stored **as-is, unencrypted** in the
  `idImage` column as a data URL; it appears as a thumbnail in the admin
  dashboard. No extra env vars or keys are required.
- **Payload limits** — `/api/applications` rejects bodies > 8 MB (sized for
  the downscaled ID photo); Server Actions are capped at 64 KB; all text
  fields are length-capped.
- **Headers** — `nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy`,
  `Permissions-Policy`, and HSTS are sent on every response. A strict CSP is
  a noted future step (the site loads Tawk + generated OG images).
- **Secrets** — all sensitive config is server-only env; the only
  client-bundled vars are public `NEXT_PUBLIC_*` values. Use a long random
  `ADMIN_PASSWORD` and a 32-byte `SESSION_SECRET` (`openssl rand -hex 32`).
- **Client IP** — the site is served through Cloudflare's proxy, so the true
  client IP is read from `cf-connecting-ip` (falling back to `x-real-ip`, then
  `x-forwarded-for`). Bucketing on `x-real-ip` alone would scatter rate-limit
  buckets across Cloudflare's rotating egress IPs.

Any always-on Node host (Railway, Render, a VPS) works the same way.

## Stack

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS v4 — brand palette: sun yellow `#FFC72C`, white, deep blue `#1E3A8A`
- `next/font` — Space Grotesk (display) + Inter (body)
- Prisma 6 — PostgreSQL in production, SQLite for local dev
