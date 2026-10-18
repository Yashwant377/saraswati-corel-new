"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Phone, Mail, MessageCircle, Search, Trash2 } from "lucide-react";
import { Card, Badge, Spinner, Toast, apiFetch } from "@/components/admin/ui";

const STATUSES = ["new", "contacted", "qualified", "site_visit", "closed_won", "closed_lost"];
const STATUS_TONE: Record<string, any> = {
  new: "blue", contacted: "amber", qualified: "violet", site_visit: "green", closed_won: "green", closed_lost: "slate",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<any[] | null>(null);
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [canManage, setCanManage] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" }>({ msg: "", tone: "ok" });

  useEffect(() => {
    Promise.all([apiFetch("/api/leads"), apiFetch("/api/admin/me")])
      .then(([j, me]) => { setLeads(j.leads); setCanManage(me.user.permissions.includes("manage_leads")); })
      .catch((e) => setErr(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!leads) return [];
    return leads.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      const s = q.toLowerCase();
      return !s || [l.name, l.phone, l.email, l.configuration, l.message, l.type].some((v) => (v || "").toLowerCase().includes(s));
    });
  }, [leads, q, status]);

  async function setStatusOf(id: string, st: string) {
    setLeads((prev) => prev!.map((l) => (l.id === id ? { ...l, status: st } : l)));
    try {
      await apiFetch(`/api/admin/leads/${id}`, { method: "PATCH", body: JSON.stringify({ status: st }) });
    } catch (e: any) {
      setToast({ msg: e.message, tone: "err" });
      setTimeout(() => setToast({ msg: "", tone: "ok" }), 3000);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this lead permanently?")) return;
    try {
      await apiFetch(`/api/admin/leads/${id}`, { method: "DELETE" });
      setLeads((prev) => prev!.filter((l) => l.id !== id));
    } catch (e: any) { setToast({ msg: e.message, tone: "err" }); }
  }

  function exportCsv() {
    if (!filtered.length) return;
    const head = ["Created", "Type", "Name", "Phone", "Email", "Configuration", "Status", "Source", "Message"];
    const rows = filtered.map((l) => [l.createdAt, l.type, l.name, l.phone, l.email, l.configuration, l.status, l.source, (l.message || "").replace(/\n/g, " ")]);
    const csv = [head, ...rows].map((r) => r.map((c) => `"${String(c ?? "").replace(/"/g, '""')}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!leads) return <Spinner label="Loading leads…" />;

  const wa = (phone: string) => `https://wa.me/${phone.replace(/\D/g, "").replace(/^0+/, "")}`;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Leads <Badge tone="green">{leads.length}</Badge></h2>
          <p className="text-sm text-slate-500">Every enquiry, price request, callback and brochure request from the website.</p>
        </div>
        <button onClick={exportCsv} className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50">
          <Download style={{ width: 14, height: 14 }} /> Export CSV
        </button>
      </div>

      <Card className="flex flex-wrap items-center gap-3 p-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, phone, email, message…"
            className="w-full rounded-xl border border-slate-300 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-emerald-700">
          <option value="all">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
        </select>
      </Card>

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">Lead</th>
              <th className="px-5 py-3">Type / Config</th>
              <th className="px-5 py-3">Message</th>
              <th className="px-5 py-3">Source / Date</th>
              <th className="px-5 py-3">Actions</th>
              <th className="px-5 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-5 py-12 text-center text-slate-400">No leads match your filters.</td></tr>
            )}
            {filtered.map((l) => (
              <tr key={l.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-slate-800">{l.name}</p>
                  <p className="text-xs text-slate-400">{l.email || "no email"}</p>
                </td>
                <td className="px-5 py-3.5">
                  <Badge tone="violet">{l.type}</Badge>
                  <p className="mt-1 text-xs text-slate-500">{l.configuration}</p>
                </td>
                <td className="max-w-[220px] px-5 py-3.5">
                  <p className="truncate text-xs text-slate-500" title={l.message}>{l.message || "—"}</p>
                </td>
                <td className="px-5 py-3.5">
                  <p className="text-xs text-slate-500">{l.source}</p>
                  <p className="text-[11px] text-slate-400">{new Date(l.createdAt).toLocaleString("en-IN")}</p>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <a href={`tel:${l.phone}`} aria-label={`Call ${l.name}`} className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"><Phone style={{ width: 14, height: 14 }} /></a>
                    <a href={wa(l.phone)} target="_blank" rel="noopener noreferrer" aria-label={`WhatsApp ${l.name}`} className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"><MessageCircle style={{ width: 14, height: 14 }} /></a>
                    {l.email && <a href={`mailto:${l.email}`} aria-label={`Email ${l.name}`} className="rounded-lg bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"><Mail style={{ width: 14, height: 14 }} /></a>}
                    {canManage && <button onClick={() => remove(l.id)} aria-label="Delete lead" className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 style={{ width: 14, height: 14 }} /></button>}
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  {canManage ? (
                    <select value={l.status} onChange={(e) => setStatusOf(l.id, e.target.value)}
                      className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold outline-none focus:border-emerald-700">
                      {STATUSES.map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}
                    </select>
                  ) : (
                    <Badge tone={STATUS_TONE[l.status]}>{l.status.replace("_", " ")}</Badge>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Toast msg={toast.msg} tone={toast.tone} />
    </div>
  );
}
