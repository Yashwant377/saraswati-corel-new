import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { mutate, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbReady();
  const user = apiUser("manage_sections");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const ids: string[] = Array.isArray(body.ids) ? body.ids : [];
  if (!ids.length) return NextResponse.json({ error: "No order provided." }, { status: 400 });

  mutate((db) => {
    ids.forEach((id, index) => {
      const s = db.sections.find((x) => x.id === id);
      if (s) s.order = index;
    });
    audit(db, "sections_reorder", user.id);
  });

  return NextResponse.json({ ok: true });
}
