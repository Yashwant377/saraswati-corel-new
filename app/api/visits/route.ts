import { NextRequest, NextResponse } from "next/server";
import { mutate, uid, dbReady, flushDB, getDB } from "@/lib/db";
import { notifySafe } from "@/lib/notify";
import { apiUser, rateLimited } from "@/lib/auth";
import type { SiteVisit } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  await dbReady();
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(`visit:${ip}`, 8)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const name = String(body.name || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 20);
  const digits = phone.replace(/\D/g, "").replace(/^91/, "");
  const email = String(body.email || "").trim().slice(0, 160);
  const preferredDate = String(body.preferredDate || "").slice(0, 20);
  const preferredSlot = String(body.preferredSlot || "morning").slice(0, 20);
  const mode = body.mode === "pickup" ? "pickup" : "self";
  const notes = String(body.notes || "").trim().slice(0, 2000);

  if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!/^[6-9]\d{9}$/.test(digits)) return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
  if (!preferredDate) return NextResponse.json({ error: "Please pick a preferred date." }, { status: 400 });

  const visit: SiteVisit = {
    id: uid(), name, phone, email, preferredDate, preferredSlot, mode, notes,
    status: "requested", createdAt: new Date().toISOString(),
  };

  mutate((db) => { db.visits.unshift(visit); });

  // a site-visit request is also a lead for the sales pipeline
  mutate((db) => {
    db.leads.unshift({
      id: uid(), type: "visit", name, phone, email,
      configuration: "Not decided", message: notes,
      preferredDate, source: "site-visit-form", status: "new",
      createdAt: new Date().toISOString(),
    });
  });

  // Persist before answering — never claim success if the write failed.
  try {
    await flushDB();
  } catch (err: any) {
    console.error("[visits] persistence failed:", err?.message || err);
    await notifySafe({ event: "visit.failed", visit, error: err?.message || String(err) });
    const phoneNo = getDB().settings?.contact?.phone || "";
    return NextResponse.json(
      {
        error: `We couldn't book that visit just now. Please call or WhatsApp us on ${phoneNo} and we'll schedule it for you.`,
        fallbackPhone: phoneNo,
      },
      { status: 503 }
    );
  }

  notifySafe({ event: "visit.created", visit });

  return NextResponse.json({ ok: true, id: visit.id }, { status: 201 });
}

export async function GET() {
  await dbReady();
  const user = apiUser("view_visits");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { getDB } = await import("@/lib/db");
  return NextResponse.json({ visits: getDB().visits });
}
