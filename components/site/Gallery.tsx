"use client";

import { useMemo, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, ZoomIn } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { gallery as defaultGallery, project } from "@/lib/siteConfig";
import type { Section } from "@/lib/types";

export default function GallerySection({ section, content }: { section: Section; content: any }) {
  const gallery = content?.gallery || defaultGallery;
  const categories = useMemo<string[]>(
    () => ["All", ...Array.from(new Set<string>(gallery.map((g: any) => String(g.category))))],
    [gallery]
  );
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const filtered = useMemo(
    () => (active === "All" ? gallery : gallery.filter((g: any) => g.category === active)),
    [active, gallery]
  );

  const close = useCallback(() => setLightbox(null), []);
  const prev = useCallback(() => setLightbox((i) => (i === null ? i : (i - 1 + filtered.length) % filtered.length)), [filtered.length]);
  const next = useCallback(() => setLightbox((i) => (i === null ? i : (i + 1) % filtered.length)), [filtered.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, close, prev, next]);

  const current = lightbox !== null ? filtered[lightbox] : null;

  return (
    <>
      <SectionHeading eyebrow="Gallery" title={section.title} subtitle={section.subtitle} />

      <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Gallery categories">
        {categories.map((c) => (
          <button
            key={c}
            role="tab"
            aria-selected={active === c}
            onClick={() => { setActive(c); setLightbox(null); }}
            className={`px-4 py-2 rounded-full text-[13px] font-semibold transition-all ${
              active === c
                ? "bg-[var(--accent)] text-white shadow-md"
                : "bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((g: any, i: number) => (
          <Reveal key={g.src + i} delay={(i % 3) * 80} className={i === 0 ? "col-span-2 md:col-span-2 row-span-2" : ""}>
            <button
              onClick={() => setLightbox(i)}
              className="group relative block w-full overflow-hidden rounded-[var(--radius)] shadow-soft focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--accent)]"
              style={{ aspectRatio: i === 0 ? "auto" : "4/3", height: i === 0 ? "100%" : undefined, minHeight: i === 0 ? 300 : undefined }}
              aria-label={`Open image: ${g.title}`}
            >
              <Image
                src={g.src}
                alt={`${g.title} — ${project.name}`}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-108"
              />
              <span className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="absolute bottom-3 left-4 right-4 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-left">
                  <span className="block text-white text-sm font-semibold">{g.title}</span>
                  <span className="block text-white/70 text-xs">{g.category}</span>
                </span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-black shrink-0">
                  <ZoomIn className="h-4 w-4" />
                </span>
              </span>
            </button>
          </Reveal>
        ))}
      </div>

      {current && (
        <div
          className="fixed inset-0 z-[95] flex items-center justify-center bg-black/92 p-3 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
          onClick={(e) => e.target === e.currentTarget && close()}
        >
          <button onClick={close} aria-label="Close lightbox" className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2.5 text-white hover:bg-white/25 transition-colors">
            <X className="h-6 w-6" />
          </button>
          <button onClick={prev} aria-label="Previous image" className="absolute left-3 sm:left-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors">
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button onClick={next} aria-label="Next image" className="absolute right-3 sm:right-6 z-10 rounded-full bg-white/10 p-3 text-white hover:bg-white/25 transition-colors">
            <ChevronRight className="h-6 w-6" />
          </button>
          <figure className="lightbox-enter relative max-h-full w-full max-w-5xl">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl">
              <Image src={current.src} alt={current.title} fill sizes="90vw" className="object-contain bg-black" priority />
            </div>
            <figcaption className="mt-4 text-center">
              <p className="text-white font-display text-lg">{current.title}</p>
              <p className="text-white/60 text-sm">{current.category} · {(lightbox ?? 0) + 1} / {filtered.length}</p>
            </figcaption>
          </figure>
        </div>
      )}
    </>
  );
}
