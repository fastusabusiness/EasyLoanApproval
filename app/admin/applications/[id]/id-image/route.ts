import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

// Serves an applicant's ID photo on demand. Admin pages show only the ID type
// and load the image from here when someone clicks to view it, instead of
// embedding a multi-MB data URL for every applicant in the page.

// Raster formats only. Uploads come from the public form, and an SVG served
// from this origin as a top-level page could run script in the admin session.
const SAFE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const app = await prisma.application.findUnique({
    where: { id },
    select: { idImage: true, fullName: true },
  });
  const src = app?.idImage;
  const comma = src?.indexOf(",") ?? -1;
  if (!app || !src || comma < 0) {
    return new Response("Not found", { status: 404 });
  }

  const mime = src
    .slice(0, comma)
    .match(/^data:([a-z0-9.+/-]+);base64$/i)?.[1]
    ?.toLowerCase();
  const ext = mime ? SAFE_TYPES[mime] : undefined;
  if (!mime || !ext) {
    return new Response("Unsupported image type", { status: 415 });
  }

  const fileName = `${app.fullName.replace(/[^a-z0-9]+/gi, "-")}-ID.${ext}`;
  const download = new URL(req.url).searchParams.get("download") === "1";

  return new Response(Buffer.from(src.slice(comma + 1), "base64"), {
    headers: {
      "Content-Type": mime,
      "Content-Disposition": `${download ? "attachment" : "inline"}; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "Content-Security-Policy": "sandbox",
    },
  });
}
