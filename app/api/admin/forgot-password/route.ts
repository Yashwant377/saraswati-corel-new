import { NextRequest, NextResponse } from "next/server";
import { mutate, uid, getDB, audit, dbReady } from "@/lib/db";
import { apiUser, rateLimited } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * No email server is wired up: a reset request is recorded and must be
 * fulfilled by a Super Admin from Admin → Users (reset password).
 */
export async function POST(req: NextRequest) {
  await dbReady();
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(`forgot:${ip}`, 5)) {
    return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
  }
  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const email = String(body.email || "").trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email is required." }, { status: 400 });

  mutate((db) => {
    db.passwordResets.unshift({ id: uid(), email, createdAt: new Date().toISOString(), resolved: false });
    audit(db, "password_reset_requested", undefined, { email });
  });

  // Deliberately generic response — do not leak which accounts exist.
  return NextResponse.json({
    ok: true,
    message: "If an admin account exists for this email, a Super Admin has been notified to reset it.",
  });
}

export async function GET() {
  await dbReady();
  const user = apiUser("manage_users");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ requests: getDB().passwordResets.filter((r) => !r.resolved) });
}
