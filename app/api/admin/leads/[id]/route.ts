import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, audit, dbReady } from "@/lib/db";
import { leadStatuses } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_leads");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const db = getDB();
  if (!db.leads.some((l) => l.id === params.id)) {
    return NextResponse.json({ error: "Lead not found." }, { status: 404 });
  }

  mutate((db) => {
    const lead = db.leads.find((l) => l.id === params.id)!;
    if (leadStatuses.includes(body.status)) lead.status = body.status;
    if (typeof body.assignedTo === "string") lead.assignedTo = body.assignedTo.slice(0, 120);
    if (typeof body.message === "string") lead.message = body.message.slice(0, 2000);
    audit(db, "lead_update", user.id, { leadId: lead.id, status: lead.status });
  });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await dbReady();
  const user = apiUser("manage_leads");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  mutate((db) => {
    db.leads = db.leads.filter((l) => l.id !== params.id);
    audit(db, "lead_delete", user.id, { leadId: params.id });
  });
  return NextResponse.json({ ok: true });
}
