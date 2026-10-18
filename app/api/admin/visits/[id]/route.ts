import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

const STATUSES = ["requested", "confirmed", "completed", "cancelled"] as const;

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_visits");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const db = getDB();
  if (!db.visits.some((v) => v.id === params.id)) {
    return NextResponse.json({ error: "Visit not found." }, { status: 404 });
  }

  mutate((db) => {
    const visit = db.visits.find((v) => v.id === params.id)!;
    if ((STATUSES as readonly string[]).includes(body.status)) visit.status = body.status;
    audit(db, "visit_update", user.id, { visitId: visit.id, status: visit.status });
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_visits");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  mutate((db) => {
    db.visits = db.visits.filter((v) => v.id !== params.id);
    audit(db, "visit_delete", user.id, { visitId: params.id });
  });
  return NextResponse.json({ ok: true });
}
