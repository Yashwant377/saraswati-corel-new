import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * Serves admin-uploaded files (QR codes, RERA documents, logos…).
 *
 * Files land in /public/uploads at runtime — Next.js resolves public assets at
 * build time, so a freshly uploaded file would 404 without this handler.
 */
const DIR = path.join(process.cwd(), "public", "uploads");

const TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
  svg: "image/svg+xml",
  pdf: "application/pdf",
};

const SAFE_NAME = /^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp|gif|svg|pdf)$/i;

export async function GET(_req: NextRequest, { params }: { params: { name: string } }) {
  const name = path.basename(String(params.name || ""));

  if (!SAFE_NAME.test(name)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let buf: Buffer;
  try {
    buf = await fs.readFile(path.join(DIR, name));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ext = name.split(".").pop()!.toLowerCase();
  const headers: Record<string, string> = {
    "Content-Type": TYPES[ext] || "application/octet-stream",
    "Content-Length": String(buf.length),
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  // Uploaded SVGs can carry scripts — neutralise when opened directly.
  if (ext === "svg") headers["Content-Security-Policy"] = "script-src 'none'; object-src 'none'";

  return new NextResponse(new Uint8Array(buf), { status: 200, headers });
}
