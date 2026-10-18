"use client";

import { useState, useEffect } from "react";
import { X, BedDouble, Bath, Maximize, Download, Eye, ArrowRight } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import CTAButton from "./CTAButton";
import { configurations as defaultConfigs, project } from "@/lib/siteConfig";
import type { Section, } from "@/lib/types";
import type { Configuration } from "@/lib/siteConfig";

/* ------------------------- SVG floor-plan renderer ------------------------- */
const KIND_FILL: Record<string, string> = {
  bed: "#dbeafe", bath: "#e0f2fe", living: "#fef3c7", kitchen: "#fee2e2",
  balcony: "#dcfce7", utility: "#f3e8ff",
};
const KIND_STROKE: Record<string, string> = {
  bed: "#93b4e8", bath: "#7cc3e0", living: "#e3c766", kitchen: "#e8a1a1",
  balcony: "#86d49b", utility: "#c9a4e8",
};

export function FloorPlanSvg({ conf, darkText = false }: { conf: Configuration; darkText?: boolean }) {
  return (
    <svg viewBox="0 0 100 73" className="h-full w-full" role="img" aria-label={`${conf.config} floor plan`}>
      <rect x="2" y="4" width="96" height="64" rx="2" fill={darkText ? "#1b2a24" : "#ffffff"} stroke="#33413a" strokeWidth="1" />
      {conf.rooms.map((r, i) => (
        <g key={i}>
          <rect
            x={r.x} y={r.y} width={r.w} height={r.h} rx="1"
            fill={r.kind ? KIND_FILL[r.kind] : "#f1f5f0"}
            stroke={r.kind ? KIND_STROKE[r.kind] : "#aab5a8"}
            strokeWidth="0.6"
          />
          <text
            x={r.x + r.w / 2} y={r.y + r.h / 2 + 1}
            textAnchor="middle" fontSize={r.label.length > 14 ? 2.6 : 3.2}
            fontWeight="600" fill="#243529" fontFamily="Inter, sans-serif"
          >
            {r.label}
          </text>
        </g>
      ))}
      {/* entry arrow */}
      <path d="M50 70.5 L50 68.2" stroke="#c99a4b" strokeWidth="1.2" />
      <text x="50" y="72.6" textAnchor="middle" fontSize="2.6" fill="#c99a4b" fontWeight="700" fontFamily="Inter, sans-serif">ENTRY</text>
    </svg>
  );
}

function planToDataUrl(conf: Configuration): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 74" width="1200" height="888">
  <rect width="100" height="70" fill="#fbfaf7"/>
  <text x="50" y="2.6" text-anchor="middle" font-size="3" font-family="Georgia,serif" font-weight="700" fill="#16211d">${project.name} — ${conf.name} (${conf.saleableArea})</text>
  ${conf.rooms
    .map(
      (r) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="1" fill="${r.kind ? KIND_FILL[r.kind] : "#f1f5f0"}" stroke="${r.kind ? KIND_STROKE[r.kind] : "#aab5a8"}" stroke-width="0.6"/>
  <text x="${r.x + r.w / 2}" y="${r.y + r.h / 2 + 1}" text-anchor="middle" font-size="${r.label.length > 14 ? 2.6 : 3.2}" font-weight="600" fill="#243529" font-family="Arial,sans-serif">${r.label}</text>`
    )
    .join("\n  ")}
  <rect x="2" y="4" width="96" height="64" rx="2" fill="none" stroke="#33413a" stroke-width="1"/>
</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

/* ------------------------------- component ------------------------------- */
export default function FloorPlansSection({ section, content }: { section: Section; content: any }) {
  const configs: Configuration[] = content?.configurations || defaultConfigs;
  const [modal, setModal] = useState<Configuration | null>(null);

  useEffect(() => {
    if (!modal) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setModal(null);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [modal]);

  function download(conf: Configuration) {
    const a = document.createElement("a");
    a.href = planToDataUrl(conf);
    a.download = `${project.name.replace(/\s+/g, "-")}-${conf.config.replace(/[\s.]+/g, "-")}-floor-plan.svg`;
    a.click();
  }

  return (
    <>
      <SectionHeading eyebrow="Floor Plans" title={section.title} subtitle={section.subtitle} />
      <div
        className={`grid grid-cols-1 gap-5 ${
          configs.length <= 2 ? "sm:grid-cols-2 max-w-3xl mx-auto" : "sm:grid-cols-2 lg:grid-cols-4"
        }`}
      >
        {configs.map((c, i) => (
          <Reveal key={c.id} delay={i * 80} className="h-full">
            <div className="card flex h-full flex-col overflow-hidden transition-all hover:-translate-y-1.5 hover:shadow-lift">
              <button
                onClick={() => setModal(c)}
                className="relative block bg-[var(--surface-2)] p-4 aspect-[10/7] group"
                aria-label={`View ${c.config} floor plan`}
              >
                <FloorPlanSvg conf={c} />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-colors">
                  <span className="flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Eye className="h-4 w-4" /> View Plan
                  </span>
                </span>
              </button>
              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold">{c.config}</h3>
                <p className="text-xs text-[var(--muted)]">{c.name}</p>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[12.5px] text-[var(--muted)]">
                  <span className="flex items-center gap-1.5"><Maximize className="h-3.5 w-3.5 text-[var(--accent)]" /> {c.saleableArea}</span>
                  <span className="flex items-center gap-1.5"><BedDouble className="h-3.5 w-3.5 text-[var(--accent)]" /> {c.beds} Bed</span>
                  <span className="flex items-center gap-1.5"><Bath className="h-3.5 w-3.5 text-[var(--accent)]" /> {c.baths} Bath</span>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)]">Carpet {c.carpetArea}</p>
                <p className="mt-3 font-display text-xl font-bold text-[var(--accent)]">{c.price}</p>
                <div className="mt-4 grid grid-cols-2 gap-2 pt-1 flex-1 content-start">
                  <button onClick={() => setModal(c)} className="btn-soft btn-sm">View Floor Plan</button>
                  <button onClick={() => download(c)} className="btn-outline btn-sm text-[var(--text)] border-[var(--border)]">
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                  <CTAButton type="price" className="btn-primary btn-sm col-span-2">
                    Price on Request <ArrowRight className="h-3.5 w-3.5" />
                  </CTAButton>
                </div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
      <p className="mt-6 text-center text-[11px] text-[var(--muted)]">
        * Floor plans are indicative layout representations. Approved drawings shared at the experience centre.
      </p>

      {modal && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${modal.config} floor plan`}
          onClick={(e) => e.target === e.currentTarget && setModal(null)}
        >
          <div className="modal-enter w-full max-w-3xl rounded-[var(--radius)] bg-[var(--surface)] shadow-lift overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4">
              <div>
                <h3 className="font-display text-xl font-semibold">{modal.name}</h3>
                <p className="text-xs text-[var(--muted)]">
                  {modal.saleableArea} saleable · {modal.carpetArea} carpet · {modal.facing}
                </p>
              </div>
              <button onClick={() => setModal(null)} aria-label="Close floor plan" className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--surface-2)]">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="bg-[var(--surface-2)] p-6 sm:p-10">
              <FloorPlanSvg conf={modal} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border)] px-6 py-4">
              <p className="font-display text-2xl font-bold text-[var(--accent)]">{modal.price}</p>
              <div className="flex gap-2">
                <button onClick={() => download(modal)} className="btn-outline btn-sm text-[var(--text)] border-[var(--border)]">
                  <Download className="h-4 w-4" /> Download Floor Plan
                </button>
                <CTAButton type="price" className="btn-primary btn-sm">Get Price Details</CTAButton>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
