import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady();
  const user = apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: getDB().settings });
}

export async function PUT(req: NextRequest) {
  await dbReady();
  const user = apiUser("manage_settings");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  mutate((db) => {
    const s = db.settings;
    const merge = (target: any, src: any) => {
      if (!src || typeof src !== "object") return;
      Object.keys(src).forEach((k) => {
        const v = src[k];
        if (v && typeof v === "object" && !Array.isArray(v) && target[k] && typeof target[k] === "object") {
          merge(target[k], v);
        } else if (v !== undefined) {
          target[k] = v;
        }
      });
    };
    if (body.branding) merge(s.branding, body.branding);
    if (body.contact) merge(s.contact, body.contact);
    if (body.website) merge(s.website, body.website);
    if (body.theme) merge(s.theme, body.theme);
    if (body.maps) merge(s.maps, body.maps);
    if (body.rera) merge(s.rera, body.rera);
    audit(db, "settings_update", user.id, { groups: Object.keys(body) });
  });

  return NextResponse.json({ ok: true, settings: getDB().settings });
}
