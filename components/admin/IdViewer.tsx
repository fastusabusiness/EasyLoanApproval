"use client";

import { useState } from "react";

// Admin ID viewer. Shows only the ID type; the photo is fetched from
// /admin/applications/[id]/id-image the first time someone opens it, so admin
// pages don't ship a multi-MB image per applicant just to render a list.

export default function IdViewer({
  applicationId,
  label,
  name,
}: {
  applicationId: string;
  label: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"loading" | "loaded" | "failed">("loading");
  const src = `/admin/applications/${encodeURIComponent(applicationId)}/id-image`;

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setState("loading");
          setOpen(true);
        }}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-navy transition-colors hover:border-navy"
        title="View ID photo"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
        {label}
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-3">
              <p className="truncate text-sm font-bold text-navy">
                {label} — {name}
              </p>
              <div className="flex shrink-0 items-center gap-4 text-sm font-bold">
                <a
                  href={src}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-navy hover:underline"
                >
                  Open in new tab
                </a>
                <a href={`${src}?download=1`} className="text-navy hover:underline">
                  Download
                </a>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-slate-500 hover:text-ink"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>
            </div>
            <div className="overflow-auto bg-slate-50 p-4">
              {state === "loading" && (
                <p className="py-16 text-center text-sm text-slate-500">
                  Loading ID…
                </p>
              )}
              {state === "failed" && (
                <p className="py-16 text-center text-sm text-slate-500">
                  This ID photo couldn&apos;t be loaded.
                </p>
              )}
              {state !== "failed" && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={src}
                  alt={`${label} for ${name}`}
                  onLoad={() => setState("loaded")}
                  onError={() => setState("failed")}
                  className={`mx-auto max-h-[75vh] w-auto rounded-lg ${
                    state === "loaded" ? "" : "hidden"
                  }`}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
