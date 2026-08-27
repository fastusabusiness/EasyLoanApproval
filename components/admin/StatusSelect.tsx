"use client";

import { useState, useTransition } from "react";

interface StatusMetaLike {
  label: string;
  badgeClasses: string;
}

// Generic labeled status dropdown with optimistic update + revert-on-error.
// Shared by the loan-application and careers admin pages — each passes its
// own status list, label/badge metadata, and update server action.
export default function StatusSelect<S extends string>({
  id,
  initialStatus,
  statuses,
  meta,
  action,
}: {
  id: string;
  initialStatus: S;
  statuses: readonly S[];
  meta: Record<S, StatusMetaLike>;
  action: (id: string, status: string) => Promise<void>;
}) {
  const [current, setCurrent] = useState(initialStatus);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const currentMeta = meta[current];

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <label
        className={`relative inline-flex items-center rounded-full border-2 px-3 py-1 text-xs font-bold transition-colors ${currentMeta.badgeClasses} ${pending ? "opacity-60" : ""}`}
      >
        <select
          value={current}
          disabled={pending}
          aria-label={`Status for ${id}`}
          onChange={(e) => {
            const next = e.target.value as S;
            const previous = current;
            setCurrent(next);
            setError(null);
            startTransition(async () => {
              try {
                await action(id, next);
              } catch {
                setCurrent(previous);
                setError("Couldn't save. Try again.");
              }
            });
          }}
          className="absolute inset-0 cursor-pointer appearance-none bg-transparent text-transparent opacity-0"
        >
          {statuses.map((s) => (
            <option key={s} value={s}>
              {meta[s].label}
            </option>
          ))}
        </select>
        <span className="pointer-events-none">{currentMeta.label}</span>
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className="pointer-events-none ml-1.5 h-3 w-3"
        >
          <path
            d="M2 4l4 4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </label>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
