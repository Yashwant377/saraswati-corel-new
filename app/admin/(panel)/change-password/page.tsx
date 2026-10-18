"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { Card, Field, inputCls } from "@/components/admin/ui";

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 10) s++;
  if (/[A-Z]/.test(pw)) s++;
  if (/[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  return s;
}

function ChangePasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const first = params.get("first") === "1";
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const s = strength(form.newPassword);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (form.newPassword !== form.confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed");
      router.replace("/admin");
      router.refresh();
    } catch (err: any) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <Card className="mx-auto max-w-md p-8">
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white"><KeyRound style={{ width: 20, height: 20 }} /></span>
      <h2 className="text-lg font-bold text-slate-900">{first ? "Set your new password" : "Change password"}</h2>
      <p className="mt-1 text-sm text-slate-500">
        {first
          ? "For security, you must replace the initial password before using the admin panel."
          : "Choose a strong password you don't reuse elsewhere."}
      </p>

      <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
        {!first && (
          <Field label="Current password">
            <input required type="password" autoComplete="current-password" className={inputCls}
              value={form.currentPassword} onChange={(e) => setForm({ ...form, currentPassword: e.target.value })} />
          </Field>
        )}
        <Field label="New password" hint="Minimum 10 characters with upper case, lower case and a number.">
          <input required type="password" autoComplete="new-password" minLength={10} className={inputCls}
            value={form.newPassword} onChange={(e) => setForm({ ...form, newPassword: e.target.value })} />
        </Field>
        <div className="flex gap-1" aria-hidden>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`h-1.5 flex-1 rounded-full ${i <= s ? (s <= 2 ? "bg-red-400" : s <= 3 ? "bg-amber-400" : "bg-emerald-500") : "bg-slate-200"}`} />
          ))}
        </div>
        <Field label="Confirm new password">
          <input required type="password" autoComplete="new-password" className={inputCls}
            value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} />
        </Field>

        {error && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

        <button type="submit" disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
          {busy ? "Updating…" : "Update Password & Continue"}
        </button>
      </form>
    </Card>
  );
}

export default function ChangePasswordPage() {
  return (
    <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
      <ChangePasswordForm />
    </Suspense>
  );
}
