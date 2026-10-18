import { NextRequest, NextResponse } from "next/server";
import { mutate, uid, dbReady, flushDB, getDB } from "@/lib/db";
import { notifySafe } from "@/lib/notify";
import { apiUser, rateLimited } from "@/lib/auth";
import { configurations } from "@/lib/siteConfig";
import type { Lead } from "@/lib/types";

export const dynamic = "force-dynamic";

function validPhone(p: string): boolean {
  const digits = (p || "").replace(/\D/g, "").replace(/^91/, "");
  return /^[6-9]\d{9}$/.test(digits);
}

export async function POST(req: NextRequest) {
  await dbReady();
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (rateLimited(`lead:${ip}`, 12)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  let body: any;
  try { body = await req.json(); } catch { body = {}; }

  const name = String(body.name || "").trim().slice(0, 120);
  const phone = String(body.phone || "").trim().slice(0, 20);
  const email = String(body.email || "").trim().slice(0, 160);
  const message = String(body.message || "").trim().slice(0, 2000);
  const configuration = String(body.configuration || "").slice(0, 80);
  const type = (["enquiry", "price", "visit", "callback", "brochure"] as const).includes(body.type) ? body.type : "enquiry";

  if (name.length < 2) return NextResponse.json({ error: "Please enter your full name." }, { status: 400 });
  if (!validPhone(phone)) return NextResponse.json({ error: "Please enter a valid 10-digit Indian mobile number." }, { status: 400 });
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
  }

  const lead: Lead = {
    id: uid(),
    type,
    name,
    phone,
    email,
    configuration: configuration || "Not decided",
    message,
    source: String(body.source || "website").slice(0, 60),
    status: "new",
    createdAt: new Date().toISOString(),
  };

  mutate((db) => { db.leads.unshift(lead); });

  // Persist before answering. If the database write fails we must NOT tell the
  // visitor "saved" — an ad-generated lead that silently disappears is worse
  // than an honest error.
  try {
    await flushDB();
  } catch (err: any) {
    console.error("[leads] persistence failed:", err?.message || err);
    await notifySafe({ event: "lead.failed", lead, error: err?.message || String(err) });
    const phone = getDB().settings?.contact?.phone || "";
    return NextResponse.json(
      {
        error: `We couldn't save your enquiry just now. Please call or WhatsApp us on ${phone} and our team will help you immediately.`,
        fallbackPhone: phone,
      },
      { status: 503 }
    );
  }

  // Best-effort push to your sales team (Zapier / Make / WhatsApp / Sheets).
  notifySafe({ event: "lead.created", lead });

  return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
}

export async function GET() {
  await dbReady();
  const user = apiUser("view_leads");
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { getDB } = await import("@/lib/db");
  const leads = getDB().leads;
  return NextResponse.json({ leads });
}
