"use client";

import { useState, useTransition } from "react";

// Generic archive/restore toggle — shared by the loan-application and
// careers admin pages via the `action` prop (setArchived / setCareerArchived).
export default function ArchiveButton({
  id,
  archived,
  action,
}: {
  id: string;
  archived: boolean;
  action: (id: string, archived: boolean) => Promise<void>;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="inline-flex flex-col items-end gap-1">
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          setError(null);
          startTransition(async () => {
            try {
              await action(id, !archived);
            } catch {
              setError("Couldn't save. Try again.");
            }
          });
        }}
        className={`rounded-full border-2 px-4 py-2 text-sm font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
          archived
            ? "border-slate-200 text-navy hover:border-navy"
            : "border-red-200 text-red-600 hover:border-red-400"
        }`}
      >
        {pending ? "Saving…" : archived ? "Restore" : "Archive"}
      </button>
      {error && <span className="text-xs font-medium text-red-600">{error}</span>}
    </div>
  );
}
