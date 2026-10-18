"use client";

import Image from "next/image";
import { MapPin, ShieldCheck, CalendarClock, BadgeIndianRupee, ArrowRight, PhoneCall, Users, Flame, Zap, FileDown, MessageCircle } from "lucide-react";
import LeadForm from "./LeadForm";
import { CountdownChip } from "./ConversionKit";
import { openLead } from "@/lib/leadBus";
import { project } from "@/lib/siteConfig";
import type { Settings } from "@/lib/types";

export default function Hero({ settings }: { settings: Settings }) {
  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center overflow-hidden bg-ink-900">
      {/* Background */}
      <div className="absolute inset-0">
        <Image
          src={settings.website.defaultImage || "/images/hero.jpg"}
          alt={`${project.name} premium township aerial view`}
          fill
          priority
          sizes="100vw"
          className="object-cover hero-img-anim"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />
      </div>

      <div className="container-site relative z-10 pt-28 lg:pt-36 pb-24 lg:pb-16 w-full">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-10 lg:gap-14 items-center">
          {/* Left copy */}
          <div className="text-white max-w-2xl">
            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <span className="chip !bg-white/10 !text-white border border-white/20 backdrop-blur">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-300" /> RERA Registered
              </span>
              <span className="chip !bg-[var(--gold)]/20 !text-gold-300 border border-gold-300/30 backdrop-blur">
                New Launch · {project.status.split("·")[0].trim()}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 mb-5">
              <CountdownChip settings={settings} />
              <span className="chip !bg-white/10 !text-white border border-white/20 backdrop-blur">
                <Flame className="h-3.5 w-3.5 text-orange-300" /> Only {settings.conversion.unitsLeft} homes left in Launch Phase
              </span>
              <span className="chip !bg-white/10 !text-white border border-white/20 backdrop-blur">
                <Users className="h-3.5 w-3.5 text-sky-300" /> {settings.conversion.enquiriesToday} enquiries in last 48 hrs
              </span>
            </div>

            <p className="text-gold-300 font-semibold uppercase tracking-[0.3em] text-xs sm:text-sm mb-3">
              {project.city} · Premium Luxury Apartments
            </p>
            <h1 className="font-display text-[2.6rem] sm:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight">
              {project.name}
            </h1>
            <p className="mt-4 text-xl sm:text-2xl font-light text-white/90 font-display italic">
              {project.tagline}
            </p>
            <p className="mt-4 flex items-start gap-2 text-sm sm:text-base text-white/75 max-w-xl">
              <MapPin className="h-5 w-5 shrink-0 mt-0.5 text-gold-300" />
              {project.location}
            </p>

            {/* Quick facts */}
            <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3">
                <BadgeIndianRupee className="h-4 w-4 text-gold-300 mb-1.5" />
                <p className="text-[11px] uppercase tracking-wider text-white/60">Starting</p>
                <p className="text-lg font-bold">{project.startingPrice}</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3">
                <MapPin className="h-4 w-4 text-gold-300 mb-1.5" />
                <p className="text-[11px] uppercase tracking-wider text-white/60">Configurations</p>
                <p className="text-lg font-bold">2 &amp; 3 BHK</p>
              </div>
              <div className="rounded-2xl bg-white/10 border border-white/15 backdrop-blur px-4 py-3">
                <CalendarClock className="h-4 w-4 text-gold-300 mb-1.5" />
                <p className="text-[11px] uppercase tracking-wider text-white/60">Possession</p>
                <p className="text-lg font-bold">{project.possession}</p>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <button onClick={() => openLead("price")} className="btn-gold btn-lg">
                Get Price Details <ArrowRight className="h-4 w-4" />
              </button>
              <button onClick={() => openLead("visit")} className="btn-outline btn-lg !text-white border-white/60 hover:!bg-white/10">
                <PhoneCall className="h-4 w-4" /> Schedule a Site Visit
              </button>
            </div>

            <p className="mt-5 text-[11px] text-white/55">
              RERA No: {settings.rera.number} · *Prices indicative, subject to availability &amp; applicable charges.
            </p>
          </div>

          {/* Right lead card (desktop) */}
          <aside className="hidden lg:block" aria-label="Get price details form">
            <div className="rounded-[28px] bg-[var(--surface)] p-7 shadow-lift border border-white/40 max-w-md ml-auto">
              <div className="mb-4">
                <p className="eyebrow mb-1.5"><Flame className="h-3.5 w-3.5" /> Launch-Phase Pricing Live</p>
                <h2 className="h-display text-2xl leading-snug">Unlock Today's Price List &amp; Availability</h2>
                <ul className="mt-3 space-y-1.5 text-[13px] text-[var(--muted)]">
                  <li className="flex items-center gap-2"><Zap className="h-3.5 w-3.5 text-[var(--gold)]" /> Price sheet + floor plans on WhatsApp in 5 minutes</li>
                  <li className="flex items-center gap-2"><FileDown className="h-3.5 w-3.5 text-[var(--gold)]" /> Instant e-brochure with payment plan</li>
                  <li className="flex items-center gap-2"><MessageCircle className="h-3.5 w-3.5 text-[var(--gold)]" /> Direct builder allotment · zero brokerage</li>
                </ul>
              </div>
              <LeadForm type="price" source="hero" />
            </div>
          </aside>
        </div>
      </div>

      {/* scroll hint */}
      <a
        href="#overview"
        aria-label="Scroll to overview"
        className="absolute bottom-24 lg:bottom-6 left-1/2 -translate-x-1/2 z-10 text-white/70 hover:text-white animate-bounce"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12l7 7 7-7"/></svg>
      </a>
    </section>
  );
}
