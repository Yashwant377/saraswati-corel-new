"use client";

import { Phone, MessageCircle, CalendarCheck } from "lucide-react";
import { openLead } from "@/lib/leadBus";
import type { Settings } from "@/lib/types";

export default function StickyCTA({ settings }: { settings: Settings }) {
  const wa = `https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(
    `Hi, I'm interested in ${settings.branding.logoText}. Please share details.`
  )}`;

  return (
    <>
      {/* Floating WhatsApp (desktop) */}
      <a
        href={wa}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-6 right-6 z-40 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lift transition-transform hover:scale-110"
      >
        <MessageCircle className="h-7 w-7" />
      </a>

      {/* Sticky mobile CTA bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden border-t border-[var(--border)] bar-solid shadow-[0_-8px_30px_rgba(0,0,0,0.12)]">
        <div className="grid grid-cols-3 divide-x divide-[var(--border)]">
          <a href={`tel:${settings.contact.phoneDial}`} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-[var(--text)]">
            <Phone className="h-[18px] w-[18px] text-[var(--accent)]" /> Call Now
          </a>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-[var(--text)]">
            <MessageCircle className="h-[18px] w-[18px] text-[#25D366]" /> WhatsApp
          </a>
          <button onClick={() => openLead("enquiry")} className="flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold text-[var(--accent)]">
            <CalendarCheck className="h-[18px] w-[18px]" /> Enquire
          </button>
        </div>
      </div>
    </>
  );
}
