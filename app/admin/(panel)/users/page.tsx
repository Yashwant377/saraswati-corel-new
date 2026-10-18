"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, X, KeyRound, ShieldCheck, Trash2, UserCheck, UserX, Inbox } from "lucide-react";
import { Card, Badge, Spinner, Toast, apiFetch, Field, inputCls } from "@/components/admin/ui";
import { ROLE_LABELS } from "@/lib/types";

const ROLES = Object.entries(ROLE_LABELS);

export default function UsersPage() {
  const [users, setUsers] = useState<any[] | null>(null);
  const [resets, setResets] = useState<any[]>([]);
  const [err, setErr] = useState("");
  const [adding, setAdding] = useState(false);
  const [toast, setToast] = useState<{ msg: string; tone: "ok" | "err" }>({ msg: "", tone: "ok" });

  const notify = (msg: string, tone: "ok" | "err" = "ok") => {
    setToast({ msg, tone });
    setTimeout(() => setToast({ msg: "", tone: "ok" }), 3200);
  };

  const load = useCallback(async () => {
    try {
      const j = await apiFetch("/api/admin/users");
      setUsers(j.users);
      setResets(j.passwordResets || []);
    } catch (e: any) { setErr(e.message); }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function patch(id: string, body: any, msg: string) {
    try {
      await apiFetch(`/api/admin/users/${id}`, { method: "PATCH", body: JSON.stringify(body) });
      notify(msg);
      load();
    } catch (e: any) { notify(e.message, "err"); }
  }

  async function remove(u: any) {
    if (!confirm(`Delete user ${u.name} (${u.email})?`)) return;
    try {
      await apiFetch(`/api/admin/users/${u.id}`, { method: "DELETE" });
      notify("User deleted");
      load();
    } catch (e: any) { notify(e.message, "err"); }
  }

  function resetPassword(u: any) {
    const p = prompt(`Set a temporary password for ${u.email} (min 10 chars, upper+lower+number). They must change it at next login.`);
    if (!p) return;
    patch(u.id, { resetPassword: p }, "Temporary password set — user must change it at next login");
  }

  if (err) return <Card className="p-8 text-center text-sm text-red-600">Access denied: {err}. This area requires the Super Admin role.</Card>;
  if (!users) return <Spinner label="Loading users…" />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Users & Security</h2>
          <p className="text-sm text-slate-500">Role-based access control for the whole panel.</p>
        </div>
        <button onClick={() => setAdding(true)} className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700">
          <Plus style={{ width: 14, height: 14 }} /> Add Admin User
        </button>
      </div>

      {resets.length > 0 && (
        <Card className="border-amber-200 bg-amber-50 p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-amber-800"><Inbox style={{ width: 15, height: 15 }} /> Pending password reset requests</h3>
          <ul className="mt-3 space-y-1.5 text-sm text-amber-700">
            {resets.map((r) => (
              <li key={r.id}>
                <strong>{r.email}</strong> — requested {new Date(r.createdAt).toLocaleString("en-IN")} ·{" "}
                <button className="font-bold underline" onClick={() => {
                  const u = users.find((x) => x.email.toLowerCase() === r.email.toLowerCase());
                  if (u) resetPassword(u); else notify("No matching user found", "err");
                }}>reset now</button>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-wider text-slate-500">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Last Login</th>
              <th className="px-5 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60">
                <td className="px-5 py-3.5">
                  <p className="font-bold text-slate-800">{u.name}</p>
                  <p className="text-xs text-slate-400">{u.email}</p>
                </td>
                <td className="px-5 py-3.5">
                  <select value={u.role} onChange={(e) => patch(u.id, { role: e.target.value }, "Role updated")}
                    className="rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-semibold outline-none focus:border-emerald-700">
                    {ROLES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </td>
                <td className="px-5 py-3.5">
                  <div className="flex flex-wrap gap-1.5">
                    {u.active ? <Badge tone="green">Active</Badge> : <Badge tone="red">Disabled</Badge>}
                    {u.mustChangePassword && <Badge tone="amber">Must change password</Badge>}
                  </div>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString("en-IN") : "Never"}</td>
                <td className="px-5 py-3.5">
                  <div className="flex gap-1.5">
                    <button onClick={() => resetPassword(u)} aria-label="Reset password" title="Reset password" className="rounded-lg bg-sky-50 p-2 text-sky-600 hover:bg-sky-100"><KeyRound style={{ width: 14, height: 14 }} /></button>
                    <button onClick={() => patch(u.id, { active: !u.active }, u.active ? "User disabled" : "User activated")}
                      aria-label={u.active ? "Disable user" : "Activate user"} title={u.active ? "Disable" : "Activate"}
                      className={`rounded-lg p-2 ${u.active ? "bg-amber-50 text-amber-600 hover:bg-amber-100" : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"}`}>
                      {u.active ? <UserX style={{ width: 14, height: 14 }} /> : <UserCheck style={{ width: 14, height: 14 }} />}
                    </button>
                    <button onClick={() => remove(u)} aria-label="Delete user" title="Delete" className="rounded-lg bg-red-50 p-2 text-red-500 hover:bg-red-100"><Trash2 style={{ width: 14, height: 14 }} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <Card className="p-6">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-800"><ShieldCheck style={{ width: 15, height: 15 }} className="text-emerald-700" /> Role permissions reference</h3>
        <ul className="mt-3 grid gap-2 text-xs text-slate-500 sm:grid-cols-2 lg:grid-cols-3">
          <li><strong>Super Admin</strong> — full access: sections, settings, leads, visits, users, security.</li>
          <li><strong>Content Manager</strong> — sections, settings, view leads.</li>
          <li><strong>Sales Manager</strong> — manage leads & site visits.</li>
          <li><strong>Sales Agent</strong> — view leads & site visits.</li>
          <li><strong>Enquiry Manager</strong> — view & manage leads, view visits.</li>
        </ul>
      </Card>

      {adding && <AddUserModal onClose={() => setAdding(false)} onAdded={() => { setAdding(false); load(); notify("User created — they must change the temporary password at first login"); }} notify={notify} />}
      <Toast msg={toast.msg} tone={toast.tone} />
    </div>
  );
}

function AddUserModal({ onClose, onAdded, notify }: { onClose: () => void; onAdded: () => void; notify: (m: string, t?: "ok" | "err") => void }) {
  const [form, setForm] = useState({ name: "", email: "", role: "sales_agent", password: "" });
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      await apiFetch("/api/admin/users", { method: "POST", body: JSON.stringify(form) });
      onAdded();
    } catch (err: any) { notify(err.message, "err"); setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" role="dialog" aria-modal="true">
      <form onSubmit={submit} className="modal-enter w-full max-w-md rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h3 className="font-bold text-slate-900">Add Admin User</h3>
          <button type="button" onClick={onClose} aria-label="Close" className="rounded-full p-2 text-slate-400 hover:bg-slate-100"><X style={{ width: 18, height: 18 }} /></button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <Field label="Full name"><input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email"><input required type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></Field>
          <Field label="Role">
            <select className={inputCls} value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {ROLES.map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
          </Field>
          <Field label="Temporary password" hint="Min 10 chars with upper, lower and number. User must change it at first login.">
            <input required minLength={10} className={inputCls} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </Field>
        </div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-6 py-4">
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="submit" disabled={busy} className="rounded-xl bg-emerald-700 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-600 disabled:opacity-50">{busy ? "Creating…" : "Create User"}</button>
        </div>
      </form>
    </div>
  );
}
