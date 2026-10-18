"use client";

import { useEffect, useState } from "react";
import { CalendarCheck, Phone, MessageCircle, Trash2, MapPin } from "lucide-react";
import { Card, Badge, Spinner, Toast, apiFetch } from "@/components/admin/ui";

const STATUSES = ["requested", "confirmed", "completed", "cancelled"];
const TONE: Record<string, any> = { requested: "amber", confirmed: "blue", completed: "green", cancelled: "slate" };

export default function VisitsPage() {
  const [visits, setVisits] = useState<any[] | null>(null);
  const [err, setErr] = useState("");
  const [canManage, setCanManage] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" }>({ msg: "", tone: "ok" });

  useEffect(() => {
    Promise.all([apiFetch("/api/visits"), apiFetch("/api/admin/me")])
      .then(([j, me]) => { setVisits(j.visits); setCanManage(me.user.permissions.includes("manage_visits")); })
      .catch((e) => setErr(e.message));
  }, []);

  async function patch(id: string, status: string) {
    setVisits((prev) => prev!.map((v) => (v.id === id ? { ...v, status } : v)));
    try {
      await apiFetch(`/api/admin/visits/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
    } catch (e: any) { setToast({ msg: e.message, tone: "err" }); }
  }

  async function remove(id: string) {
    if (!confirm("Delete this site visit request?")) return;
    try {
      await apiFetch(`/api/admin/visits/${id}`, { method: "DELETE" });
      setVisits((prev) => prev!.filter((v) => v.id !== id));
    } catch (e: any) { setToast({ msg: e.message, tone: "err" }); }
  }

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!visits) return <Spinner label="Loading site visits…" />;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Site Visits <Badge tone="green">{visits.length}</Badge></h2>
        <p className="text-sm text-slate-500">Booking requests from the “Schedule a Site Visit” forms.</p>
      </div>

      {visits.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-16 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><CalendarCheck style={{ width: 22, height: 22 }} /></span>
          <p className="text-sm text-slate-400">No site visit requests yet.</p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visits.map((v) => (
            <Card key={v.id} className="p-5">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold text-slate-900">{v.name}</p>
                  <p className="text-xs text-slate-400">{v.email || "no email"} · booked {new Date(v.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                <Badge tone={TONE[v.status]}>{v.status}</Badge>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600"><strong className="block text-slate-800">Date</strong>{v.preferredDate}</span>
                <span className="rounded-lg bg-slate-50 px-3 py-2 text-slate-600"><strong className="block text-slate-800">Slot</strong>{v.preferredSlot}</span>
                <span className="col-span-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-600">
                  <strong className="block text-slate-800">Mode</strong>
                  {v.mode === "pickup" ? "Pick-up & drop requested" : "Self visit"}
                </span>
                {v.notes && <span className="col-span-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-800"><strong className="block">Notes</strong>{v.notes}</span>}
              </div>
              <div className="mt-4 flex items-center justify-between gap-2">
                <div className="flex gap-1.5">
                  <a href={`tel:${v.phone}`} aria-label="Call" className="rounded-lg bg-emerald-50 p-2 text-emerald-700 hover:bg-emerald-100"><Phone style={{ width: 14, height: 14 }} /></a>
                  <a href={`https://wa.me/${v.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="rounded-lg bg-green-50 p-2 text-green-600 hover:bg-green-100"><MessageCircle style={{ width: 14, height: 14 }} /></a>
                  {canManage && <button onClick={() => remove(v.id)} aria-label="Delete" className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 style={{ width: 14, height: 14 }} /></button>}
                </div>
                {canManage ? (
                  <select value={v.status} onChange={(e) => patch(v.id, e.target.value)}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold outline-none focus:border-emerald-700">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : <span className="text-xs text-slate-400">{v.phone}</span>}
              </div>
            </Card>
          ))}
        </div>
      )}
      <Toast msg={toast.msg} tone={toast.tone} />
    </div>
  );
}
