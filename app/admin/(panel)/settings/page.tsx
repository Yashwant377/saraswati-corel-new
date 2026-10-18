"use client";

import { useEffect, useRef, useState } from "react";
import { Save, Upload, Palette, Globe, Phone, Image as ImageIcon, MapPin, Zap } from "lucide-react";
import { Card, Spinner, Toast, apiFetch, Field, inputCls, Badge } from "@/components/admin/ui";

type Tab = "branding" | "contact" | "website" | "theme" | "maps" | "conversion";

const TABS: { id: Tab; label: string; icon: any }[] = [
  { id: "branding", label: "Branding", icon: ImageIcon },
  { id: "contact", label: "Contact Details", icon: Phone },
  { id: "website", label: "Website & SEO", icon: Globe },
  { id: "theme", label: "Theme", icon: Palette },
  { id: "maps", label: "Maps & RERA", icon: MapPin },
  { id: "conversion", label: "Conversion Tools", icon: Zap },
];

function ImageField({ label, value, onChange, hint }: { label: string; value: string; onChange: (v: string) => void; hint?: string }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  function onFile(f: File | undefined) {
    if (!f) return;
    if (f.size > 400 * 1024) { setErr("File too large (max 400 KB). Use a URL for bigger images."); return; }
    const reader = new FileReader();
    reader.onload = () => { onChange(String(reader.result)); setErr(""); };
    reader.readAsDataURL(f);
  }

  return (
    <div>
      <Field label={label} hint={hint || "Paste an image URL, or upload a small file (max 400 KB, stored as data URI)."}>
        <div className="flex gap-2">
          <input className={inputCls} value={value} onChange={(e) => onChange(e.target.value)} placeholder="https://… or data:…" />
          <button type="button" onClick={() => fileRef.current?.click()} className="shrink-0 rounded-xl border border-slate-300 px-3 text-slate-500 hover:bg-slate-50" aria-label={`Upload ${label}`}>
            <Upload style={{ width: 16, height: 16 }} />
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} />
        </div>
      </Field>
      {err && <p className="mt-1 text-xs text-red-600">{err}</p>}
      {value && (
        <div className="mt-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="preview" className="h-10 max-w-[160px] rounded-lg border border-slate-200 object-contain bg-white p-1" />
          <button type="button" onClick={() => onChange("")} className="text-xs font-semibold text-red-500 hover:underline">Remove</button>
        </div>
      )}
    </div>
  );
}

function LinksEditor({ label, value, onChange }: { label: string; value: { label: string; href: string }[]; onChange: (v: any) => void }) {
  const set = (i: number, k: "label" | "href", v: string) => {
    const next = value.map((l, li) => (li === i ? { ...l, [k]: v } : l));
    onChange(next);
  };
  return (
    <Field label={label}>
      <div className="space-y-2">
        {value.map((l, i) => (
          <div key={i} className="flex gap-2">
            <input className={inputCls} value={l.label} onChange={(e) => set(i, "label", e.target.value)} placeholder="Label" />
            <input className={inputCls} value={l.href} onChange={(e) => set(i, "href", e.target.value)} placeholder="#anchor or https://…" />
            <button type="button" aria-label="Remove link" onClick={() => onChange(value.filter((_, li) => li !== i))}
              className="shrink-0 rounded-xl border border-red-200 px-3 text-red-500 hover:bg-red-50">✕</button>
          </div>
        ))}
        <button type="button" onClick={() => onChange([...value, { label: "New Link", href: "#" }])}
          className="rounded-xl border border-dashed border-slate-300 px-4 py-2 text-xs font-bold text-slate-500 hover:border-emerald-600 hover:text-emerald-700">
          + Add link
        </button>
      </div>
    </Field>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<any>(null);
  const [tab, setTab] = useState<Tab>("branding");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" }>({ msg: "", tone: "ok" });

  useEffect(() => {
    apiFetch("/api/admin/settings").then((j) => setSettings(j.settings)).catch((e) => setErr(e.message));
  }, []);

  const setGroup = (group: string, key: string, value: any) =>
    setSettings((s: any) => ({ ...s, [group]: { ...s[group], [key]: value } }));

  async function save() {
    setBusy(true);
    try {
      const json = await apiFetch("/api/admin/settings", { method: "PUT", body: JSON.stringify(settings) });
      setSettings(json.settings);
      setToast({ msg: "Settings saved — live on the website ✓", tone: "ok" });
    } catch (e: any) {
      setToast({ msg: e.message, tone: "err" });
    } finally {
      setBusy(false);
      setTimeout(() => setToast({ msg: "", tone: "ok" }), 3200);
    }
  }

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!settings) return <Spinner label="Loading settings…" />;

  const b = settings.branding, c = settings.contact, w = settings.website, t = settings.theme, m = settings.maps, r = settings.rera, cv = settings.conversion;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Global Website Settings</h2>
          <p className="text-sm text-slate-500">Branding, contact details, SEO, theme and maps — everything applies site-wide instantly.</p>
        </div>
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
          <Save style={{ width: 14, height: 14 }} /> {busy ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((tb) => (
          <button key={tb.id} onClick={() => setTab(tb.id)}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
              tab === tb.id ? "bg-slate-900 text-white" : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
            }`}>
            <tb.icon style={{ width: 14, height: 14 }} /> {tb.label}
          </button>
        ))}
      </div>

      {tab === "branding" && (
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Project / Company Name"><input className={inputCls} value={b.logoText} onChange={(e) => setGroup("branding", "logoText", e.target.value)} /></Field>
            <Field label="Logo Subtext"><input className={inputCls} value={b.logoSubtext} onChange={(e) => setGroup("branding", "logoSubtext", e.target.value)} /></Field>
            <Field label="Company Name"><input className={inputCls} value={b.companyName} onChange={(e) => setGroup("branding", "companyName", e.target.value)} /></Field>
            <Field label="Developer Name"><input className={inputCls} value={b.developerName} onChange={(e) => setGroup("branding", "developerName", e.target.value)} /></Field>
            <Field label="Broker / Marketing Partner Name"><input className={inputCls} value={b.brokerName} onChange={(e) => setGroup("branding", "brokerName", e.target.value)} /></Field>
            <Field label="Logo Link URL"><input className={inputCls} value={b.logoLink} onChange={(e) => setGroup("branding", "logoLink", e.target.value)} /></Field>
            <Field label="Logo Width (px)"><input type="number" className={inputCls} value={b.logoWidth} onChange={(e) => setGroup("branding", "logoWidth", Number(e.target.value))} /></Field>
            <Field label="Logo Height (px)"><input type="number" className={inputCls} value={b.logoHeight} onChange={(e) => setGroup("branding", "logoHeight", Number(e.target.value))} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            <ImageField label="Main Logo" value={b.logoUrl} onChange={(v) => setGroup("branding", "logoUrl", v)} hint="Leave empty to use the built-in text logo." />
            <ImageField label="Light Logo (for dark backgrounds)" value={b.logoLightUrl} onChange={(v) => setGroup("branding", "logoLightUrl", v)} />
            <ImageField label="Dark Logo" value={b.logoDarkUrl} onChange={(v) => setGroup("branding", "logoDarkUrl", v)} />
            <ImageField label="Mobile Logo" value={b.mobileLogoUrl} onChange={(v) => setGroup("branding", "mobileLogoUrl", v)} />
            <ImageField label="Favicon" value={b.faviconUrl} onChange={(v) => setGroup("branding", "faviconUrl", v)} hint="Square icon, 32–180px recommended." />
          </div>
        </Card>
      )}

      {tab === "contact" && (
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Phone (display)"><input className={inputCls} value={c.phone} onChange={(e) => setGroup("contact", "phone", e.target.value)} /></Field>
            <Field label="Phone (dial, e.g. +919800000000)"><input className={inputCls} value={c.phoneDial} onChange={(e) => setGroup("contact", "phoneDial", e.target.value)} /></Field>
            <Field label="WhatsApp Number (with country code, digits only)"><input className={inputCls} value={c.whatsapp} onChange={(e) => setGroup("contact", "whatsapp", e.target.value)} /></Field>
            <Field label="Email"><input className={inputCls} value={c.email} onChange={(e) => setGroup("contact", "email", e.target.value)} /></Field>
            <div className="sm:col-span-2"><Field label="Office Address"><textarea className={`${inputCls} min-h-[70px]`} value={c.address} onChange={(e) => setGroup("contact", "address", e.target.value)} /></Field></div>
            <Field label="Business Hours"><input className={inputCls} value={c.hours} onChange={(e) => setGroup("contact", "hours", e.target.value)} /></Field>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {["facebook", "instagram", "twitter", "youtube", "linkedin"].map((s) => (
              <Field key={s} label={`Social — ${s}`}><input className={inputCls} value={c.social?.[s] || ""} onChange={(e) => setGroup("contact", "social", { ...c.social, [s]: e.target.value })} placeholder="https://…" /></Field>
            ))}
          </div>
        </Card>
      )}

      {tab === "website" && (
        <Card className="p-6 space-y-5">
          <Field label="Website Title (SEO)"><input className={inputCls} value={w.title} onChange={(e) => setGroup("website", "title", e.target.value)} /></Field>
          <Field label="Meta Description (SEO)" hint={`${(w.metaDescription || "").length}/160 characters recommended`}>
            <textarea className={`${inputCls} min-h-[80px]`} value={w.metaDescription} onChange={(e) => setGroup("website", "metaDescription", e.target.value)} />
          </Field>
          <ImageField label="Default Share Image (OG)" value={w.defaultImage} onChange={(v) => setGroup("website", "defaultImage", v)} hint="Used for social sharing and as the hero background." />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Copyright Text"><input className={inputCls} value={w.copyright} onChange={(e) => setGroup("website", "copyright", e.target.value)} /></Field>
            <Field label="Header CTA Text"><input className={inputCls} value={w.ctaText} onChange={(e) => setGroup("website", "ctaText", e.target.value)} /></Field>
          </div>
          <LinksEditor label="Navigation Links" value={w.navLinks} onChange={(v) => setGroup("website", "navLinks", v)} />
          <LinksEditor label="Footer Links" value={w.footerLinks} onChange={(v) => setGroup("website", "footerLinks", v)} />
        </Card>
      )}

      {tab === "theme" && (
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Color Mode">
              <select className={inputCls} value={t.mode} onChange={(e) => setGroup("theme", "mode", e.target.value)}>
                <option value="light">Light mode</option>
                <option value="dark">Dark mode</option>
              </select>
            </Field>
            <Field label="Accent Color">
              <div className="flex items-center gap-3">
                <input type="color" value={t.accent} onChange={(e) => setGroup("theme", "accent", e.target.value)} className="h-11 w-16 cursor-pointer rounded-xl border border-slate-300 bg-white p-1" aria-label="Accent color picker" />
                <input className={inputCls} value={t.accent} onChange={(e) => setGroup("theme", "accent", e.target.value)} />
              </div>
            </Field>
            <Field label="Font Pairing">
              <select className={inputCls} value={t.font} onChange={(e) => setGroup("theme", "font", e.target.value)}>
                <option value="elegant-serif">Elegant Serif (Fraunces + Inter)</option>
                <option value="modern-sans">Modern Sans (Inter)</option>
                <option value="geometric">Geometric (Poppins)</option>
              </select>
            </Field>
            <Field label="Button Style">
              <select className={inputCls} value={t.buttonStyle} onChange={(e) => setGroup("theme", "buttonStyle", e.target.value)}>
                <option value="pill">Pill (fully rounded)</option>
                <option value="rounded">Rounded</option>
                <option value="sharp">Sharp</option>
              </select>
            </Field>
            <Field label="Card Style">
              <select className={inputCls} value={t.cardStyle} onChange={(e) => setGroup("theme", "cardStyle", e.target.value)}>
                <option value="elevated">Elevated (shadow)</option>
                <option value="flat">Flat (thin border)</option>
                <option value="outline">Outline (strong border)</option>
              </select>
            </Field>
            <Field label={`Border Radius — ${t.radius}px`}>
              <input type="range" min={0} max={32} value={t.radius} onChange={(e) => setGroup("theme", "radius", Number(e.target.value))} className="w-full accent-emerald-700" />
            </Field>
            <Field label="Section Spacing">
              <select className={inputCls} value={t.sectionSpacing} onChange={(e) => setGroup("theme", "sectionSpacing", e.target.value)}>
                <option value="compact">Compact</option>
                <option value="normal">Normal</option>
                <option value="roomy">Roomy</option>
              </select>
            </Field>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={t.animations} onChange={(e) => setGroup("theme", "animations", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Enable scroll animations
            </label>
          </div>
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-xs text-slate-500">
            Theme changes apply to the public website immediately after <strong>Save</strong>. Open <a className="font-bold text-emerald-700 hover:underline" href="/" target="_blank" rel="noreferrer">the site</a> in a new tab to see them.
          </div>
        </Card>
      )}

      {tab === "maps" && (
        <Card className="p-6 space-y-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2"><Field label="Project Address (shown on map card)"><input className={inputCls} value={m.address} onChange={(e) => setGroup("maps", "address", e.target.value)} /></Field></div>
            <Field label="Latitude"><input type="number" step="0.0001" className={inputCls} value={m.lat} onChange={(e) => setGroup("maps", "lat", Number(e.target.value))} /></Field>
            <Field label="Longitude"><input type="number" step="0.0001" className={inputCls} value={m.lng} onChange={(e) => setGroup("maps", "lng", Number(e.target.value))} /></Field>
            <div className="sm:col-span-2"><Field label="Get Directions URL" hint="Google Maps link opened by the 'Get Directions' button."><input className={inputCls} value={m.directionsUrl} onChange={(e) => setGroup("maps", "directionsUrl", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="RERA Registration Number"><input className={inputCls} value={r.number} onChange={(e) => setGroup("rera", "number", e.target.value)} /></Field></div>
            <div className="sm:col-span-2"><Field label="RERA Verification URL"><input className={inputCls} value={r.url} onChange={(e) => setGroup("rera", "url", e.target.value)} /></Field></div>
          </div>
        </Card>
      )}

      {tab === "conversion" && (
        <Card className="p-6 space-y-5">
          <p className="text-sm text-slate-500">
            Urgency &amp; social-proof widgets that measurably lift enquiry rates. All values are shown on the public site — keep them truthful.
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={cv.socialProof} onChange={(e) => setGroup("conversion", "socialProof", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Social-proof toasts
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={cv.exitIntent} onChange={(e) => setGroup("conversion", "exitIntent", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Exit-intent offer modal
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={cv.countdown} onChange={(e) => setGroup("conversion", "countdown", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Offer countdown timer
            </label>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Offer ends on"><input type="date" className={inputCls} value={cv.offerEndsAt} onChange={(e) => setGroup("conversion", "offerEndsAt", e.target.value)} /></Field>
            <Field label="“Enquiries in 48 hrs” count"><input type="number" className={inputCls} value={cv.enquiriesToday} onChange={(e) => setGroup("conversion", "enquiriesToday", Number(e.target.value))} /></Field>
            <Field label="“Homes left” count"><input type="number" className={inputCls} value={cv.unitsLeft} onChange={(e) => setGroup("conversion", "unitsLeft", Number(e.target.value))} /></Field>
          </div>
          <Field label="Social-proof messages (one per line)" hint="Rotate automatically as small toasts, e.g. “Rohit D. from Vashi enquired about a 3 BHK”.">
            <textarea className={`${inputCls} min-h-[120px] font-mono text-xs`} value={(cv.socialMessages || []).join("\n")}
              onChange={(e) => setGroup("conversion", "socialMessages", e.target.value.split("\n").filter(Boolean))} />
          </Field>
        </Card>
      )}

      <div className="flex justify-end">
        <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
          <Save style={{ width: 15, height: 15 }} /> {busy ? "Saving…" : "Save All Changes"}
        </button>
      </div>
      <Toast msg={toast.msg} tone={toast.tone} />
    </div>
  );
}
