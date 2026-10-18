import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, uid, hashPassword, audit, dbReady } from "@/lib/db";
import { Role } from "@/lib/types";
import { roles } from "@/lib/db";

export const dynamic = "force-dynamic";

const publicUser = (u: any) => ({
  id: u.id, name: u.name, email: u.email, username: u.username, role: u.role,
  active: u.active, mustChangePassword: u.mustChangePassword,
  createdAt: u.createdAt, lastLoginAt: u.lastLoginAt,
});

export async function GET() {
  await dbReady();
  const user = apiUser("manage_users");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  const db = getDB();
  return NextResponse.json({
    users: db.users.map(publicUser),
    passwordResets: db.passwordResets.filter((r) => !r.resolved),
  });
}

export async function POST(req: NextRequest) {
  await dbReady();
  const admin = apiUser("manage_users");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const role = roles.includes(body.role) ? (body.role as Role) : "sales_agent";
  const tempPassword = String(body.password || "");

  if (name.length < 2) return NextResponse.json({ error: "Name is required." }, { status: 400 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return NextResponse.json({ error: "Valid email required." }, { status: 400 });
  if (tempPassword.length < 10) return NextResponse.json({ error: "Temporary password must be at least 10 characters." }, { status: 400 });

  const db = getDB();
  if (db.users.some((u) => u.email.toLowerCase() === email)) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  const newUser = {
    id: uid(), name, email, username: email.split("@")[0], role,
    passwordHash: hashPassword(tempPassword),
    mustChangePassword: true, active: true,
    createdAt: new Date().toISOString(),
  };

  mutate((db) => {
    db.users.push(newUser);
    audit(db, "user_create", admin.id, { userId: newUser.id, role });
  });

  return NextResponse.json({ user: publicUser(newUser) }, { status: 201 });
}
