"use client";

import { useState, useTransition } from "react";

// Generic result shape every entity's upsert/send/delete action returns —
// careers and loan applications both satisfy this structurally, so this
// component works for either without importing entity-specific actions.
export interface VerificationLinkActionResult {
  ok: boolean;
  message: string;
  id?: string;
  sentAt?: string;
}

interface LinkRow {
  // localKey is a stable React key for unsaved rows; id is the DB id once saved.
  localKey: string;
  id: string | null;
  label: string;
  url: string;
  sentAt: string | null;
}

function relativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diffMs / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

const fieldClass =
  "rounded-xl border-2 border-slate-200 bg-white px-3 py-2 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20";

export default function VerificationLinksForm({
  entityId,
  initialLinks,
  upsertLink,
  sendLink,
  deleteLink,
}: {
  entityId: string;
  initialLinks: { id: string; label: string; url: string; sentAt: Date | null }[];
  upsertLink: (
    entityId: string,
    linkId: string | null,
    label: string,
    url: string
  ) => Promise<VerificationLinkActionResult>;
  sendLink: (linkId: string) => Promise<VerificationLinkActionResult>;
  deleteLink: (linkId: string) => Promise<VerificationLinkActionResult>;
}) {
  const [rows, setRows] = useState<LinkRow[]>(
    initialLinks.map((l) => ({
      localKey: l.id,
      id: l.id,
      label: l.label,
      url: l.url,
      sentAt: l.sentAt ? l.sentAt.toISOString() : null,
    }))
  );
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function updateRow(localKey: string, patch: Partial<LinkRow>) {
    setRows((rs) => rs.map((r) => (r.localKey === localKey ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((rs) => [
      ...rs,
      { localKey: `new-${Date.now()}-${rs.length}`, id: null, label: "", url: "", sentAt: null },
    ]);
  }

  function removeRow(row: LinkRow) {
    setMessage(null);
    if (!row.id) {
      setRows((rs) => rs.filter((r) => r.localKey !== row.localKey));
      return;
    }
    setPendingKey(row.localKey);
    startTransition(async () => {
      const res = await deleteLink(row.id!);
      if (res.ok) {
        setRows((rs) => rs.filter((r) => r.localKey !== row.localKey));
      } else {
        setMessage(res.message);
      }
      setPendingKey(null);
    });
  }

  function saveAll() {
    setMessage(null);
    const toSave = rows.filter((r) => r.label.trim() && r.url.trim());
    if (toSave.length === 0) {
      setMessage("Add a label and link first.");
      return;
    }
    startTransition(async () => {
      let firstError: string | null = null;
      for (const row of toSave) {
        const res = await upsertLink(entityId, row.id, row.label, row.url);
        if (res.ok && res.id) {
          updateRow(row.localKey, { id: res.id });
        } else if (!res.ok && !firstError) {
          firstError = res.message;
        }
      }
      setMessage(firstError ?? "Links saved.");
    });
  }

  function sendRow(row: LinkRow) {
    setMessage(null);
    if (!row.label.trim() || !row.url.trim()) {
      setMessage("Add a label and link before sending.");
      return;
    }
    setPendingKey(row.localKey);
    startTransition(async () => {
      const saveRes = await upsertLink(entityId, row.id, row.label, row.url);
      if (!saveRes.ok || !saveRes.id) {
        setMessage(saveRes.message);
        setPendingKey(null);
        return;
      }
      updateRow(row.localKey, { id: saveRes.id });
      const sendRes = await sendLink(saveRes.id);
      if (sendRes.ok && sendRes.sentAt) {
        updateRow(row.localKey, { sentAt: sendRes.sentAt });
      }
      setMessage(sendRes.message);
      setPendingKey(null);
    });
  }

  return (
    <div className="mt-4">
      <div className="space-y-3">
        {rows.map((row) => {
          const isRowPending = pending && pendingKey === row.localKey;
          return (
            <div
              key={row.localKey}
              className="rounded-xl border-2 border-slate-100 p-3"
            >
              <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
                <input
                  type="text"
                  value={row.label}
                  onChange={(e) => updateRow(row.localKey, { label: e.target.value })}
                  placeholder="Label — e.g. ID verification"
                  maxLength={60}
                  className={`${fieldClass} w-full sm:w-44`}
                />
                <input
                  type="url"
                  value={row.url}
                  onChange={(e) => updateRow(row.localKey, { url: e.target.value })}
                  placeholder="https://your-verification-link.com/..."
                  className={`${fieldClass} min-w-0 flex-1`}
                />
                <button
                  type="button"
                  disabled={isRowPending}
                  onClick={() => sendRow(row)}
                  aria-label={`Send ${row.label || "link"}`}
                  title="Save and send to candidate"
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sun text-white transition-colors hover:bg-sun-deep disabled:cursor-not-allowed disabled:opacity-60"
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
                    <path d="m22 2-7 20-4-9-9-4Z" />
                    <path d="M22 2 11 13" />
                  </svg>
                </button>
                <button
                  type="button"
                  disabled={isRowPending}
                  onClick={() => removeRow(row)}
                  aria-label={`Remove ${row.label || "link"}`}
                  className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
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
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
              {row.sentAt && (
                <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-leaf-deep">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3"
                    aria-hidden="true"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Sent {relativeTime(row.sentAt)}
                </p>
              )}
            </div>
          );
        })}
        {rows.length === 0 && (
          <p className="text-sm text-slate-400">
            No verification links yet — add one below.
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={addRow}
          className="rounded-full border-2 border-slate-200 px-4 py-2 text-sm font-bold text-navy transition-colors hover:border-navy"
        >
          + Add link
        </button>
        <button
          type="button"
          disabled={pending && pendingKey === null}
          onClick={saveAll}
          className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending && pendingKey === null ? "Saving…" : "Save links"}
        </button>
        {message && (
          <span role="status" className="text-sm font-medium text-slate-500">
            {message}
          </span>
        )}
      </div>
    </div>
  );
}
