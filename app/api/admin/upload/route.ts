import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { apiUser } from "@/lib/auth";
import { mutate, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/jpg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
  "image/svg+xml": "svg",
  "application/pdf": "pdf",
};

const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

/**
 * Uploads an image (QR code, logo, photo) or a PDF document and returns a
 * public URL that can be stored in settings or section content.
 *
 * POST /api/admin/upload   (multipart/form-data, field name: "file")
 * → { url: "/uploads/<id>.<ext>", name, type, size }
 */
export async function POST(req: NextRequest) {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Expected multipart/form-data upload." }, { status: 400 });
  }

  const file = form.get("file");
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file received. Use the “file” field." }, { status: 400 });
  }

  const blob = file as File;
  const ext = ALLOWED[blob.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type. Upload a PNG, JPG, WEBP, GIF, SVG or PDF." },
      { status: 415 }
    );
  }
  if (blob.size === 0) return NextResponse.json({ error: "File is empty." }, { status: 400 });
  if (blob.size > MAX_BYTES) return NextResponse.json({ error: "File is larger than 10 MB." }, { status: 413 });

  const safeBase = (blob.name || "upload")
    .replace(/\.[^.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40) || "upload";

  const fileName = `${safeBase}-${Date.now()}-${randomUUID().slice(0, 6)}.${ext}`;

  try {
    await fs.mkdir(UPLOAD_DIR, { recursive: true });
    await fs.writeFile(path.join(UPLOAD_DIR, fileName), Buffer.from(await blob.arrayBuffer()));
  } catch (e: any) {
    return NextResponse.json({ error: `Could not save file: ${e?.message || "unknown error"}` }, { status: 500 });
  }

  const url = `/uploads/${fileName}`;
  mutate((db) => audit(db, "upload_file", user.id, { url, bytes: blob.size, type: blob.type }));

  return NextResponse.json({ url, name: fileName, type: blob.type, size: blob.size }, { status: 201 });
}
