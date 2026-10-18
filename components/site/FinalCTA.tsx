"use client";

import { ArrowRight, CalendarCheck } from "lucide-react";
import { openLead } from "@/lib/leadBus";
import { project } from "@/lib/siteConfig";

export default function FinalCTA() {
  return (
    <section aria-label="Final call to action" className="relative overflow-hidden bg-[var(--accent)]">
      <div
        className="absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: "url(/images/hero.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div className="absolute -left-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" aria-hidden />
      <div className="absolute -right-16 -bottom-20 h-64 w-64 rounded-full bg-[var(--gold)]/25 blur-3xl" aria-hidden />

      <div className="container-site relative section-pad text-center text-white">
        <p className="text-gold-300 font-bold uppercase tracking-[0.3em] text-xs mb-4">{project.city} · Premium Living</p>
        <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] max-w-3xl mx-auto">
          Find Your Perfect Home
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-white/80 text-base sm:text-lg">
          Get the latest price, availability and project details from our property experts.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <button onClick={() => openLead("price")} className="btn-gold btn-lg w-full sm:w-auto">
            Get Price Details <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => openLead("visit")}
            className="btn-outline btn-lg w-full sm:w-auto !text-white border-white/70 hover:!bg-white/10"
          >
            <CalendarCheck className="h-4 w-4" /> Schedule Site Visit
          </button>
        </div>
        <p className="mt-6 text-xs text-white/55">
          *Prices are indicative and subject to availability and applicable charges.
        </p>
      </div>
    </section>
  );
}
