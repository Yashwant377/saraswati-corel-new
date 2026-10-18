import Image from "next/image";
import { ArrowUpRight, FileDown, Navigation, Quote, CheckCircle2, ShieldCheck, MapPinned } from "lucide-react";
import OpenEnquiry, { EnquiryHitArea } from "./OpenEnquiry";
import { Icon } from "./Icon";
import { Reveal, SectionHeading } from "./Reveal";
import CTAButton from "./CTAButton";
import { CountdownChip } from "./ConversionKit";
import {
  locationGroups, locationAdvantages, developer, offers, project, legal,
} from "@/lib/siteConfig";
import type { Settings, Section } from "@/lib/types";

type SecProps = { section: Section; content: any; settings: Settings };

/* ============================== LOCATION ============================== */
function MapPlaceholder({ settings }: { settings: Settings }) {
  const dir = settings.maps.directionsUrl || project.mapsUrl;
  return (
    <div className="group relative overflow-hidden rounded-[var(--radius)] shadow-lift border border-[var(--border)] bg-[#e9efe6] dark:bg-[#16231c] aspect-[4/3.4] cursor-pointer">
      {/* stylized map */}
      <svg viewBox="0 0 400 340" className="absolute inset-0 h-full w-full" role="img" aria-label="Stylized location map">
        <rect width="400" height="340" fill="#e9efe6" />
        <path d="M0 250 Q 120 230 200 250 T 400 235 L400 340 L0 340 Z" fill="#dce8d6" />
        <path d="M-10 90 C 80 70, 150 130, 240 100 S 380 60, 420 90" stroke="#f6d089" strokeWidth="14" fill="none" strokeLinecap="round" />
        <path d="M-10 90 C 80 70, 150 130, 240 100 S 380 60, 420 90" stroke="#eab54f" strokeWidth="3" strokeDasharray="10 10" fill="none" />
        <path d="M150 -10 C 160 80, 130 160, 170 250 S 160 330, 180 350" stroke="#ffffff" strokeWidth="12" fill="none" />
        <path d="M150 -10 C 160 80, 130 160, 170 250 S 160 330, 180 350" stroke="#d7ddd2" strokeWidth="2" strokeDasharray="8 8" fill="none" />
        <path d="M-10 300 C 90 285, 190 300, 410 280" stroke="#ffffff" strokeWidth="8" fill="none" />
        <path d="M300 -10 C 310 60, 290 120, 320 180 S 300 300, 310 350" stroke="#ffffff" strokeWidth="7" fill="none" />
        <circle cx="70" cy="180" r="26" fill="#cfe3c8" />
        <circle cx="330" cy="60" r="34" fill="#cfe3c8" />
        <path d="M40 300 q 40 -25 90 -8" stroke="#a8cdf0" strokeWidth="9" fill="none" strokeLinecap="round" />
        {/* POIs */}
        {[
          { x: 96, y: 74, l: "Metro" },
          { x: 268, y: 128, l: "IT Hub" },
          { x: 84, y: 244, l: "School" },
          { x: 322, y: 232, l: "Mall" },
          { x: 226, y: 296, l: "Hospital" },
        ].map((p) => (
          <g key={p.l}>
            <circle cx={p.x} cy={p.y} r="9" fill="#fff" stroke="#b9c4b2" strokeWidth="1.5" />
            <circle cx={p.x} cy={p.y} r="3.4" fill="#8a977f" />
            <text x={p.x} y={p.y - 14} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#5c6b52">{p.l}</text>
          </g>
        ))}
        {/* project marker */}
        <g transform="translate(178,168)">
          <circle r="30" fill="var(--accent)" opacity="0.16">
            <animate attributeName="r" values="22;34;22" dur="2.6s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.25;0.05;0.25" dur="2.6s" repeatCount="indefinite" />
          </circle>
          <path d="M0 -26 C -12 -26 -18 -17 -18 -9 C -18 4 0 22 0 22 C 0 22 18 4 18 -9 C 18 -17 12 -26 0 -26 Z" fill="var(--accent)" stroke="#fff" strokeWidth="2.5" />
          <circle cy="-9" r="6" fill="#fff" />
        </g>
        <rect x="128" y="200" width="105" height="24" rx="12" fill="#111c17" opacity="0.85" />
        <text x="180" y="216" textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff">{project.name}</text>
      </svg>

      {/* whole map is a click target → enquiry popup */}
      <EnquiryHitArea
        label="View the full map and get complete project details"
        className="rounded-[var(--radius)]"
      />

      <div className="absolute left-4 top-4 z-[2] card !rounded-2xl px-4 py-3 max-w-[62%] pointer-events-none">
        <p className="text-[11px] font-bold uppercase tracking-wider text-[var(--gold)]">Project Location</p>
        <p className="text-xs font-medium leading-snug mt-0.5">{settings.maps.address || project.location}</p>
      </div>

      <span className="pointer-events-none absolute bottom-4 left-4 z-[2] hidden rounded-full bg-[#0e1626]/90 px-3.5 py-1.5 text-[11px] font-bold text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 sm:inline-flex">
        Click map to view full map &amp; get details
      </span>

      <div className="absolute bottom-4 right-4 z-[2] flex flex-wrap items-center justify-end gap-2">
        <OpenEnquiry
          className="btn-primary btn-sm shadow-lift"
          ariaLabel="View map and get project details"
          title="View map & get details"
        >
          <MapPinned className="h-4 w-4" /> View Map
        </OpenEnquiry>
        <a
          href={dir}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-white/95 px-3 py-2 text-[11px] font-bold text-[var(--accent)] shadow-soft backdrop-blur transition-colors hover:bg-white"
        >
          <Navigation className="h-3.5 w-3.5" /> Google Maps
        </a>
      </div>
    </div>
  );
}

export function LocationSection({ section, content, settings }: SecProps) {
  const groups = content?.groups || locationGroups;
  return (
    <>
      <SectionHeading eyebrow="Location" title={section.title} subtitle={section.subtitle} />
      <div className="grid lg:grid-cols-2 gap-10 items-start">
        <Reveal>
          <MapPlaceholder settings={settings} />
          <p className="mt-3 text-[11px] text-[var(--muted)]">
            * Map is indicative. Click the map or “View Map” for complete project details, price list &amp; site-visit slots — or open Google Maps for the exact route.
          </p>
        </Reveal>
        <div className="grid sm:grid-cols-2 gap-4">
          {groups.map((g: any, i: number) => (
            <Reveal key={g.title} delay={i * 70}>
              <div className="card h-full p-5">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                  <Icon name={g.icon} style={{ width: 19, height: 19 }} />
                </div>
                <h3 className="font-display text-base font-semibold">{g.title}</h3>
                <ul className="mt-2 space-y-1.5">
                  {g.items.map((it: string) => (
                    <li key={it} className="flex items-start gap-1.5 text-[13px] text-[var(--muted)]">
                      <span className="mt-[7px] h-1 w-1 rounded-full bg-[var(--gold)] shrink-0" /> {it}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </>
  );
}

/* ============================== LOCATION ADVANTAGES ============================== */
export function LocationAdvantagesSection({ section, content }: SecProps) {
  const items = content?.items || locationAdvantages;
  return (
    <>
      <SectionHeading eyebrow="Connectivity" title={section.title} subtitle={section.subtitle} />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {items.map((a: any, i: number) => (
          <Reveal key={a.label} delay={i * 60}>
            <div className="card group p-5 text-center transition-all hover:-translate-y-1 hover:shadow-lift">
              <div className="mx-auto mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)] transition-colors group-hover:bg-[var(--accent)] group-hover:text-white">
                <Icon name={a.icon} style={{ width: 21, height: 21 }} />
              </div>
              <p className="font-display text-2xl font-bold text-[var(--accent)]">{a.time}</p>
              <p className="mt-1 text-[13px] font-medium text-[var(--muted)] leading-snug">{a.label}</p>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-[var(--muted)]">
        * Travel times are approximate, depend on traffic conditions, and are configurable from the admin panel.
      </p>
    </>
  );
}

/* ============================== DEVELOPER ============================== */
export function DeveloperSection({ section, content, settings }: SecProps) {
  const d = content?.developer || developer;
  const stats = [
    { value: d.yearsExperience?.split(" ")[0] || "27+", label: "Years of Experience" },
    { value: d.projectsDelivered?.split(" ")[0] || "42", label: "Projects Delivered" },
    { value: (d.cities || "").split("·").length ? String((d.cities || "").split("·").length) : "3", label: "Cities Served" },
    { value: d.sqftDelivered?.split(" ")[0] || "2.6 Cr+", label: "Sq.ft Developed" },
  ];
  return (
    <div className="grid lg:grid-cols-[1fr_1.05fr] gap-12 items-center">
      <Reveal>
        <span className="eyebrow mb-3"><span className="h-px w-8 bg-[var(--gold)] inline-block" />The Developer</span>
        <h2 className="h-display text-3xl sm:text-4xl leading-[1.12]">{section.title || d.name}</h2>
        <div className="mt-5 flex items-center gap-4 card px-5 py-4 w-fit">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--accent)] font-display text-2xl font-bold text-white">
            {(d.name || "A")[0]}
          </div>
          <div>
            <p className="font-display text-lg font-semibold">{d.name}</p>
            <p className="text-xs text-[var(--muted)]">{d.since ? `Since ${d.since}` : ""} · {d.cities}</p>
          </div>
        </div>
        <p className="mt-6 text-[15px] leading-relaxed text-[var(--muted)]">{d.statement}</p>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {(d.credentials || []).map((c: string) => (
            <span key={c} className="chip"><ShieldCheck className="h-3.5 w-3.5" /> {c}</span>
          ))}
        </div>
      </Reveal>
      <Reveal delay={120}>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="card p-6 text-center">
              <p className="font-display text-3xl font-bold text-[var(--accent)]">{s.value}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{s.label}</p>
            </div>
          ))}
          <div className="col-span-2 relative rounded-[var(--radius)] overflow-hidden shadow-soft aspect-[21/9]">
            <Image src="/images/landscape.jpg" alt={`${d.name} community landscape`} fill sizes="(max-width:1024px) 100vw, 50vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <p className="absolute bottom-4 left-5 text-white font-display text-lg font-semibold">
              {d.projectsOngoing || "8 Ongoing Projects"} · {d.cities}
            </p>
          </div>
        </div>
      </Reveal>
    </div>
  );
}

/* ============================== OFFERS ============================== */
export function OffersSection({ section, content, settings }: SecProps) {
  const items = content?.offers || offers;
  return (
    <>
      <SectionHeading eyebrow="Exclusive Benefits" title={section.title} subtitle={section.subtitle} />
      <Reveal>
        <div className="mb-8 flex justify-center">
          <CountdownChip settings={settings} size="lg" />
        </div>
      </Reveal>
      <div className="grid md:grid-cols-3 gap-5">
        {items.map((o: any, i: number) => (
          <Reveal key={o.title} delay={i * 90} className="h-full">
            <div className="card relative h-full overflow-hidden p-7 transition-transform hover:-translate-y-1.5 border-dashed !border-2 !border-[var(--gold)]/50">
              <span className="absolute right-5 top-5 rounded-full bg-[var(--gold)]/15 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--gold)]">
                {o.tag || "Offer"}
              </span>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--gold)]/15 text-[var(--gold)]">
                <Icon name={o.icon} style={{ width: 22, height: 22 }} />
              </div>
              <h3 className="font-display text-lg font-semibold pr-16">{o.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">{o.desc}</p>
              <CTAButton type="enquiry" className="btn-soft btn-sm mt-5">Claim This Offer</CTAButton>
            </div>
          </Reveal>
        ))}
      </div>
    </>
  );
}

/* ============================== BROCHURE ============================== */
export function BrochureSection({ section, settings }: SecProps) {
  return (
    <Reveal>
      <div className="card mx-auto max-w-4xl overflow-hidden">
        <div className="grid md:grid-cols-[1fr_0.9fr]">
          <div className="p-8 md:p-10">
            <span className="eyebrow mb-3"><span className="h-px w-8 bg-[var(--gold)] inline-block" />E-Brochure</span>
            <h2 className="h-display text-3xl leading-tight">{section.title}</h2>
            <p className="mt-3 text-[15px] text-[var(--muted)]">{section.subtitle}</p>
            <ul className="mt-5 space-y-2 text-sm text-[var(--muted)]">
              {["Masterplan & tower layout", "Full specifications list", "Construction-linked payment plan", "Latest price list & availability"].map((li) => (
                <li key={li} className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[var(--accent)]" /> {li}</li>
              ))}
            </ul>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/api/brochure" className="btn-primary" download>
                <FileDown className="h-4 w-4" /> Download Brochure
              </a>
              <CTAButton type="brochure" className="btn-soft">Get it on WhatsApp</CTAButton>
            </div>
          </div>
          <div className="relative min-h-[220px]">
            <Image src="/images/clubhouse.jpg" alt="Clubhouse preview" fill sizes="(max-width:768px) 100vw, 40vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--surface)] via-transparent to-transparent md:from-[var(--surface)]" />
          </div>
        </div>
      </div>
    </Reveal>
  );
}

/* ============================== GENERIC / CUSTOM SECTIONS ============================== */
export function GenericSection({ section, content }: SecProps) {
  const blocks: any[] = content?.blocks || [];
  return (
    <>
      <SectionHeading eyebrow={section.name} title={section.title} subtitle={section.subtitle} />
      <div className="space-y-10">
        {blocks.map((b, bi) => {
          if (b.kind === "paragraph") {
            return <Reveal key={bi}><p className="mx-auto max-w-3xl text-center text-[15.5px] leading-relaxed text-[var(--muted)]">{b.text}</p></Reveal>;
          }
          if (b.kind === "stats") {
            return (
              <Reveal key={bi}>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {b.items.map((s: any) => (
                    <div key={s.label} className="card p-6 text-center">
                      <p className="font-display text-3xl font-bold text-[var(--accent)]">{s.value}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          }
          if (b.kind === "cards3") {
            return (
              <div key={bi} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {b.items.map((it: any, i: number) => (
                  <Reveal key={it.title} delay={i * 70} className="h-full">
                    <div className="card h-full p-6 transition-transform hover:-translate-y-1">
                      <CheckCircle2 className="h-6 w-6 text-[var(--accent)] mb-3" />
                      <h3 className="font-display text-base font-semibold">{it.title}</h3>
                      <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{it.desc}</p>
                    </div>
                  </Reveal>
                ))}
              </div>
            );
          }
          if (b.kind === "table") {
            return (
              <Reveal key={bi}>
                <div className="card overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--surface-2)]">
                        {b.columns.map((c: string) => (
                          <th key={c} className="px-5 py-3.5 text-left text-xs font-bold uppercase tracking-wider text-[var(--muted)]">{c}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {b.rows.map((r: string[], ri: number) => (
                        <tr key={ri} className="border-b border-[var(--border)] last:border-0">
                          {r.map((cell, ci) => (
                            <td key={ci} className={`px-5 py-3.5 ${ci === 0 ? "font-semibold" : "text-[var(--muted)]"} ${ci === 1 ? "text-[var(--accent)] font-semibold" : ""}`}>{cell}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Reveal>
            );
          }
          if (b.kind === "timeline") {
            return (
              <div key={bi} className="mx-auto max-w-3xl space-y-0">
                {b.items.map((t: any, i: number) => (
                  <Reveal key={i} delay={i * 80}>
                    <div className="relative flex gap-5 pb-8 last:pb-0">
                      <div className="flex flex-col items-center">
                        <span className="h-3.5 w-3.5 rounded-full bg-[var(--accent)] ring-4 ring-[var(--accent-soft)] shrink-0 mt-1" />
                        {i < b.items.length - 1 && <span className="w-px flex-1 bg-[var(--border)] mt-2" />}
                      </div>
                      <div className="card flex-1 p-5">
                        <p className="text-xs font-bold uppercase tracking-wider text-[var(--gold)]">{t.date} · {t.tower}</p>
                        <p className="mt-1.5 text-sm text-[var(--muted)] leading-relaxed">{t.update}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            );
          }
          if (b.kind === "testimonials") {
            return (
              <div key={bi} className="grid md:grid-cols-3 gap-5">
                {b.items.map((t: any, i: number) => (
                  <Reveal key={t.name} delay={i * 80} className="h-full">
                    <figure className="card h-full p-7 relative">
                      <Quote className="h-8 w-8 text-[var(--gold)]/40 absolute right-5 top-5" />
                      <blockquote className="text-[14.5px] leading-relaxed text-[var(--muted)]">“{t.quote}”</blockquote>
                      <figcaption className="mt-5 flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--accent-soft)] font-display font-bold text-[var(--accent)]">
                          {t.name[0]}
                        </span>
                        <span>
                          <span className="block text-sm font-semibold">{t.name}</span>
                          <span className="block text-xs text-[var(--muted)]">{t.role}</span>
                        </span>
                      </figcaption>
                      <div className="mt-3 flex gap-0.5 text-[var(--gold)]">
                        {Array.from({ length: 5 }).map((_, si) => <svg key={si} width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>)}
                      </div>
                    </figure>
                  </Reveal>
                ))}
              </div>
            );
          }
          if (b.kind === "docs") {
            return (
              <div key={bi} className="grid sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
                {b.items.map((doc: any, i: number) => (
                  <Reveal key={doc.title} delay={i * 70}>
                    <div className="card flex items-start gap-4 p-5">
                      <FileDown className="h-8 w-8 text-[var(--accent)] shrink-0" />
                      <div>
                        <p className="text-sm font-semibold">{doc.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-1">{doc.desc}</p>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>
            );
          }
          return null;
        })}
      </div>
      {blocks.length === 0 && (
        <p className="text-center text-sm text-[var(--muted)]">
          This section has no content yet. Add blocks from the Admin Panel → Section Manager.
        </p>
      )}
    </>
  );
}
