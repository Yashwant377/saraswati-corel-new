# Deploying the Postgres update — step by step

This update makes **leads, site visits and all CMS changes persist on Vercel**
(they currently do not — Vercel's filesystem is read-only) and adds a safety net so a
lead can never be lost silently.

Nothing changes for local development: without `DATABASE_URL` the app still uses
`data/db.json`, exactly as before.

---

## 1. Get the files into your repository

Copy the contents of the zip into your project, keeping the folder structure
(everything in the zip sits at paths relative to the project root), then:

```bash
cd your-repo
npm install          # installs the new "pg" dependency
git add .
git commit -m "Add Postgres persistence (Neon), lead safety net, upload/health routes"
git push             # Vercel redeploys automatically
```

### What changed

| Path | Change | Why |
| --- | --- | --- |
| `lib/pg.ts` | **NEW** | Postgres layer: schema, state row, transactional lead/visit sync |
| `lib/db.ts` | rewritten | One API used everywhere; picks Postgres when `DATABASE_URL` is set, else the JSON file; `flushDB()` tells callers if a write really landed |
| `lib/notify.ts` | **NEW** | Pushes every enquiry to `LEAD_WEBHOOK_URL` (Zapier / Make / Sheets / WhatsApp) |
| `app/api/leads/route.ts` | modified | Waits for the DB write before answering; on failure returns **503 with an honest message + your phone number**, and reports the lead as `lead.failed` |
| `app/api/visits/route.ts` | modified | Same treatment for site-visit bookings |
| `app/api/health/route.ts` | **NEW** | `GET /api/health` → storage mode + database reachability (503 when down) |
| `app/api/admin/**/route.ts` (16 files) | modified | One line: `await dbReady();` at the start of each handler |
| `app/page.tsx`, `app/layout.tsx` | modified | `await dbReady()` before reading data |
| `app/sitemap.ts` | modified | Reads the DB at request time, so builds never depend on the database |
| `lib/auth.ts` | modified | Loud warning if `SESSION_SECRET` is missing in production |
| `next.config.js` | modified | Keeps `pg` external to the server bundle |
| `scripts/db-push.mjs` | **NEW** | Copies `data/db.json` into Postgres (`--dry-run` supported) |
| `package.json`, `package-lock.json` | modified | Added `pg` (+ `@types/pg`) |
| `.env.example`, `README.md` | modified | Documents the new variables and deployment steps |

---

## 2. Environment variables — Vercel → Project → Settings → Environment Variables

| Variable | Required? | Value |
| --- | --- | --- |
| `DATABASE_URL` | **Yes** | Injected automatically when you connect Neon via **Storage → Connect Database** (or Neon → Integrations → Vercel). Use the **pooled** string — the host contains `-pooler` |
| `SESSION_SECRET` | **Yes — check this now** | A long random string. Without it the app falls back to a public key, so admin sessions are unsafe. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `ADMIN_EMAIL` | Yes | Seeds the first admin account (used only when the database is empty) |
| `ADMIN_PASSWORD` | Yes | Temporary; the admin is forced to change it on first login |
| `LEAD_WEBHOOK_URL` | Strongly recommended | Any endpoint that accepts a JSON POST (Zapier/Make/n8n/Apps Script/WhatsApp). Every enquiry is delivered here instantly — including leads captured while the database is down |
| `PROJECT_NAME` | Optional | Shown in webhook payloads (default `Saraswati Coral`) |

Object-storage variables (`BLOB_READ_WRITE_TOKEN` or `S3_*`) are reserved for
moving the MahaRERA QR/certificate uploads off the read-only filesystem — that
switch is still to be built.

---

## 3. Redeploy and verify

```bash
# after the push, once Vercel finishes:
curl https://YOUR-DOMAIN/api/health
```

Expect:

```json
{ "ok": true, "db": { "mode": "postgres", "ok": true, "info": "neondb · PostgreSQL 17" },
  "leadWebhook": "configured" }
```

`"mode": "file"` means `DATABASE_URL` is missing → leads are still being lost.
`"ok": false` → the database is unreachable.

Then click through the site once: **the first page view seeds the database**
(sections, settings, admin user) from `lib/siteConfig.ts`.

---

## 4. Migrate existing data (optional)

Only needed if `data/db.json` holds content you want to keep:

```bash
DATABASE_URL="postgres://…" node scripts/db-push.mjs --dry-run   # preview
DATABASE_URL="postgres://…" node scripts/db-push.mjs             # apply
```

Safe to re-run; it upserts and never deletes.

---

## 5. Final checks before switching ads on

1. Submit one test enquiry on the live site → confirm it appears in **Admin → Leads**.
2. Log into `/admin` and change the admin password (forced on first login).
3. Make one content change in **Admin → Website Settings**, save, reload the public
   site — it must stick (this is the fix for "edits reverted"). Then confirm the
   database shows it: `select data->'settings'->'contact'->>'phone' from app_state;`
4. Optional but recommended: **Settings → Functions → Function Region → Mumbai (bom1)**
   so the app runs next to your database and audience.

---

## 6. What is still open

- **File uploads** (MahaRERA QR / certificate) → move to Vercel Blob or Neon Object
  Storage. Needs the bucket credentials.
- **Ad tracking** → Meta Pixel, GA4 and a Google Ads conversion event on form submit,
  plus saving `utm_source` / `gclid` / `fbclid` with every lead. Needs your Pixel ID
  and GA4 measurement ID.
- **Homepage caching** (ISR) and a shared rate-limit store for very large spikes.
