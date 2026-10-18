import { NextResponse } from "next/server";
import { dbReady } from "@/lib/db";
import { getSessionUser } from "@/lib/auth";
import { ROLE_PERMISSIONS, ROLE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET() {
  await dbReady();
  const user = getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    user: {
      id: user.id, name: user.name, email: user.email, role: user.role,
      roleLabel: ROLE_LABELS[user.role],
      mustChangePassword: user.mustChangePassword,
      permissions: ROLE_PERMISSIONS[user.role],
    },
  });
}
