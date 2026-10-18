import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BedDouble, Bath, Maximize, Check, Star, Trees } from "lucide-react";
import { Icon } from "./Icon";
import { Reveal, SectionHeading } from "./Reveal";
import {
  overviewFacts, overviewText, highlights, configurations, amenityCategories, project,
} from "@/lib/siteConfig";
import type { Settings, Section } from "@/lib/types";
import CTAButton from "./CTAButton";

type SecProps = { section: Section; content: any; settings: Settings };

/* ============================== OVERVIEW ============================== */
export function OverviewSection({ section, content, settings }: SecProps) {
  const facts = content?.facts || overviewFacts;
  const text = content?.text || overviewText;

  return (
    <>
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <Reveal>
          <span className="eyebrow mb-3"><span className="h-px w-8 bg-[var(--gold)] inline-block" />The Project</span>
          <h2 className="h-display text-3xl sm:text-4xl lg:text-[2.7rem] leading-[1.12]">{section.title}</h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-[var(--muted)]">{text}</p>
          <div className="mt-7 flex flex-wrap gap-2.5">
            <span className="chip"><Icon name="ShieldCheck" className="h-3.5 w-3.5" /> RERA {settings.rera.number}</span>
            <span className="chip"><Icon name="CalendarCheck" className="h-3.5 w-3.5" /> {project.possession}</span>
            <span className="chip"><Icon name="HardHat" className="h-3.5 w-3.5" /> {project.status}</span>
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <CTAButton type="price" className="btn-primary">Get Price Details <ArrowRight className="h-4 w-4" /></CTAButton>
            <CTAButton type="visit" className="btn-soft">Book a Site Visit</CTAButton>
          </div>
        </Reveal>

        <Reveal delay={120} className="relative">
          <div className="relative rounded-[var(--radius)] overflow-hidden shadow-lift aspect-[4/3]">
            <Image src="/images/exterior.jpg" alt={`${project.name} tower elevation`} fill sizes="(max-width: 1024px) 100vw, 45vw" className="object-cover" />
          </div>
          <div className="hidden sm:block absolute -bottom-8 -left-8 w-44 rounded-[var(--radius)] overflow-hidden shadow-lift border-4 border-[var(--surface)] aspect-square">
            <Image src="/images/pool.jpg" alt="Resort style pool" fill sizes="200px" className="object-cover" />
          </div>
          <div className="absolute -top-5 -right-3 sm:-right-5 card px-5 py-4 shadow-lift">
            <p className="text-3xl font-display font-bold text-[var(--accent)]">{project.totalLand.split(" ")[0]}</p>
            <p className="text-xs font-semibold text-[var(--muted)] uppercase tracking-wider">Acres · 70% Open</p>
          </div>
        </Reveal>
      </div>

      <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4">
        {facts.map((f: any, i: number) => (
          <Reveal key={f.label} delay={i * 60}>
            <div className="card h-full p-5 transition-transform hover:-translate-y-1">
              <div className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name={f.icon} className="h-5.5 w-5.5" style={{ width: 22, height: 22 }} />
              </div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">{f.label}</p>
              <p className="mt-1 text-sm font-semibold leading-snug">{f.value}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ============================== HIGHLIGHTS ============================== */
export function HighlightsSection({ section, content }: SecProps) {
  const items = content?.items || highlights;
  return (
    <>
      <SectionHeading eyebrow="Project Highlights" title={section.title} subtitle={section.subtitle} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {items.map((h: any, i: number) => (
          <Reveal key={h.title} delay={(i % 3) * 90}>
            <div className="card group h-full p-6 transition-all hover:-translate-y-1.5 hover:shadow-lift relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-[var(--accent-soft)] opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[color-mix(in_srgb,var(--accent)_70%,#000)] text-white shadow-md">
                  <Icon name={h.icon} style={{ width: 22, height: 22 }} />
                </div>
                <h3 className="font-display text-lg font-semibold">{h.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{h.desc}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ============================== PRICING ============================== */
export function PricingSection({ section, content }: SecProps) {
  const configs = content?.configurations || configurations;
  return (
    <>
      <SectionHeading eyebrow="Pricing" title={section.title} subtitle={section.subtitle} />
      <div
        className={`grid grid-cols-1 gap-5 items-stretch ${
          configs.length <= 2
            ? "sm:grid-cols-2 max-w-3xl mx-auto"
            : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {configs.map((c: any, i: number) => {
          const featured = i === 1;
          return (
            <Reveal key={c.id || c.config} delay={i * 80} className="h-full">
              <div
                className={`card relative flex h-full flex-col p-6 transition-all hover:-translate-y-1.5 hover:shadow-lift ${
                  featured ? "ring-2 ring-[var(--accent)] lg:scale-[1.04]" : ""
                }`}
              >
                {featured && (
                  <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-[var(--accent)] px-4 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md flex items-center gap-1">
                    <Star className="h-3 w-3 fill-current" /> Most Popular
                  </span>
                )}
                <h3 className="font-display text-xl font-semibold">{c.config}</h3>
                <p className="text-xs font-medium text-[var(--muted)] mt-0.5">{c.name}</p>

                <p className="mt-4 font-display text-3xl font-bold text-[var(--accent)]">{c.price}</p>
                <p className="text-xs text-[var(--muted)]">onwards · {c.saleableArea} saleable</p>

                <ul className="mt-5 space-y-2 text-sm text-[var(--muted)] border-t border-[var(--border)] pt-5 flex-1">
                  <li className="flex items-center gap-2"><Maximize className="h-4 w-4 text-[var(--gold)]" /> Carpet {c.carpetArea}</li>
                  <li className="flex items-center gap-2"><BedDouble className="h-4 w-4 text-[var(--gold)]" /> {c.beds} Bedrooms</li>
                  <li className="flex items-center gap-2"><Bath className="h-4 w-4 text-[var(--gold)]" /> {c.baths} Bathrooms</li>
                  <li className="flex items-center gap-2"><Trees className="h-4 w-4 text-[var(--gold)]" /> {c.facing}</li>
                </ul>

                <div className="mt-6 space-y-2">
                  <CTAButton type="price" className={featured ? "btn-primary w-full" : "btn-soft w-full"}>Get Price Details</CTAButton>
                  <a href="#floor-plans" className="btn-outline w-full btn-sm text-[var(--text)] border-[var(--border)]">View Floor Plan</a>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
      <p className="mt-8 text-center text-xs text-[var(--muted)]">
        *Prices are indicative and subject to availability and applicable charges (GST, registration, floor-rise, facing
        preferences). Please confirm the latest price sheet with our sales team.
      </p>
    </>
  );
}

/* ============================== AMENITIES ============================== */
export function AmenitiesSection({ section, content }: SecProps) {
  const cats = content?.categories || amenityCategories;
  return (
    <>
      <SectionHeading eyebrow="40+ Amenities" title={section.title} subtitle={section.subtitle} />
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {cats.map((cat: any, i: number) => (
          <Reveal key={cat.id || cat.title} delay={i * 90} className="h-full">
            <div className="group relative h-full min-h-[340px] overflow-hidden rounded-[var(--radius)] shadow-soft sm:min-h-[420px]">
              <Image
                src={cat.image}
                alt={`${cat.title} amenities at ${project.name}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent transition-opacity group-hover:from-black/90" />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <h3 className="font-display text-2xl font-semibold text-white">{cat.title}</h3>
                {/* amenity list is always visible so every experience is discoverable at a glance */}
                <ul className="mt-3 grid gap-1.5">
                  {cat.items.map((it: string) => (
                    <li key={it} className="flex items-center gap-2 text-[13px] text-white/90">
                      <Check className="h-3.5 w-3.5 text-gold-300 shrink-0" /> {it}
                    </li>
                  ))}
                </ul>

              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <Reveal delay={200}>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 card px-8 py-5">
          <p className="text-sm text-[var(--muted)]">
            Two clubhouses · 60,000 sq.ft of curated lifestyle. Want the full amenity list?
          </p>
          <CTAButton type="brochure" className="btn-primary btn-sm">Download Brochure</CTAButton>
        </div>
      </Reveal>
    </>
  );
}
