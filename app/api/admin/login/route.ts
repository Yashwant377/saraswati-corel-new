import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSessionToken, rateLimited, SESSION_COOKIE } from "@/lib/auth";
import { mutate, dbReady } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbReady();
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(`login:${ip}`, 10)) {
    return NextResponse.json({ error: "Too many login attempts. Please try again in 10 minutes." }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }
  const identifier = String(body.identifier || "").trim();
  const password = String(body.password || "");

  if (!identifier || !password) {
    return NextResponse.json({ error: "Please enter your credentials." }, { status: 400 });
  }

  const user = authenticate(identifier, password);
  if (!user) {
    return NextResponse.json({ error: "Invalid email/username or password." }, { status: 401 });
  }

  mutate((db) => {
    const u = db.users.find((x) => x.id === user.id);
    if (u) u.lastLoginAt = new Date().toISOString();
    db.auditLog.unshift({ id: crypto.randomUUID().slice(0, 8), at: new Date().toISOString(), userId: user.id, action: "login" });
  });

  const token = createSessionToken(user.id);
  const res = NextResponse.json({
    ok: true,
    user: { id: user.id, name: user.name, email: user.email, role: user.role, mustChangePassword: user.mustChangePassword },
  });
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return res;
}
