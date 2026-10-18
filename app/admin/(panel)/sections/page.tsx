"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  ArrowUp, ArrowDown, Copy, Trash2, Pencil, Eye, EyeOff, Plus, X,
  Save, Rocket, Undo2, AlertTriangle, Upload, QrCode, FileText, ExternalLink, Loader2,
} from "lucide-react";
import { project, reraDefaults } from "@/lib/siteConfig";
import { Card, Badge, Spinner, Toast, apiFetch, Field, inputCls } from "@/components/admin/ui";
import { Icon, ICON_NAMES } from "@/components/site/Icon";

type Sec = {
  id: string; type: string; name: string; title: string; subtitle: string; icon: string;
  visible: boolean; order: number; background: string; layout: string; animations: boolean;
  status: "published" | "draft"; data: any; draftData: any; draftMeta?: any; updatedAt: string;
};

const TEMPLATES: Record<string, string> = {
  rera: "MahaRERA / RERA Details (QR + certificate upload)",
  "why-choose": "Why Choose This Project?",
  investment: "Investment Opportunities",
  "construction-updates": "Construction Updates",
  "payment-plans": "Payment Plans",
  "nearby-schools": "Nearby Schools",
  "nearby-it": "Nearby IT Parks",
  testimonials: "Customer Testimonials",
  comparison: "Project Comparison",
  "track-record": "Builder Track Record",
  "legal-docs": "Legal Documents",
  "special-offers": "Special Offers",
};

export default function SectionsPage() {
  const [sections, setSections] = useState<Sec[] | null>(null);
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" }>({ msg: "", tone: "ok" });
  const [editing, setEditing] = useState<Sec | null>(null);
  const [adding, setAdding] = useState(false);

  const notify = useCallback((msg: string, tone: "ok" | "err" = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast({ msg: "", tone: "ok" }), 3200);
  }, []);

  const load = useCallback(async () => {
    try {
      const json = await apiFetch("/api/admin/sections");
      setSections(json.sections);
    } catch (e: any) { setErr(e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: any, successMsg?: string) {
    try {
      const json = await apiFetch(`/api/admin/sections/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      setSections((prev) => prev!.map((s) => (s.id === id ? json.section : s)));
      setEditing((cur) => (cur && cur.id === id ? json.section : cur));
      if (successMsg) notify(successMsg);
      return json.section;
    } catch (e: any) { notify(e.message, "err"); return null; }
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete section "${name}"? This cannot be undone.`)) return;
    try {
      await apiFetch(`/api/admin/sections/${id}`, { method: "DELETE" });
      setSections((prev) => prev!.filter((s) => s.id !== id));
      notify("Section deleted");
    } catch (e: any) { notify(e.message, "err"); }
  }

  async function duplicate(id: string) {
    try {
      await apiFetch("/api/admin/sections", { method: "POST", body: JSON.stringify({ duplicateOf: id }) });
      await load();
      notify("Section duplicated as draft");
    } catch (e: any) { notify(e.message, "err"); }
  }

  async function move(index: number, dir: -1 | 1) {
    if (!sections) return;
    const next = [...sections];
    const target = index + dir;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    setSections(next);
    try {
      await apiFetch("/api/admin/sections/reorder", { method: "POST", body: JSON.stringify({ ids: next.map((s) => s.id) }) });
    } catch (e: any) { notify(e.message, "err"); load(); }
  }

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!sections) return <Spinner label="Loading sections…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Website Sections</h2>
          <p className="text-sm text-slate-500">
            Reorder, hide, duplicate, edit and publish every section of the landing page — no code required.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="/?preview=1" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
            <Eye style={{ width: 14, height: 14 }} /> Preview site
          </a>
          <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
            <Plus style={{ width: 14, height: 14 }} /> Add Section
          </button>
        </div>
      </div>

      <Card className="divide-y divide-slate-100">
        {sections.map((s, i) => (
          <div key={s.id} className={`flex flex-wrap items-center gap-3 px-4 py-3.5 sm:px-6 ${!s.visible ? "opacity-55" : ""}`}>
            <div className="flex flex-col">
              <button onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${s.name} up`}
                className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"><ArrowUp style={{ width: 15, height: 15 }} /></button>
              <button onClick={() => move(i, 1)} disabled={i === sections.length - 1} aria-label={`Move ${s.name} down`}
                className="rounded p-0.5 text-slate-400 hover:text-slate-700 disabled:opacity-25"><ArrowDown style={{ width: 15, height: 15 }} /></button>
            </div>

            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <Icon name={s.icon} style={{ width: 17, height: 17 }} />
            </span>

            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <span className="truncate">{s.name}</span>
                {s.status === "draft" ? <Badge tone="amber">Draft</Badge> : <Badge tone="green">Published</Badge>}
                {s.status === "published" && (!!s.draftMeta || JSON.stringify(s.draftData ?? null) !== JSON.stringify(s.data ?? null)) && (
                  <Badge tone="violet">Unpublished changes</Badge>
                )}
                {!s.visible && <Badge tone="red">Hidden</Badge>}
                {s.type.startsWith("custom") && <Badge tone="violet">Custom</Badge>}
              </p>
              <p className="truncate text-xs text-slate-400">{s.title || "—"} · anchor #{s.id}</p>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => patch(s.id, { visible: !s.visible })} aria-label={s.visible ? "Hide section" : "Show section"}
                className={`rounded-lg p-2 hover:bg-slate-100 ${s.visible ? "text-emerald-700" : "text-slate-400"}`} title={s.visible ? "Hide" : "Show"}>
                {s.visible ? <Eye style={{ width: 16, height: 16 }} /> : <EyeOff style={{ width: 16, height: 16 }} />}
              </button>
              <button onClick={() => setEditing(s)} aria-label={`Edit ${s.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Edit">
                <Pencil style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => duplicate(s.id)} aria-label={`Duplicate ${s.name}`} className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Duplicate">
                <Copy style={{ width: 16, height: 16 }} />
              </button>
              <button onClick={() => remove(s.id, s.name)} aria-label={`Delete ${s.name}`}
                className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-25" title={s.type === "hero" ? "Hero cannot be deleted" : "Delete"}
                disabled={s.type === "hero"}>
                <Trash2 style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        ))}
      </Card>

      <p className="text-xs text-slate-400">
        Changes to visibility, order and quick actions apply immediately. Content edits are saved as <strong>drafts</strong> until you click <strong>Publish</strong>.
      </p>

      {editing && <EditSectionModal section={editing} onClose={() => setEditing(null)} onPatch={patch} notify={notify} />}
      {adding && <AddSectionModal onClose={() => setAdding(false)} onAdded={async () => { setAdding(false); await load(); notify("Section added as draft — edit and publish it"); }} notify={notify} />}
      <Toast msg={toast.msg} tone={toast.tone} />
    </div>
  );
}

/* ------------------------------ edit modal ------------------------------ */
function EditSectionModal({
  section, onClose, onPatch, notify,
}: {
  section: Sec;
  onClose: () => void;
  onPatch: (id: string, body: any, msg?: string) => Promise<any>;
  notify: (m: string, t?: "ok" | "err") => void;
}) {
  const [form, setForm] = useState({ ...section });
  const [jsonText, setJsonText] = useState(JSON.stringify(section.draftData ?? {}, null, 2));
  const [jsonErr, setJsonErr] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setForm({ ...section });
    setJsonText(JSON.stringify(section.draftData ?? {}, null, 2));
  }, [section]);

  const set = (k: string, v: any) => setForm((f) => ({ ...f, [k]: v }));

  function parsedJson() {
    try {
      const v = JSON.parse(jsonText);
      setJsonErr("");
      return v;
    } catch (e: any) {
      setJsonErr("Invalid JSON: " + e.message);
      return undefined;
    }
  }

  const dirtyJson = useMemo(() => jsonText !== JSON.stringify(section.draftData ?? {}, null, 2), [jsonText, section.draftData]);

  async function act(action: "saveDraft" | "publish" | "revert") {
    setBusy(true);
    const body: any = { action };
    if (action !== "revert") {
      const parsed = parsedJson();
      if (parsed === undefined) { setBusy(false); return; }
      body.draftData = parsed;
      Object.assign(body, {
        name: form.name, title: form.title, subtitle: form.subtitle, icon: form.icon,
        background: form.background, layout: form.layout, visible: form.visible, animations: form.animations,
      });
    }
    await onPatch(section.id, body, action === "publish" ? "Section published live ✓" : action === "revert" ? "Draft reverted to published version" : "Draft saved — not visible on the live site yet");
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-start sm:items-center justify-center bg-slate-900/60 backdrop-blur-sm p-3 sm:p-6 overflow-y-auto" role="dialog" aria-modal="true">
      <div className="modal-enter w-full max-w-2xl rounded-2xl bg-white shadow-2xl my-auto">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h3 className="font-bold text-slate-900">Edit Section — {section.name}</h3>
            <p className="text-xs text-slate-400">Type: {section.type} · Anchor: #{section.id}</p>
          </div>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X style={{ width: 18, height: 18 }} /></button>
        </div>

        <div className="space-y-5 px-6 py-5 max-h-[70vh] overflow-y-auto">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Section Name (internal)"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
            <Field label="Icon">
              <div className="flex gap-2">
                <input className={inputCls} value={form.icon} onChange={(e) => set("icon", e.target.value)} list="icon-names" />
                <span className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600"><Icon name={form.icon} style={{ width: 18, height: 18 }} /></span>
              </div>
              <datalist id="icon-names">{ICON_NAMES.map((n) => <option key={n} value={n} />)}</datalist>
            </Field>
            <div className="sm:col-span-2">
              <Field label="Section Title (heading shown on site)"><input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
            </div>
            <div className="sm:col-span-2">
              <Field label="Section Subtitle"><input className={inputCls} value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} /></Field>
            </div>
            <Field label="Background">
              <select className={inputCls} value={form.background} onChange={(e) => set("background", e.target.value)}>
                <option value="default">Default (white)</option>
                <option value="alt">Alternate (soft)</option>
                <option value="dark">Dark</option>
              </select>
            </Field>
            <Field label="Layout">
              <select className={inputCls} value={form.layout} onChange={(e) => set("layout", e.target.value)}>
                <option value="default">Default</option>
                <option value="grid-2">Grid 2 columns</option>
                <option value="grid-3">Grid 3 columns</option>
                <option value="grid-4">Grid 4 columns</option>
                <option value="centered">Centered</option>
              </select>
            </Field>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.visible} onChange={(e) => set("visible", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Visible on site
            </label>
            <label className="flex items-center gap-2.5 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 cursor-pointer">
              <input type="checkbox" checked={form.animations} onChange={(e) => set("animations", e.target.checked)} className="h-4 w-4 accent-emerald-700" />
              Enable animations
            </label>
          </div>

          {section.type === "rera" && (
            <ReraEditor jsonText={jsonText} setJsonText={setJsonText} notify={notify} />
          )}

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[13px] font-semibold text-slate-700">Section Content (JSON — draft)</span>
              {dirtyJson && <Badge tone="amber">unsaved</Badge>}
            </div>
            <textarea
              className={`${inputCls} font-mono text-xs leading-relaxed min-h-[220px]`}
              value={jsonText}
              onChange={(e) => setJsonText(e.target.value)}
              spellCheck={false}
            />
            {jsonErr && <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-red-600"><AlertTriangle style={{ width: 13, height: 13 }} /> {jsonErr}</p>}
            <p className="mt-1.5 text-[11px] text-slate-400">
              Leave as {"{}"} to use the default content from siteConfig.ts. Custom sections use a “blocks” array
              (paragraph / stats / cards3 / table / timeline / testimonials / docs).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 px-6 py-4 sticky bottom-0 bg-white rounded-b-2xl">
          <button onClick={() => act("revert")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 disabled:opacity-50">
            <Undo2 style={{ width: 13, height: 13 }} /> Revert draft
          </button>
          <div className="flex gap-2">
            <button onClick={async () => { setBusy(true); await onPatch(section.id, { name: form.name, title: form.title, subtitle: form.subtitle, icon: form.icon, background: form.background, layout: form.layout, visible: form.visible, animations: form.animations }, "Section settings saved"); setBusy(false); }}
              disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-700 px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50">
              <Save style={{ width: 13, height: 13 }} /> Save settings
            </button>
            <button onClick={() => act("saveDraft")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-slate-800 px-4 py-2 text-xs font-bold text-white hover:bg-slate-700 disabled:opacity-50">
              <Save style={{ width: 13, height: 13 }} /> Save draft
            </button>
            <button onClick={() => act("publish")} disabled={busy} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
              <Rocket style={{ width: 13, height: 13 }} /> Publish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ add modal ------------------------------ */
function AddSectionModal({ onClose, onAdded, notify }: { onClose: () => void; onAdded: () => void; notify: (m: string, t?: "ok" | "err") => void }) {
  const [template, setTemplate] = useState("");
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [busy, setBusy] = useState(false);

  async function add() {
    setBusy(true);
    try {
      await apiFetch("/api/admin/sections", {
        method: "POST",
        body: JSON.stringify({ template: template || undefined, name: name || undefined, title: title || undefined }),
      });
      onAdded();
    } catch (e: any) { notify(e.message, "err"); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <div className="modal-enter w-full max-w-lg rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="font-bold text-slate-900">Add New Section</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <Field label="Start from a template" hint="Templates come pre-filled with content blocks you can edit later.">
            <select className={inputCls} value={template} onChange={(e) => setTemplate(e.target.value)}>
              <option value="">Blank custom section</option>
              {Object.entries(TEMPLATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Section name (optional — overrides template)"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Investment Opportunities" /></Field>
          <Field label="Section title (optional)"><input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Heading shown on the site" /></Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button onClick={add} disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50">
            {busy ? "Adding…" : "Add Section"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* --------------------------- MahaRERA uploader --------------------------- */
/**
 * Friendly editor for the "MahaRERA Details" section: upload the QR code image
 * and/or the registration document, and edit the registration fields.
 * Everything lands in the section's draft JSON (Save draft → Publish).
 */
function ReraEditor({
  jsonText, setJsonText, notify,
}: {
  jsonText: string;
  setJsonText: (v: string) => void;
  notify: (m: string, t?: "ok" | "err") => void;
}) {
  const [busy, setBusy] = useState<"qr" | "doc" | "">("");

  let data: any = {};
  try { data = JSON.parse(jsonText) || {}; } catch { data = {}; }

  const qrImage: string = data.qrImage || "";
  const docUrl: string = data.docUrl || "";

  function patch(k: string, v: any) {
    let cur: any = {};
    try { cur = JSON.parse(jsonText) || {}; } catch { return; }
    setJsonText(JSON.stringify({ ...cur, [k]: v }, null, 2));
  }

  async function upload(kind: "qr" | "doc", file: File | null | undefined) {
    if (!file) return;
    setBusy(kind);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || "Upload failed");
      patch(kind === "qr" ? "qrImage" : "docUrl", json.url);
      notify(kind === "qr" ? "QR code uploaded — now click Save draft, then Publish" : "Document uploaded — now click Save draft, then Publish");
    } catch (e: any) {
      notify(e.message, "err");
    }
    setBusy("");
  }

  return (
    <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50/50 p-4">
      <div className="flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-700 text-white">
          <QrCode style={{ width: 16, height: 16 }} />
        </span>
        <div>
          <p className="text-[13px] font-bold text-emerald-900">MahaRERA content — QR code &amp; registration document</p>
          <p className="text-[11px] text-emerald-800/70">Upload files here; they show on the website after you Save draft → Publish.</p>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <Field label="RERA Registration Number">
          <input className={inputCls} value={data.number ?? ""} placeholder={`default: ${reraDefaults.number}`} onChange={(e) => patch("number", e.target.value)} />
        </Field>
        <Field label="Promoter / Developer">
          <input className={inputCls} value={data.promoter ?? ""} placeholder={`default: ${reraDefaults.promoter}`} onChange={(e) => patch("promoter", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="MahaRERA verification URL">
            <input className={inputCls} value={data.url ?? ""} placeholder={`default: ${reraDefaults.url}`} onChange={(e) => patch("url", e.target.value)} />
          </Field>
        </div>
      </div>

      {/* uploads */}
      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        {/* QR */}
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-[13px] font-bold text-slate-800">QR code image</p>
          <p className="mt-0.5 text-[11px] text-slate-400">PNG / JPG / WEBP · scanned by buyers to verify the project.</p>
          <div className="mt-3 flex items-center gap-3">
            {qrImage ? (
              <img src={qrImage} alt="Uploaded QR code" className="h-20 w-20 rounded-lg border border-slate-200 bg-white object-contain p-1" />
            ) : (
              <span className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed border-slate-300 text-slate-300">
                <QrCode style={{ width: 26, height: 26 }} />
              </span>
            )}
            <div className="flex flex-col gap-2">
              <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-emerald-700 px-3.5 py-2 text-xs font-bold text-white hover:bg-emerald-600">
                {busy === "qr" ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : <Upload style={{ width: 13, height: 13 }} />}
                {qrImage ? "Replace QR" : "Upload QR"}
                <input type="file" accept="image/*" className="hidden" disabled={busy !== ""}
                  onChange={(e) => { upload("qr", e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {qrImage && (
                <button type="button" onClick={() => patch("qrImage", "")} className="text-[11px] font-bold text-red-600 hover:underline">
                  Remove QR code
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Document */}
        <div className="rounded-xl border border-emerald-200 bg-white p-4">
          <p className="text-[13px] font-bold text-slate-800">Registration document (optional)</p>
          <p className="mt-0.5 text-[11px] text-slate-400">PDF or image — buyers can download it from the section.</p>
          <div className="mt-3 flex items-center gap-3">
            <span className="flex h-20 w-20 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400">
              <FileText style={{ width: 26, height: 26 }} />
            </span>
            <div className="min-w-0 flex flex-col gap-2">
              <label className="inline-flex w-fit cursor-pointer items-center gap-1.5 rounded-xl border border-slate-300 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
                {busy === "doc" ? <Loader2 className="animate-spin" style={{ width: 13, height: 13 }} /> : <Upload style={{ width: 13, height: 13 }} />}
                {docUrl ? "Replace file" : "Upload file"}
                <input type="file" accept="application/pdf,image/*" className="hidden" disabled={busy !== ""}
                  onChange={(e) => { upload("doc", e.target.files?.[0]); e.target.value = ""; }} />
              </label>
              {docUrl && (
                <div className="flex items-center gap-3">
                  <a href={docUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 truncate text-[11px] font-bold text-emerald-700 hover:underline">
                    <ExternalLink style={{ width: 11, height: 11 }} /> View upload
                  </a>
                  <button type="button" onClick={() => patch("docUrl", "")} className="text-[11px] font-bold text-red-600 hover:underline">Remove</button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 grid sm:grid-cols-2 gap-4">
        <Field label="Download button label">
          <input className={inputCls} value={data.docLabel ?? ""} placeholder={`default: ${reraDefaults.docLabel}`} onChange={(e) => patch("docLabel", e.target.value)} />
        </Field>
        <Field label="Buyer tip" hint="Shown on the section as “Scan to verify…”">
          <input className={inputCls} value={data.scanTip ?? ""} placeholder="default: Scan to verify this project" onChange={(e) => patch("scanTip", e.target.value)} />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Disclaimer text">
            <textarea className={`${inputCls} min-h-[80px]`} value={data.note ?? ""} placeholder={`default: ${reraDefaults.note}`} onChange={(e) => patch("note", e.target.value)} />
          </Field>
        </div>
      </div>

      <p className="mt-3 text-[11px] text-emerald-900/70">
        Leave any field blank to keep the default from <code className="font-mono">siteConfig.ts</code> ({project.name} · RERA {project.reraNumber}).
      </p>
    </div>
  );
}
