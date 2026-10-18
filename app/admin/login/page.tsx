"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, Mail, Eye, EyeOff, Loader2, ArrowLeft, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [mode, setMode] = useState<"login" | "forgot" | "forgot-sent">("login");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");

  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Login failed");
      const next = json.user?.mustChangePassword
        ? "/admin/change-password?first=1"
        : params.get("next") || "/admin";
      router.replace(next);
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function forgot(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch("/api/admin/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Request failed");
      setInfo(json.message || "Request submitted.");
      setMode("forgot-sent");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-8 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-800 text-white">
          <Lock className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Admin Panel</h1>
          <p className="text-xs text-slate-500">Amara Grove · Website Management</p>
        </div>
      </div>

      {mode === "login" && (
        <form onSubmit={login} className="space-y-5" noValidate>
          <div>
            <label htmlFor="identifier" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Admin Email or Username
            </label>
            <input
              id="identifier"
              type="text"
              autoComplete="username"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-semibold text-slate-700">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPass ? "text" : "password"}
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                placeholder="••••••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                aria-label={showPass ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPass ? <EyeOff className="h-4.5 w-4.5" style={{ width: 18, height: 18 }} /> : <Eye style={{ width: 18, height: 18 }} />}
              </button>
            </div>
          </div>

          {error && (
            <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700 border border-red-200">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-800 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-700 disabled:opacity-60"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
            {busy ? "Signing in…" : "Login"}
          </button>

          <button
            type="button"
            onClick={() => { setMode("forgot"); setError(""); }}
            className="w-full text-center text-sm font-medium text-emerald-800 hover:underline"
          >
            Forgot password?
          </button>

          <a href="/" className="flex items-center justify-center gap-1.5 pt-2 text-xs font-semibold text-slate-400 hover:text-slate-600">
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to website
          </a>
        </form>
      )}

      {mode === "forgot" && (
        <form onSubmit={forgot} className="space-y-5" noValidate>
          <p className="text-sm text-slate-500">
            Enter your admin email. A Super Admin will be notified to reset your password from the Users panel.
          </p>
          <div>
            <label htmlFor="femail" className="mb-1.5 block text-sm font-semibold text-slate-700">Email</label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="femail"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm outline-none transition focus:border-emerald-700 focus:ring-4 focus:ring-emerald-700/10"
                placeholder="you@example.com"
              />
            </div>
          </div>
          {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">{error}</p>}
          <button type="submit" disabled={busy} className="w-full rounded-xl bg-emerald-800 px-4 py-3.5 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            {busy ? "Submitting…" : "Submit Reset Request"}
          </button>
          <button type="button" onClick={() => setMode("login")} className="w-full text-center text-sm font-medium text-slate-500 hover:text-slate-700">
            ← Back to login
          </button>
        </form>
      )}

      {mode === "forgot-sent" && (
        <div className="space-y-5">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            ✓ {info}
          </div>
          <button onClick={() => setMode("login")} className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Back to login
          </button>
        </div>
      )}
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-screen bg-slate-50">
      {/* Brand panel */}
      <div className="relative hidden w-[46%] overflow-hidden lg:block">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950/95 via-emerald-950/55 to-emerald-900/30" />
        <div className="relative flex h-full flex-col justify-end p-12 text-white">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-amber-300 mb-3">Amara Grove</p>
          <h2 className="font-serif text-4xl font-semibold leading-tight">Manage every inch of your marketing site.</h2>
          <p className="mt-4 max-w-md text-sm text-white/70 leading-relaxed">
            Sections, pricing, floor plans, leads, site visits, branding, theme and users — full control from one secure panel.
          </p>
          <div className="mt-8 flex gap-6 text-xs text-white/60">
            <span>🔒 Role-based access</span>
            <span>📝 Draft &amp; publish</span>
            <span>👁 Live preview</span>
          </div>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 items-center justify-center p-6 sm:p-12">
        <Suspense fallback={<div className="text-sm text-slate-400">Loading…</div>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
