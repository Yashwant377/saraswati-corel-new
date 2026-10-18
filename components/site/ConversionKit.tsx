"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Timer, CheckCircle2, X, Users, Flame, MessageSquareText } from "lucide-react";
import { openLead } from "@/lib/leadBus";
import type { Settings } from "@/lib/types";

/* ------------------------------ countdown ------------------------------ */
function useCountdown(target: string) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const end = useMemo(() => {
    const d = new Date(target + "T23:59:59");
    return isNaN(d.getTime()) ? null : d.getTime();
  }, [target]);
  if (!end) return null;
  let diff = Math.max(0, end - now);
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  const s = Math.floor((diff % 60000) / 1000);
  return { d, h, m, s };
}

export function CountdownChip({ settings, size = "sm" }: { settings: Settings; size?: "sm" | "lg" }) {
  const c = useCountdown(settings.conversion.offerEndsAt);
  if (!settings.conversion.countdown || !c) return null;
  const pad = (n: number) => String(n).padStart(2, "0");
  if (size === "lg") {
    return (
      <div className="inline-flex items-center gap-3 rounded-2xl bg-[var(--accent)] px-5 py-3 text-white shadow-lift">
        <Flame className="h-5 w-5 text-gold-300" />
        <span className="text-sm font-semibold mr-1">Launch offer ends in</span>
        {[
          [c.d, "days"], [c.h, "hrs"], [c.m, "min"], [c.s, "sec"],
        ].map(([v, l]) => (
          <span key={l as string} className="text-center">
            <span className="block font-mono text-xl font-bold tabular-nums leading-none">{pad(v as number)}</span>
            <span className="block text-[9px] uppercase tracking-wider text-white/60">{l}</span>
          </span>
        ))}
      </div>
    );
  }
  return (
    <span className="chip !bg-[#7c2d12]/15 !text-orange-700 border border-orange-300/60 backdrop-blur">
      <Timer className="h-3.5 w-3.5" />
      Offer ends in {c.d}d {pad(c.h)}h {pad(c.m)}m {pad(c.s)}s
    </span>
  );
}

/* --------------------------- social proof toasts --------------------------- */
function SocialProofToasts({ settings }: { settings: Settings }) {
  const msgs = settings.conversion.socialMessages || [];
  const [idx, setIdx] = useState(0);
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!settings.conversion.socialProof || msgs.length === 0 || dismissed) return;
    let hideT: any;
    const cycle = setInterval(() => {
      setShow(true);
      hideT = setTimeout(() => {
        setShow(false);
        setIdx((i) => (i + 1) % msgs.length);
      }, 6500);
    }, 16000);
    // first toast a bit earlier
    const first = setTimeout(() => setShow(true), 7000);
    const firstHide = setTimeout(() => { setShow(false); setIdx(1 % msgs.length); }, 13500);
    return () => { clearInterval(cycle); clearTimeout(hideT); clearTimeout(first); clearTimeout(firstHide); };
  }, [settings.conversion.socialProof, dismissed, msgs.length]);

  if (!settings.conversion.socialProof || !show || dismissed || msgs.length === 0) return null;
  const msg = msgs[idx % msgs.length];

  return (
    <div className="fixed left-4 bottom-24 lg:bottom-6 z-[60] modal-enter" role="status" aria-live="polite">
      <div className="flex items-center gap-3 rounded-2xl border border-[var(--border)] bar-solid px-4 py-3 shadow-lift max-w-[320px]">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[var(--accent)]">
          <CheckCircle2 className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
        </span>
        <div className="min-w-0">
          <p className="text-[13px] font-semibold leading-snug">{msg}</p>
          <p className="text-[11px] text-[var(--muted)]">Verified enquiry · moments ago</p>
        </div>
        <button onClick={() => setDismissed(true)} aria-label="Dismiss notification" className="ml-1 rounded-full p-1 text-[var(--muted)] hover:bg-[var(--surface-2)]">
          <X style={{ width: 14, height: 14 }} />
        </button>
      </div>
    </div>
  );
}

/* ------------------------- exit intent + mobile nudge ------------------------- */
function ExitIntent({ settings }: { settings: Settings }) {
  const armed = useRef(false);
  useEffect(() => {
    if (!settings.conversion.exitIntent) return;
    if (typeof window === "undefined") return;
    setTimeout(() => { armed.current = true; }, 12000);

    const leadOpened = () => sessionStorage.setItem("ag-lead-opened", "1");
    window.addEventListener("ag:open-lead", leadOpened);

    // Desktop: exit intent (cursor leaves viewport top)
    const onOut = (e: MouseEvent) => {
      if (!armed.current) return;
      if (e.clientY > 4) return;
      if (sessionStorage.getItem("ag-exit-shown") || sessionStorage.getItem("ag-lead-opened")) return;
      sessionStorage.setItem("ag-exit-shown", "1");
      openLead("price");
    };
    document.addEventListener("mouseout", onOut);

    // Mobile: gentle nudge after 45s of browsing without enquiry
    const nudge = setTimeout(() => {
      if (window.innerWidth >= 1024) return;
      if (sessionStorage.getItem("ag-exit-shown") || sessionStorage.getItem("ag-lead-opened")) return;
      sessionStorage.setItem("ag-exit-shown", "1");
      window.dispatchEvent(new CustomEvent("ag:nudge"));
    }, 45000);

    return () => {
      document.removeEventListener("mouseout", onOut);
      window.removeEventListener("ag:open-lead", leadOpened);
      clearTimeout(nudge);
    };
  }, [settings.conversion.exitIntent]);
  return null;
}

function MobileNudge({ settings }: { settings: Settings }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const on = () => setShow(true);
    window.addEventListener("ag:nudge", on);
    return () => window.removeEventListener("ag:nudge", on);
  }, []);
  if (!show) return null;
  return (
    <div className="fixed inset-x-3 bottom-20 z-[60] modal-enter lg:hidden" role="status">
      <div className="flex items-center gap-3 rounded-2xl bg-[var(--accent)] text-white px-4 py-3 shadow-lift">
        <Users className="h-5 w-5 shrink-0 text-gold-300" />
        <p className="flex-1 text-[13px] font-semibold leading-snug">
          {settings.conversion.enquiriesToday} families enquired today. Get today's price list before it changes.
        </p>
        <button onClick={() => { setShow(false); openLead("price"); }} className="btn-gold btn-sm shrink-0">
          <MessageSquareText style={{ width: 14, height: 14 }} /> Get Price
        </button>
        <button onClick={() => setShow(false)} aria-label="Dismiss" className="rounded-full p-1 text-white/70"><X style={{ width: 14, height: 14 }} /></button>
      </div>
    </div>
  );
}

export default function ConversionKit({ settings }: { settings: Settings }) {
  return (
    <>
      <SocialProofToasts settings={settings} />
      <ExitIntent settings={settings} />
      <MobileNudge settings={settings} />
    </>
  );
}
