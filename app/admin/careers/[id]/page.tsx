import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import BrandLogo from "@/components/BrandLogo";
import ArchiveButton from "@/components/admin/ArchiveButton";
import NoteForm from "@/components/admin/NoteForm";
import StatusSelect from "@/components/admin/StatusSelect";
import VerificationLinksForm from "@/components/admin/VerificationLinksForm";
import { isAdmin } from "@/lib/admin-auth";
import {
  CAREER_STATUSES,
  CAREER_STATUS_META,
  isCareerStatus,
} from "@/lib/career-status";
import { prisma } from "@/lib/prisma";
import { logout } from "../../actions";
import {
  addCareerNote,
  deleteVerificationLink,
  sendVerificationLink,
  setCareerArchived,
  updateCareerStatus,
  upsertVerificationLink,
} from "../actions";

export const metadata: Metadata = {
  title: "Candidate — Admin",
  robots: { index: false, follow: false },
};

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

export default async function CareerCandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  const { id } = await params;

  const candidate = await prisma.careerApplication.findUnique({
    where: { id },
    include: {
      notes: { orderBy: { createdAt: "desc" } },
      events: { orderBy: { createdAt: "desc" } },
      verificationLinks: { orderBy: { createdAt: "asc" } },
    },
  });
  if (!candidate) notFound();

  const c = candidate;
  const isArchived = c.archivedAt !== null;

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
          href="/admin/careers"
          className="inline-flex items-center gap-1.5 text-sm font-bold text-navy underline-offset-4 hover:underline"
        >
          ← Back to candidates
        </a>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-display text-3xl font-bold tracking-tight text-ink">
                {c.fullName}
              </h1>
              {isArchived && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-bold uppercase tracking-wider text-slate-600">
                  Archived
                </span>
              )}
            </div>
            <p className="mt-1 text-sm text-slate-500">{c.role} candidate</p>
          </div>
          <div className="flex items-center gap-3">
            <StatusSelect
              id={c.id}
              initialStatus={isCareerStatus(c.status) ? c.status : "applied"}
              statuses={CAREER_STATUSES}
              meta={CAREER_STATUS_META}
              action={updateCareerStatus}
            />
            <ArchiveButton id={c.id} archived={isArchived} action={setCareerArchived} />
          </div>
        </div>

        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Card title="Candidate">
            <dl className="mt-2 divide-y divide-slate-100">
              <InfoRow label="Role" value={c.role} />
              <InfoRow label="Email" value={c.email} />
              <InfoRow label="Phone" value={c.phone} />
              <InfoRow label="Location" value={c.location} />
              <InfoRow label="Submitted" value={stamp(c.createdAt)} />
            </dl>
          </Card>

          <Card title="Experience / pitch">
            {c.experience ? (
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink">
                {c.experience}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-400">
                No experience/pitch provided.
              </p>
            )}
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                CV / Resume
              </p>
              {c.resumeData ? (
                <a
                  href={c.resumeData}
                  download={c.resumeName ?? "resume"}
                  className="inline-flex items-center gap-2 rounded-xl border-2 border-slate-200 px-4 py-2.5 text-sm font-bold text-navy transition-colors hover:border-navy"
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-4 w-4"
                    aria-hidden="true"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                  {c.resumeName ?? "Download CV"}
                </a>
              ) : (
                <span className="text-sm text-slate-400">Not provided</span>
              )}
            </div>
          </Card>
        </div>

        <div className="mt-5">
          <Card title="Verification">
            <p className="mt-1 text-sm text-slate-500">
              Add your in-house verification links and send them to the candidate.
            </p>
            <VerificationLinksForm
              entityId={c.id}
              initialLinks={c.verificationLinks}
              upsertLink={upsertVerificationLink}
              sendLink={sendVerificationLink}
              deleteLink={deleteVerificationLink}
            />
          </Card>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <Card title="Internal notes">
            <NoteForm
              id={c.id}
              action={addCareerNote}
              placeholder="Add an internal note — e.g. left a voicemail, scheduled a call…"
            />
            {c.notes.length > 0 ? (
              <ul className="mt-4 space-y-3">
                {c.notes.map((note) => (
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
            {c.events.length > 0 ? (
              <ol className="mt-4 space-y-4">
                {c.events.map((event) => (
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
