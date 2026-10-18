"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { faqs as defaultFaqs } from "@/lib/siteConfig";
import type { Section } from "@/lib/types";

export default function FAQSection({ section, content }: { section: Section; content: any }) {
  const faqs = content?.faqs || defaultFaqs;
  const [open, setOpen] = useState<number | null>(0);

  return (
    <>
      <SectionHeading eyebrow="FAQs" title={section.title} subtitle={section.subtitle} />
      <div className="mx-auto max-w-3xl space-y-3">
        {faqs.map((f: any, i: number) => {
          const isOpen = open === i;
          return (
            <Reveal key={f.q} delay={Math.min(i * 50, 300)}>
              <div className={`card overflow-hidden transition-shadow ${isOpen ? "shadow-lift" : ""}`}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-btn-${i}`}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
                >
                  <span className="font-semibold text-[15px] leading-snug">{f.q}</span>
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                      isOpen ? "bg-[var(--accent)] text-white rotate-45" : "bg-[var(--accent-soft)] text-[var(--accent)]"
                    }`}
                  >
                    <Plus className="h-4 w-4" />
                  </span>
                </button>
                <div
                  id={`faq-panel-${i}`}
                  role="region"
                  aria-labelledby={`faq-btn-${i}`}
                  className="grid transition-all duration-300 ease-out"
                  style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
                >
                  <div className="overflow-hidden">
                    <p className="px-6 pb-5 text-sm leading-relaxed text-[var(--muted)]">{f.a}</p>
                  </div>
                </div>
              </div>
            </Reveal>
          );
        })}
      </div>
    </>
  );
}
