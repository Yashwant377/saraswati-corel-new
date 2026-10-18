"use client";

import { useState } from "react";
import {
  BadgeCheck, ExternalLink, FileDown, QrCode, ScanLine, ShieldCheck, X, Copy, Check,
} from "lucide-react";
import { Reveal, SectionHeading } from "./Reveal";
import { openLead } from "@/lib/leadBus";
import type { Settings, Section } from "@/lib/types";

export type ReraDefaults = {
  number: string; url: string; promoter: string; qrImage: string;
  docUrl: string; docLabel: string; scanTip: string; note: string;
};

type Props = { section: Section; content: any; settings: Settings; defaults: ReraDefaults };

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-[var(--border)] pb-3 last:border-0 last:pb-0">
      <dt className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] shrink-0 pt-[3px]">{label}</dt>
      <dd className="text-sm font-medium text-right leading-snug">{value}</dd>
    </div>
  );
}

/**
 * MahaRERA disclosure section.
 * QR image + registration document are uploaded from the admin Section Manager
 * (Admin → Website Sections → “MahaRERA Details” → Publish).
 */
export default function ReraSection({ section, content, settings, defaults }: Props) {
  const c = { ...defaults, ...(content || {}) };
  const number = c.number || settings.rera.number;
  const url = c.url || settings.rera.url;
  const qrImage: string = c.qrImage || "";
  const docUrl: string = c.docUrl || "";

  const [zoom, setZoom] = useState(false);
  const [copied, setCopied] = useState(false);

  async function copyNumber() {
    try {
      await navigator.clipboard.writeText(number);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <SectionHeading eyebrow="MahaRERA" title={section.title} subtitle={section.subtitle} />

      <div className="grid lg:grid-cols-[1.08fr_.92fr] gap-6 lg:gap-8 items-stretch">
        {/* -------- registration card -------- */}
        <Reveal className="h-full">
          <div className="card h-full p-6 sm:p-8 flex flex-col">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[var(--accent-soft)] text-[var(--accent)]">
                <ShieldCheck style={{ width: 21, height: 21 }} />
              </span>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">Registered Project</p>
                <h3 className="font-display text-lg font-semibold">Government of Maharashtra · MahaRERA</h3>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              <Row
                label="Registration No."
                value={
                  <span className="inline-flex items-center gap-2">
                    <span className="font-mono text-[13px] sm:text-sm font-bold tracking-wide">{number}</span>
                    <button
                      type="button"
                      onClick={copyNumber}
                      className="rounded-lg p-1.5 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--accent)]"
                      aria-label="Copy RERA registration number"
                      title="Copy number"
                    >
                      {copied ? <Check style={{ width: 14, height: 14 }} className="text-emerald-600" /> : <Copy style={{ width: 14, height: 14 }} />}
                    </button>
                  </span>
                }
              />
              <Row label="Project" value={settings.branding.logoText || "Saraswati Coral"} />
              <Row label="Promoter" value={c.promoter} />
              <Row label="Location" value={settings.maps.address} />
              <Row label="Status" value={<span className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400"><BadgeCheck style={{ width: 15, height: 15 }} /> Registered &amp; On Record</span>} />
            </dl>

            <div className="mt-7 flex flex-wrap gap-3">
              <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm">
                Verify on MahaRERA <ExternalLink className="h-3.5 w-3.5" />
              </a>
              {docUrl && (
                <a href={docUrl} target="_blank" rel="noopener noreferrer" download className="btn-outline btn-sm">
                  <FileDown className="h-4 w-4" /> {c.docLabel}
                </a>
              )}
              <button type="button" onClick={() => openLead("enquiry")} className="btn-outline btn-sm">
                <ScanLine className="h-4 w-4" /> Get Project Documents
              </button>
            </div>

            <p className="mt-6 text-[11px] leading-relaxed text-[var(--muted)]">{c.note}</p>
          </div>
        </Reveal>

        {/* -------- QR card -------- */}
        <Reveal delay={90} className="h-full">
          <div className="card h-full p-6 sm:p-8 flex flex-col items-center justify-center text-center gap-5">
            {qrImage ? (
              <button
                type="button"
                onClick={() => setZoom(true)}
                className="group relative rounded-2xl border border-[var(--border)] bg-white p-3 shadow-soft transition-transform hover:-translate-y-0.5"
                aria-label="Enlarge MahaRERA QR code"
                title="Click to enlarge"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={qrImage}
                  alt={`MahaRERA QR code for registration number ${number}`}
                  width={200}
                  height={200}
                  className="h-[190px] w-[190px] object-contain sm:h-[210px] sm:w-[210px]"
                />
                <span className="absolute inset-x-3 bottom-3 rounded-xl bg-[#0e1626]/90 py-1.5 text-[11px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                  Click to enlarge
                </span>
              </button>
            ) : (
              <div className="flex h-[190px] w-[190px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--surface-2)] text-[var(--accent)] sm:h-[210px] sm:w-[210px]">
                <QrCode className="h-14 w-14 opacity-70" />
                <span className="px-4 text-[11px] font-semibold text-[var(--muted)]">Scan &amp; verify on the MahaRERA portal</span>
              </div>
            )}

            <div>
              <p className="font-display text-base font-semibold text-[var(--text)]">{c.scanTip || "Scan to verify this project"}</p>
              <p className="mx-auto mt-1.5 max-w-[320px] text-xs leading-relaxed text-[var(--muted)]">
                Point your phone camera at the QR code — it opens the official MahaRERA page for registration no.{" "}
                <span className="font-semibold text-[var(--text)]">{number}</span>.
              </p>
            </div>

            <a href={url} target="_blank" rel="noopener noreferrer" className="text-[12px] font-bold text-[var(--accent)] underline decoration-[var(--gold)] decoration-2 underline-offset-4 hover:text-[var(--gold)]">
              maharera.mahaonline.gov.in
            </a>
          </div>
        </Reveal>
      </div>

      {/* -------- QR lightbox -------- */}
      {zoom && qrImage && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-label="MahaRERA QR code"
          onClick={(e) => e.target === e.currentTarget && setZoom(false)}
        >
          <div className="modal-enter w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lift">
            <div className="flex items-start justify-between">
              <div className="text-left">
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[var(--gold)]">MahaRERA</p>
                <p className="font-mono text-sm font-bold text-slate-800">{number}</p>
              </div>
              <button onClick={() => setZoom(false)} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100">
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrImage} alt={`MahaRERA QR code ${number}`} width={320} height={320} className="mx-auto mt-4 h-auto w-full max-w-[320px] object-contain" />
            <p className="mt-4 text-xs text-slate-500">Scan with your phone camera to open the official registration record.</p>
            <a href={url} target="_blank" rel="noopener noreferrer" className="btn-primary btn-sm mt-4 w-full justify-center">
              Open MahaRERA portal <ExternalLink className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      )}
    </>
  );
}
