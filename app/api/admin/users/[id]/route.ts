import { NextRequest, NextResponse } from "next/server";
import { apiUser } from "@/lib/auth";
import { getDB, mutate, hashPassword, audit, dbReady } from "@/lib/db";
import { Role } from "@/lib/types";
import { roles } from "@/lib/db";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

export async function PATCH(req: NextRequest, { params }: Ctx) {
  await dbReady();
  const admin = apiUser("manage_users");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const db = getDB();
  const target = db.users.find((u) => u.id === params.id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  // Safety: never allow removing the last active super admin
  const superAdmins = db.users.filter((u) => u.role === "super_admin" && u.active);
  const demoting = (body.role && body.role !== "super_admin") || body.active === false;
  if (target.role === "super_admin" && demoting && superAdmins.length <= 1) {
    return NextResponse.json({ error: "At least one active Super Admin must remain." }, { status: 400 });
  }

  mutate((db) => {
    const u = db.users.find((x) => x.id === params.id)!;
    if (typeof body.name === "string" && body.name.trim()) u.name = body.name.trim().slice(0, 120);
    if (roles.includes(body.role)) u.role = body.role as Role;
    if (typeof body.active === "boolean") u.active = body.active;
    if (typeof body.mustChangePassword === "boolean") u.mustChangePassword = body.mustChangePassword;
    if (typeof body.resetPassword === "string" && body.resetPassword.length >= 10) {
      u.passwordHash = hashPassword(body.resetPassword);
      u.mustChangePassword = true;
    }
    audit(db, "user_update", admin.id, { userId: u.id });

    // resolve matching password-reset requests
    if (body.resetPassword) {
      db.passwordResets.forEach((r) => { if (r.email === u.email) r.resolved = true; });
    }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  await dbReady();
  const admin = apiUser("manage_users");
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  if (admin.id === params.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }
  const db = getDB();
  const target = db.users.find((u) => u.id === params.id);
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });
  const superAdmins = db.users.filter((u) => u.role === "super_admin" && u.active);
  if (target.role === "super_admin" && superAdmins.length <= 1) {
    return NextResponse.json({ error: "At least one active Super Admin must remain." }, { status: 400 });
  }

  mutate((db) => {
    db.users = db.users.filter((u) => u.id !== params.id);
    audit(db, "user_delete", admin.id, { userId: params.id });
  });
  return NextResponse.json({ ok: true });
}
