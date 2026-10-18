"use client";

import { useEffect, useState, useCallback } from "react";
import { X } from "lucide-react";
import LeadForm from "./LeadForm";
import { LeadType, LEAD_TITLES } from "@/lib/leadBus";

export default function LeadModalHost() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<LeadType>("enquiry");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setType((detail.type as LeadType) || "enquiry");
      setOpen(true);
      try { sessionStorage.setItem("ag-lead-opened", "1"); } catch {}
    };
    window.addEventListener("ag:open-lead", handler);
    return () => window.removeEventListener("ag:open-lead", handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = useCallback(() => setOpen(false), []);

  if (!open) return null;
  const titles = LEAD_TITLES[type];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={titles.title}
      onClick={(e) => e.target === e.currentTarget && close()}
    >
      <div className="modal-enter w-full sm:max-w-lg max-h-[92vh] overflow-y-auto bg-[var(--surface)] sm:rounded-[var(--radius)] rounded-t-3xl shadow-lift">
        <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] px-6 py-4 sticky top-0 bg-[var(--surface)] z-10">
          <div>
            <h2 className="h-display text-xl">{titles.title}</h2>
            <p className="text-xs text-[var(--muted)] mt-0.5">Response within 15 minutes · Business hours</p>
          </div>
          <button
            onClick={close}
            aria-label="Close dialog"
            className="rounded-full p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 py-5" key={type}>
          <LeadForm type={type} source={`modal:${type}`} />
        </div>
      </div>
    </div>
  );
}
