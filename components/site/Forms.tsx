"use client";

import { Phone, Mail, Clock, MapPin, MessageCircle, ArrowRight, CalendarCheck, ShieldCheck, Zap, FileText } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import LeadForm from "./LeadForm";
import CTAButton from "./CTAButton";
import type { Section, Settings } from "@/lib/types";

type Props = { section: Section; content: any; settings: Settings };

/* ============================== ENQUIRY ============================== */
export function EnquirySection({ section, settings }: Props) {
  return (
    <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-10 items-center">
      <Reveal>
        <span className="eyebrow mb-3"><span className="h-px w-8 bg-[var(--gold)] inline-block" />Enquire</span>
        <h2 className="h-display text-3xl sm:text-4xl leading-[1.12]">{section.title}</h2>
        <p className="mt-4 text-[15px] text-[var(--muted)] leading-relaxed">{section.subtitle}</p>
        <ul className="mt-7 space-y-4">
          {[
            { icon: Zap, title: "Instant response", desc: "Property experts respond within 15 minutes during business hours." },
            { icon: FileText, title: "Complete information", desc: "Latest price sheet, masterplan, specifications and brochure — all in one go." },
            { icon: ShieldCheck, title: "Zero obligation", desc: "No spam calls. Your details stay between you and our certified team." },
          ].map((b) => (
            <li key={b.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <b.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-[15px]">{b.title}</span>
                <span className="block text-sm text-[var(--muted)]">{b.desc}</span>
              </span>
            </li>
          ))}
        </ul>
      </Reveal>
      <Reveal delay={120}>
        <div className="card p-7 sm:p-9 shadow-lift">
          <LeadForm type="enquiry" source="enquiry-section" />
        </div>
      </Reveal>
    </div>
  );
}

/* ============================== SITE VISIT ============================== */
export function SiteVisitSection({ section, settings }: Props) {
  return (
    <div className="relative overflow-hidden rounded-[calc(var(--radius)+8px)] bg-[#0e1626] text-white">
      <div
        className="absolute inset-0 opacity-25"
        style={{ backgroundImage: "url(/images/clubhouse.jpg)", backgroundSize: "cover", backgroundPosition: "center" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a1120]/95 via-[#0a1120]/80 to-[#0a1120]/40" aria-hidden />
      <div className="relative grid lg:grid-cols-[1fr_0.95fr] gap-10 p-8 sm:p-12 lg:p-16 items-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-gold-300 backdrop-blur">
            <CalendarCheck className="h-4 w-4" /> Site Visits · 7 Days
          </span>
          <h2 className="mt-5 font-display text-3xl sm:text-4xl lg:text-[2.7rem] font-semibold leading-[1.12]">
            {section.title}
          </h2>
          <p className="mt-4 text-white/70 text-[15px] leading-relaxed max-w-xl">{section.subtitle}</p>
          <ul className="mt-7 space-y-3 text-sm text-white/85">
            {[
              "Walk the actual site, towers and show flats",
              "Free pick-up & drop from select city points",
              "One-on-one time with a certified property expert",
              "Weekend slots include the clubhouse experience tour",
            ].map((li) => (
              <li key={li} className="flex items-center gap-3">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--gold)]/25 text-gold-300 shrink-0">
                  <ArrowRight className="h-3 w-3" />
                </span>
                {li}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href={`tel:${settings.contact.phoneDial}`} className="btn-gold">
              <Phone className="h-4 w-4" /> Call {settings.contact.phone}
            </a>
            <CTAButton type="callback" className="btn-outline !text-white border-white/50 hover:!bg-white/10">
              Request a Callback
            </CTAButton>
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-[var(--radius)] bg-white p-7 shadow-lift text-[var(--text)]">
            <h3 className="h-display text-xl mb-4">Book Your Visit Slot</h3>
            <LeadForm type="visit" source="site-visit-section" />
          </div>
        </Reveal>
      </div>
    </div>
  );
}

/* ============================== CONTACT ============================== */
export function ContactSection({ section, settings }: Props) {
  const wa = `https://wa.me/${settings.contact.whatsapp}?text=${encodeURIComponent(
    `Hi, I'd like to know more about ${settings.branding.logoText}.`
  )}`;
  return (
    <>
      <SectionHeading eyebrow="Contact" title={section.title} subtitle={section.subtitle} />
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        <Reveal delay={0}>
          <a href={`tel:${settings.contact.phoneDial}`} className="card flex h-full flex-col items-center gap-3 p-7 text-center transition-all hover:-translate-y-1 hover:shadow-lift group">
            <span className="flex h-13 w-13 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] p-3.5 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
              <Phone className="h-6 w-6" />
            </span>
            <span className="font-semibold">Call Sales Desk</span>
            <span className="text-sm text-[var(--muted)]">{settings.contact.phone}</span>
          </a>
        </Reveal>
        <Reveal delay={70}>
          <a href={wa} target="_blank" rel="noopener noreferrer" className="card flex h-full flex-col items-center gap-3 p-7 text-center transition-all hover:-translate-y-1 hover:shadow-lift group">
            <span className="flex items-center justify-center rounded-2xl bg-[#25D366]/12 text-[#1da851] p-3.5 group-hover:bg-[#25D366] group-hover:text-white transition-colors">
              <MessageCircle className="h-6 w-6" />
            </span>
            <span className="font-semibold">WhatsApp Us</span>
            <span className="text-sm text-[var(--muted)]">Instant replies & brochure</span>
          </a>
        </Reveal>
        <Reveal delay={140}>
          <a href={`mailto:${settings.contact.email}`} className="card flex h-full flex-col items-center gap-3 p-7 text-center transition-all hover:-translate-y-1 hover:shadow-lift group">
            <span className="flex items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] p-3.5 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
              <Mail className="h-6 w-6" />
            </span>
            <span className="font-semibold">Email</span>
            <span className="text-sm text-[var(--muted)] break-all">{settings.contact.email}</span>
          </a>
        </Reveal>
        <Reveal delay={210}>
          <a href={settings.maps.directionsUrl} target="_blank" rel="noopener noreferrer" className="card flex h-full flex-col items-center gap-3 p-7 text-center transition-all hover:-translate-y-1 hover:shadow-lift group">
            <span className="flex items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)] p-3.5 group-hover:bg-[var(--accent)] group-hover:text-white transition-colors">
              <MapPin className="h-6 w-6" />
            </span>
            <span className="font-semibold">Experience Centre</span>
            <span className="text-sm text-[var(--muted)] leading-snug">{settings.contact.address}</span>
          </a>
        </Reveal>
      </div>
      <Reveal delay={120}>
        <div className="mt-8 mx-auto max-w-2xl card px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-2 text-sm text-[var(--muted)]">
            <Clock className="h-4 w-4 text-[var(--accent)]" /> {settings.contact.hours}
          </p>
          <CTAButton type="callback" className="btn-primary btn-sm">Request a Callback</CTAButton>
        </div>
      </Reveal>
    </>
  );
}
