import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const FIELD_KEYS = ["name", "title", "subtitle", "icon", "background", "layout", "visible", "animations"] as const;

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const db = getDB();
  const section = db.sections.find((s) => s.id === params.id);
  if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });

  // field updates supplied with this request
  const fields: any = {};
  FIELD_KEYS.forEach((f) => {
    if (body[f] !== undefined) fields[f] = body[f];
  });

  mutate((db) => {
    const s = db.sections.find((x) => x.id === params.id)!;

    if (body.action === "saveDraft") {
      // everything goes into the draft layer — live site is untouched
      if (body.draftData !== undefined) s.draftData = body.draftData;
      s.draftMeta = { ...(s.draftMeta || {}), ...fields };
    } else if (body.action === "publish") {
      if (body.draftData !== undefined) s.draftData = body.draftData;
      // promote pending field edits + content
      Object.assign(s, s.draftMeta || {}, fields);
      s.data = s.draftData;
      s.draftMeta = null;
      s.status = "published";
      s.visible = true;
    } else if (body.action === "revert") {
      s.draftData = s.data;
      s.draftMeta = null;
    } else {
      // immediate field updates (no draft workflow)
      Object.assign(s, fields);
      if (body.draftData !== undefined) s.draftData = body.draftData;
    }

    s.updatedAt = new Date().toISOString();
    audit(db, "section_update", user.id, { id: s.id, action: body.action || "fields" });
  });

  const updated = getDB().sections.find((s) => s.id === params.id)!;
  return NextResponse.json({ section: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  const db = getDB();
  const section = db.sections.find((s) => s.id === params.id);
  if (!section) return NextResponse.json({ error: "Section not found." }, { status: 404 });
  if (section.type === "hero") {
    return NextResponse.json({ error: "The Hero section cannot be deleted (you can hide it instead)." }, { status: 400 });
  }

  mutate((db) => {
    db.sections = db.sections.filter((s) => s.id !== params.id);
    audit(db, "section_delete", user.id, { id: params.id });
  });

  return NextResponse.json({ ok: true });
}
