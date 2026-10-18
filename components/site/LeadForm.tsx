"use client";

import { useState } from "react";
import { CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { configurations } from "@/lib/siteConfig";
import { LeadType, LEAD_TITLES } from "@/lib/leadBus";

type Props = {
  type: LeadType;
  compact?: boolean;
  variant?: "light" | "dark";
  source?: string;
  onDone?: () => void;
};

export default function LeadForm({ type, compact = false, variant = "light", source = "website", onDone }: Props) {
  const isVisit = type === "visit";
  const [form, setForm] = useState({
    name: "", phone: "", email: "", configuration: "", message: "",
    preferredDate: "", preferredSlot: "morning", mode: "self",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const set = (k: string, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: "" }));
  };

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (form.name.trim().length < 2) e.name = "Please enter your full name";
    const digits = form.phone.replace(/\D/g, "").replace(/^91/, "");
    if (!/^[6-9]\d{9}$/.test(digits)) e.phone = "Enter a valid 10-digit Indian mobile number";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) e.email = "Enter a valid email address";
    if (isVisit && !form.preferredDate) e.preferredDate = "Pick a preferred date";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    setErrorMsg("");
    try {
      const url = isVisit ? "/api/visits" : "/api/leads";
      const body = isVisit
        ? { name: form.name, phone: form.phone, email: form.email, preferredDate: form.preferredDate, preferredSlot: form.preferredSlot, mode: form.mode, notes: form.message }
        : { type, name: form.name, phone: form.phone, email: form.email, configuration: form.configuration, message: form.message, source };
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
      setStatus("done");
      onDone?.();
    } catch (err: any) {
      setStatus("error");
      setErrorMsg(err?.message || "Something went wrong.");
    }
  }

  const dark = variant === "dark";
  const inp = (field: string) => `input ${dark ? "!bg-white/10 !border-white/20 !text-white placeholder:!text-white/50" : ""} ${errors[field] ? "input-error" : ""}`;
  const lbl = (field: string) => `label ${dark ? "!text-white/70" : ""}`;

  if (status === "done") {
    return (
      <div className={`text-center py-8 px-4 ${dark ? "text-white" : ""}`} role="status">
        <CheckCircle2 className={`mx-auto mb-4 h-14 w-14 ${dark ? "text-emerald-300" : "text-emerald-600"}`} aria-hidden />
        <h3 className={`h-display text-2xl ${dark ? "text-white" : ""}`}>Thank you, {form.name.split(" ")[0]}!</h3>
        <p className={`mt-2 text-sm ${dark ? "text-white/70" : "text-[var(--muted)]"}`}>
          Your {isVisit ? "site visit request has" : "enquiry has"} been received. A certified property expert will
          contact you on <strong>{form.phone}</strong> shortly with
          {isVisit ? " a confirmation and visit details." : " the latest price, availability and brochure."}
        </p>
        <p className={`mt-3 text-xs ${dark ? "text-white/50" : "text-[var(--muted)]"}`}>Reference ID: AG-{Date.now().toString(36).toUpperCase()}</p>
      </div>
    );
  }

  const titles = LEAD_TITLES[type];

  return (
    <form onSubmit={submit} noValidate aria-label={titles.title} className={compact ? "" : "space-y-3.5"}>
      {!compact && (
        <p className={`text-sm ${dark ? "text-white/70" : "text-[var(--muted)]"} mb-4`}>{titles.sub}</p>
      )}
      <div className={compact ? "grid grid-cols-1 sm:grid-cols-2 gap-3.5" : "space-y-3.5"}>
        <div>
          <label className={lbl("name")} htmlFor={`lf-name-${type}`}>Full Name *</label>
          <input id={`lf-name-${type}`} className={inp("name")} placeholder="e.g. Priya Sharma" value={form.name}
            onChange={(e) => set("name", e.target.value)} autoComplete="name" />
          {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
        </div>
        <div>
          <label className={lbl("phone")} htmlFor={`lf-phone-${type}`}>Phone Number *</label>
          <input id={`lf-phone-${type}`} className={inp("phone")} type="tel" inputMode="tel" placeholder="+91 98xxx xxxxx"
            value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
        </div>
        <div>
          <label className={lbl("email")} htmlFor={`lf-email-${type}`}>Email</label>
          <input id={`lf-email-${type}`} className={inp("email")} type="email" placeholder="you@email.com"
            value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" />
          {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
        </div>
        <div>
          <label className={lbl("configuration")} htmlFor={`lf-conf-${type}`}>Preferred Configuration</label>
          <select id={`lf-conf-${type}`} className={inp("configuration")} value={form.configuration}
            onChange={(e) => set("configuration", e.target.value)}>
            <option value="">Not decided yet</option>
            {configurations.map((c) => (
              <option key={c.id} value={c.config}>{c.config} · {c.saleableArea}</option>
            ))}
          </select>
        </div>
        {isVisit && (
          <>
            <div>
              <label className={lbl("preferredDate")} htmlFor="lf-date">Preferred Date *</label>
              <input id="lf-date" type="date" className={inp("preferredDate")} min={new Date().toISOString().slice(0, 10)}
                value={form.preferredDate} onChange={(e) => set("preferredDate", e.target.value)} />
              {errors.preferredDate && <p className="mt-1 text-xs text-red-500">{errors.preferredDate}</p>}
            </div>
            <div>
              <label className={lbl("preferredSlot")} htmlFor="lf-slot">Preferred Slot</label>
              <select id="lf-slot" className={inp("preferredSlot")} value={form.preferredSlot} onChange={(e) => set("preferredSlot", e.target.value)}>
                <option value="morning">Morning (9:30 AM – 12 PM)</option>
                <option value="afternoon">Afternoon (12 – 4 PM)</option>
                <option value="evening">Evening (4 – 7 PM)</option>
              </select>
            </div>
            <div className={compact ? "sm:col-span-2" : ""}>
              <label className={lbl("mode")}>Visit Mode</label>
              <div className="flex gap-4 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={form.mode === "self"} onChange={() => set("mode", "self")} className="accent-[var(--accent)]" /> Self visit
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="mode" checked={form.mode === "pickup"} onChange={() => set("mode", "pickup")} className="accent-[var(--accent)]" /> Pick-up &amp; drop
                </label>
              </div>
            </div>
          </>
        )}
        <div className={compact ? "sm:col-span-2" : ""}>
          <label className={lbl("message")} htmlFor={`lf-msg-${type}`}>Message (optional)</label>
          <textarea id={`lf-msg-${type}`} className={`${inp("message")} min-h-[70px] resize-y`} rows={compact ? 2 : 3}
            placeholder="Any specific requirements? Budget, floor preference, timeline…"
            value={form.message} onChange={(e) => set("message", e.target.value)} />
        </div>
      </div>

      <button type="submit" disabled={status === "sending"} className={`btn-primary w-full mt-4 ${compact ? "" : "btn-lg"}`}>
        {status === "sending" ? (<><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>) : (titles.title)}
      </button>
      {status === "error" && <p className="mt-2 text-center text-xs text-red-500" role="alert">{errorMsg}</p>}
      <p className={`mt-3 flex items-center justify-center gap-1.5 text-[11px] ${dark ? "text-white/50" : "text-[var(--muted)]"}`}>
        <ShieldCheck className="h-3.5 w-3.5" /> Your details are secure and never shared with third parties.
      </p>
    </form>
  );
}
