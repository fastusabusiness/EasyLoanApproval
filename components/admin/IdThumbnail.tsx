"use client";

import { useState } from "react";

// Admin ID viewer. The image is stored as a data: URL, and browsers block
// top-level navigation to data: URLs — so a plain <a href={dataUrl}> silently
// does nothing. Instead we open an in-page lightbox, plus offer "Open in new
// tab" via a blob URL (allowed) and a Download link (the download attribute
// works with data URLs).

function extFromDataUrl(src: string): string {
  const t = (src.match(/^data:image\/([a-z0-9.+-]+);/i)?.[1] ?? "jpeg").toLowerCase();
  return t === "jpeg" ? "jpg" : t;
}

export default function IdThumbnail({
  src,
  label,
  name,
}: {
  src: string;
  label: string;
  name: string;
}) {
  const [open, setOpen] = useState(false);

  function openInNewTab() {
    try {
      const [head, b64] = src.split(",");
      const mime = head.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const url = URL.createObjectURL(new Blob([bytes], { type: mime }));
      window.open(url, "_blank", "noopener,noreferrer");
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch {
      /* ignore — the lightbox already shows the image */
    }
  }

  const fileName = `${name.replace(/\s+/g, "-")}-ID.${extFromDataUrl(src)}`;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="group inline-block text-left"
        title="View full ID"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt={`${label} for ${name}`}
          className="h-12 w-20 rounded-md object-cover ring-1 ring-navy/10 transition group-hover:ring-2 group-hover:ring-sun"
        />
        <span className="mt-1 block text-xs font-medium text-slate-500">
          {label}
        </span>
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
                <button
                  type="button"
                  onClick={openInNewTab}
                  className="text-navy hover:underline"
                >
                  Open in new tab
                </button>
                <a
                  href={src}
                  download={fileName}
                  className="text-navy hover:underline"
                >
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
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`${label} for ${name}`}
                className="mx-auto max-h-[75vh] w-auto rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
