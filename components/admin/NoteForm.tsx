"use client";

import { useActionState, useEffect, useRef } from "react";

export interface NoteActionState {
  ok: boolean;
  message: string;
}

const INITIAL: NoteActionState = { ok: false, message: "" };

// Generic internal-note composer — shared by the loan-application and
// careers admin pages via the `action` prop (addNote / addCareerNote).
export default function NoteForm({
  id,
  action,
  placeholder = "Add an internal note…",
}: {
  id: string;
  action: (
    prev: NoteActionState,
    formData: FormData
  ) => Promise<NoteActionState>;
  placeholder?: string;
}) {
  const [state, formAction, pending] = useActionState(action, INITIAL);
  const formRef = useRef<HTMLFormElement>(null);

  // Clear the textarea once a note saves so the next note starts blank.
  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="mt-4">
      <input type="hidden" name="id" value={id} />
      <textarea
        name="body"
        rows={3}
        maxLength={2000}
        placeholder={placeholder}
        className="w-full rounded-xl border-2 border-slate-200 bg-white px-3 py-2.5 text-sm text-ink placeholder:text-slate-400 transition-colors focus:border-sun focus:outline-none focus:ring-4 focus:ring-sun/20"
      />
      <div className="mt-2 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="rounded-full bg-navy px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "Adding…" : "Add note"}
        </button>
        {state.message && (
          <span
            role="status"
            className={`text-sm font-medium ${state.ok ? "text-leaf-deep" : "text-red-600"}`}
          >
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
