import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ArchiveButton from "@/components/admin/ArchiveButton";
import DecisionForm from "@/components/admin/DecisionForm";
import IdThumbnail from "@/components/admin/IdThumbnail";
import NoteForm from "@/components/admin/NoteForm";
import StatusSelect from "@/components/admin/StatusSelect";
import VerificationLinksForm from "@/components/admin/VerificationLinksForm";
import { isAdmin } from "@/lib/admin-auth";
import { isApplicationStatus, STATUS_META, STATUSES } from "@/lib/application-status";
import { formatMoney as money } from "@/lib/currency";
import { prisma } from "@/lib/prisma";
import { MARKET_META, type Market } from "@/lib/validation";
import {
  addNote,
  deleteVerificationLink,
  logout,
  sendVerificationLink,
  setArchived,
  updateStatus,
  upsertVerificationLink,
} from "../../actions";

export const metadata: Metadata = {
  title: "Application — Admin",
  robots: { index: false, follow: false },
};

const dateOnly = (d: Date) => d.toLocaleDateString("en-GB", { timeZone: "UTC" });

const stamp = (d: Date) =>
  d.toLocaleString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const EVENT_DOT: Record<string, string> = {
  created: "bg-slate-400",
  status: "bg-blue-500",
  decision: "bg-leaf",
  note: "bg-navy",
  verification: "bg-sun",
  archived: "bg-red-500",
  unarchived: "bg-leaf",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="shrink-0 text-sm font-bold text-navy">{label}</dt>
      <dd className="text-right text-sm text-ink">{value}</dd>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-navy/5 sm:p-6">
      <h2 className="font-display text-lg font-bold tracking-tight text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
      verificationLinks: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!application) notFound();

  const a = application;
  const isArchived = a.archivedAt !== null;

  return (
    <main className="min-h-screen bg-sun-soft/50">
      <header className="flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5">
          <BrandLogo className="h-9 w-9" />
          <span className="font-display text-2xl font-bold tracking-tight text-navy">
            Easy Loan Approval
          </span>
          <span className="ml-2 rounded-full bg-navy px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
            Admin
          </span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="rounded-full border-2 border-slate-200 px-5 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
          >
            Log out
          </button>
        </form>
      </header>

      <div className="mx-auto max-w-4xl px-4 pb-20 sm:px-6">
        <a
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-navy underline-offset-4 hover:underline"
        >
          ← Back to applications
        </a>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                {a.fullName}
              </h1>
              {isArchived && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 font-mono text-sm font-bold text-navy">{a.id}</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusSelect
              id={a.id}
              initialStatus={
                isApplicationStatus(a.status) ? a.status : "received"
              }
              statuses={STATUSES}
              meta={STATUS_META}
              action={updateStatus}
            />
            <ArchiveButton id={a.id} archived={isArchived} action={setArchived} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card title="Applicant">
            <dl className="mt-2 divide-y divide-slate-100">
              <InfoRow
                label="Market"
                value={
                  a.market in MARKET_META
                    ? `${MARKET_META[a.market as Market].flag} ${MARKET_META[a.market as Market].label}`
                    : a.market
                }
              />
              <InfoRow label="Email" value={a.email} />
              <InfoRow label="Phone" value={a.phone} />
              <InfoRow label="Address" value={a.address} />
              {a.market !== "US" ? (
                <>
                  <InfoRow label="Postal code" value={a.postalCode ?? "—"} />
                  <InfoRow label="Education" value={a.education ?? "—"} />
                  <InfoRow label="Employment" value={a.employment ?? "—"} />
                </>
              ) : (
                <InfoRow label="State" value={a.state ?? "—"} />
              )}
              <InfoRow label="Date of birth" value={dateOnly(a.dateOfBirth)} />
              {a.market === "US" && <InfoRow label="SSN" value={a.ssn ?? "—"} />}
            </dl>
          </Card>

          <Card title="Loan request">
            <dl className="mt-2 divide-y divide-slate-100">
              <InfoRow
                label="Amount requested"
                value={money(a.amount, a.currency ?? "USD")}
              />
              <InfoRow label="Purpose" value={a.purpose} />
              {a.purposeDetail && (
                <InfoRow label="Details" value={a.purposeDetail} />
              )}
              <InfoRow label="Submitted" value={stamp(a.createdAt)} />
            </dl>
            <div className="mt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                ID document
              </p>
              {a.idImage ? (
                <IdThumbnail
                  src={a.idImage}
                  label={a.idType ?? "ID"}
                  name={a.fullName}
                />
              ) : (
                <span className="text-sm text-slate-400">Not provided</span>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5">
          <Card title="Loan decision">
            <p className="mt-1 text-sm text-slate-500">
              Record the offer once you approve. Leave a field blank to skip it.
            </p>
            <DecisionForm
              id={a.id}
              approvedAmount={a.approvedAmount}
              apr={a.apr}
              termMonths={a.termMonths}
              disbursedAt={
                a.disbursedAt
                  ? a.disbursedAt.toISOString().slice(0, 10)
                  : null
              }
              currency={a.currency ?? "USD"}
            />
          </Card>
        </div>

        <div className="mt-5">
          <Card title="Verification">
            <p className="mt-1 text-sm text-slate-500">
              Add your in-house verification links (e.g. ID verification) and
              send them to the applicant.
            </p>
            <VerificationLinksForm
              entityId={a.id}
              initialLinks={a.verificationLinks}
              upsertLink={upsertVerificationLink}
              sendLink={sendVerificationLink}
              deleteLink={deleteVerificationLink}
            />
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Internal notes">
            <NoteForm
              id={a.id}
              action={addNote}
              placeholder="Add an internal note — e.g. called applicant to verify income…"
            />
            {a.notes.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {a.notes.map((note) => (
                  <li
                    key={note.id}
                    className="rounded-xl bg-sun-soft/50 px-4 py-3"
                  >
                    <p className="whitespace-pre-wrap text-sm text-ink">
                      {note.body}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-400">
                      {stamp(note.createdAt)}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No notes yet.</p>
            )}
          </Card>

          <Card title="Timeline">
            {a.events.length > 0 ? (
              <ol className="mt-4 space-y-4">
                {a.events.map((event) => (
                  <li key={event.id} className="flex gap-3">
                    <span
                      className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_DOT[event.type] ?? "bg-slate-300"}`}
                      aria-hidden="true"
                    />
                    <div className="min-w-0">
                      <p className="text-sm text-ink">{event.message}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {stamp(event.createdAt)}
                      </p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-4 text-sm text-slate-400">No activity recorded.</p>
            )}
          </Card>
        </div>
      </div>
    </main>
  );
}
