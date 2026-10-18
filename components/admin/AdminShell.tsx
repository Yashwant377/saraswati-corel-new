"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Layers, Settings, Users, CalendarCheck, Inbox,
  LogOut, ExternalLink, Eye, ShieldAlert, Building2,
} from "lucide-react";

export type AdminUserClient = {
  id: string; name: string; email: string; role: string; roleLabel: string;
  mustChangePassword: boolean; permissions: string[];
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: null },
  { href: "/admin/sections", label: "Section Manager", icon: Layers, perm: "manage_sections" },
  { href: "/admin/settings", label: "Website Settings", icon: Settings, perm: "manage_settings" },
  { href: "/admin/leads", label: "Leads", icon: Inbox, perm: "view_leads" },
  { href: "/admin/visits", label: "Site Visits", icon: CalendarCheck, perm: "view_visits" },
  { href: "/admin/users", label: "Users & Security", icon: Users, perm: "manage_users" },
];

export default function AdminShell({ user, children }: { user: AdminUserClient; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  // Force password change after first login
  useEffect(() => {
    if (user.mustChangePassword && pathname !== "/admin/change-password") {
      router.replace("/admin/change-password?first=1");
    }
  }, [user.mustChangePassword, pathname, router]);

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  }

  const links = NAV.filter((n) => !n.perm || user.permissions.includes(n.perm));
  const current = links.find((l) => (l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href)));

  return (
    <div className="flex min-h-screen bg-slate-100">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col bg-slate-900 text-slate-300 md:flex">
        <div className="flex items-center gap-2.5 border-b border-white/10 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
            <Building2 className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-bold text-white leading-tight">Yashwant Kumar Mahto</p>
            <p className="text-[10.5px] uppercase tracking-widest text-slate-500">Admin Panel</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-colors ${
                  active ? "bg-emerald-600/20 text-emerald-300" : "hover:bg-white/5 hover:text-white"
                }`}
              >
                <l.icon className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} />
                {l.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-white/10 p-4">
          <div className="mb-3 rounded-xl bg-white/5 p-3">
            <p className="text-sm font-semibold text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
            <span className="mt-2 inline-block rounded-full bg-emerald-600/25 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300">
              {user.roleLabel}
            </span>
          </div>
          <button onClick={logout} className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
            <LogOut style={{ width: 17, height: 17 }} /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex min-w-0 flex-1 flex-col md:pl-64">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 py-3 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="truncate text-lg font-bold text-slate-900">{current?.label || "Admin"}</h1>
            {user.mustChangePassword && (
              <span className="hidden sm:inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-bold text-amber-700">
                <ShieldAlert style={{ width: 12, height: 12 }} /> Password change required
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <a href="/?preview=1" target="_blank" rel="noopener noreferrer" className="hidden sm:inline-flex items-center gap-1.5 rounded-xl border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
              <Eye style={{ width: 14, height: 14 }} /> Preview drafts
            </a>
            <a href="/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700">
              <ExternalLink style={{ width: 14, height: 14 }} /> View site
            </a>
            <button onClick={logout} className="md:hidden rounded-xl border border-slate-300 p-2 text-slate-600" aria-label="Sign out">
              <LogOut style={{ width: 16, height: 16 }} />
            </button>
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="flex gap-1.5 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden" aria-label="Admin navigation mobile">
          {links.map((l) => {
            const active = l.href === "/admin" ? pathname === "/admin" : pathname.startsWith(l.href);
            return (
              <Link key={l.href} href={l.href}
                className={`shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold ${active ? "bg-emerald-800 text-white" : "bg-slate-100 text-slate-600"}`}>
                {l.label}
              </Link>
            );
          })}
        </nav>

        <main className="flex-1 px-4 py-6 sm:px-8 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
