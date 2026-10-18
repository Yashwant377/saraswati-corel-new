"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Inbox, CalendarCheck, Layers, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, Badge, Spinner, apiFetch } from "@/components/admin/ui";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    apiFetch("/api/admin/stats").then(setData).catch((e) => setErr(e.message));
  }, []);

  if (err) return <p className="text-sm text-red-600">{err}</p>;
  if (!data) return <Spinner />;
  const s = data.stats;

  const cards = [
    { label: "Total Leads", value: s.leads, sub: `${s.newLeads24h} in last 24h · ${s.newLeads7d} this week`, icon: Inbox, href: "/admin/leads", tone: "bg-emerald-600" },
    { label: "Site Visits", value: s.visits, sub: `${s.pendingVisits} awaiting confirmation`, icon: CalendarCheck, href: "/admin/visits", tone: "bg-sky-600" },
    { label: "Live Sections", value: s.publishedSections, sub: `${s.draftSections} in draft · ${s.sections} total`, icon: Layers, href: "/admin/sections", tone: "bg-violet-600" },
    { label: "Admin Users", value: s.users, sub: "Role-based access control", icon: Users, href: "/admin/users", tone: "bg-amber-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} href={c.href}>
            <Card className="group p-5 transition-all hover:-translate-y-0.5 hover:shadow-md">
              <div className="flex items-start justify-between">
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${c.tone}`}>
                  <c.icon style={{ width: 19, height: 19 }} />
                </span>
                <ArrowUpRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-emerald-600" />
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">{c.value}</p>
              <p className="text-sm font-semibold text-slate-600">{c.label}</p>
              <p className="mt-1 text-xs text-slate-400">{c.sub}</p>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Recent Leads</h2>
            <Link href="/admin/leads" className="text-xs font-semibold text-emerald-700 hover:underline">View all →</Link>
          </div>
          {data.recentLeads.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No leads yet. Share the site to start collecting enquiries.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentLeads.map((l: any) => (
                <li key={l.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{l.name} <span className="font-normal text-slate-400">· {l.phone}</span></p>
                    <p className="truncate text-xs text-slate-400">{l.type} · {l.configuration} · {new Date(l.createdAt).toLocaleString("en-IN")}</p>
                  </div>
                  <Badge tone={l.status === "new" ? "blue" : l.status.startsWith("closed") ? "slate" : "green"}>{l.status.replace("_", " ")}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Upcoming Site Visits</h2>
            <Link href="/admin/visits" className="text-xs font-semibold text-emerald-700 hover:underline">View all →</Link>
          </div>
          {data.recentVisits.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-400">No site visit requests yet.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {data.recentVisits.map((v: any) => (
                <li key={v.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{v.name} <span className="font-normal text-slate-400">· {v.phone}</span></p>
                    <p className="truncate text-xs text-slate-400">{v.preferredDate} · {v.preferredSlot} · {v.mode === "pickup" ? "Pick-up & drop" : "Self visit"}</p>
                  </div>
                  <Badge tone={v.status === "requested" ? "amber" : v.status === "confirmed" ? "green" : "slate"}>{v.status}</Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700"><TrendingUp style={{ width: 19, height: 19 }} /></span>
          <div>
            <p className="text-sm font-bold text-slate-900">Running a paid campaign?</p>
            <p className="text-xs text-slate-500">Use the Preview mode to check drafts before publishing them to live traffic.</p>
          </div>
        </div>
        <a href="/?preview=1" target="_blank" rel="noopener noreferrer" className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50">
          Open preview →
        </a>
      </Card>
    </div>
  );
}
