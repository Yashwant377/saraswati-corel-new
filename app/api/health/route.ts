import { NextResponse } from "next/server";
import { dbReady, dbHealth, storageMode } from "@/lib/db";
import { notifyEnabled } from "@/lib/notify";

export const dynamic = "force-dynamic";

/**
 * Liveness / storage check — open this after deploying to confirm the app is
 * actually talking to Postgres (and not silently falling back).
 *
 *   GET /api/health → { ok, db: { mode, ok, info } , leadWebhook }
 *
 * Returns 503 when the database is unreachable so uptime monitors catch it.
 */
export async function GET() {
  let ok = true;
  let db: any = { mode: storageMode };

  try {
    await dbReady();
    db = { ...db, ...(await dbHealth()) };
    if ((db as any).ok === false) ok = false;
  } catch {
    ok = false;
    db = { ...db, ok: false, error: "Database unreachable — lead capture will return a visible error and fall back to the alert webhook." };
  }

  return NextResponse.json(
    {
      ok,
      db,
      leadWebhook: notifyEnabled ? "configured" : "not configured",
      time: new Date().toISOString(),
    },
    { status: ok ? 200 : 503, headers: { "Cache-Control": "no-store" } }
  );
}
