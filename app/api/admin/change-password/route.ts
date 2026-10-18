import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { mutate, hashPassword, verifyPassword, audit, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbReady();
  const user = apiUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const current = String(body.currentPassword || "");
  const next = String(body.newPassword || "");

  if (!user.mustChangePassword && !verifyPassword(current, user.passwordHash)) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 });
  }
  if (next.length < 10) {
    return NextResponse.json({ error: "New password must be at least 10 characters." }, { status: 400 });
  }
  if (!/[A-Z]/.test(next) || !/[a-z]/.test(next) || !/\d/.test(next)) {
    return NextResponse.json({ error: "Use upper & lower case letters and at least one number." }, { status: 400 });
  }
  if (verifyPassword(next, user.passwordHash)) {
    return NextResponse.json({ error: "New password must differ from the current one." }, { status: 400 });
  }

  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u) {
      u.passwordHash = hashPassword(next);
      u.mustChangePassword = false;
    }
    audit(db, "change_password", user.id);
  });

  return NextResponse.json({ ok: true });
}
