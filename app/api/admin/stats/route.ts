import { NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady();
  const user = apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = getDB();
  const dayAgo = Date.now() - 24 * 3600 * 1000;
  const weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

  return NextResponse.json({
    stats: {
      leads: db.leads.length,
      newLeads24h: db.leads.filter((l) => new Date(l.createdAt).getTime() > dayAgo).length,
      newLeads7d: db.leads.filter((l) => new Date(l.createdAt).getTime() > weekAgo).length,
      visits: db.visits.length,
      pendingVisits: db.visits.filter((v) => v.status === "requested").length,
      sections: db.sections.length,
      publishedSections: db.sections.filter((s) => s.status === "published" && s.visible).length,
      draftSections: db.sections.filter((s) => s.status === "draft").length,
      users: db.users.length,
    },
    recentLeads: db.leads.slice(0, 6),
    recentVisits: db.visits.slice(0, 4),
  });
}
