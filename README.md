# Saraswati Coral — Premium Real-Estate Landing Page + Admin CMS

A conversion-focused, single-page residential project marketing website (Saraswati Coral, CBD Belapur, Navi Mumbai)
with a complete admin panel: role-based users, section manager, global website settings,
leads & site-visit CRM — built with **Next.js 14 (App Router) + React + Tailwind CSS + TypeScript**.

> All project content lives in **one config file** (`lib/siteConfig.ts`) and can later be
> overridden without code from **Admin → Section Manager / Website Settings**.

---

## 1. Quick start

```bash
npm install
cp .env.example .env.local      # then edit ADMIN_EMAIL / ADMIN_PASSWORD / SESSION_SECRET
npm run dev                     # http://localhost:3000
# production
npm run build && npm run start
```

### Initial admin account

The **first Super Admin is seeded from environment variables** on first run
(`data/db.json` is created automatically):

| Variable         | Purpose                                             |
| ---------------- | --------------------------------------------------- |
| `ADMIN_EMAIL`    | Initial super-admin email/username                   |
| `ADMIN_PASSWORD` | Initial password (**forced change on first login**)  |
| `SESSION_SECRET` | HMAC secret for signed session cookies               |

Nothing is hardcoded: change `.env.local`, delete `data/db.json`, restart → re-seeded.
After the first login the app redirects to **/admin/change-password**.

- Website: `http://localhost:3000`
- Admin:   `http://localhost:3000/admin/login`
- Draft preview (admins only): `http://localhost:3000/?preview=1`

---

## 2. Roles & permissions (RBAC)

| Role              | Sections | Settings | Leads | Site visits | Users / security |
| ----------------- | :------: | :------: | :---: | :---------: | :--------------: |
| Super Admin       | ✅ manage | ✅ manage | ✅ manage | ✅ manage | ✅ manage |
| Content Manager   | ✅ manage | ✅ manage | 👁 view | 👁 view | — |
| Sales Manager     | — | — | ✅ manage | ✅ manage | — |
| Sales Agent       | — | — | 👁 view |  view | — |
| Enquiry Manager   | — | — | ✅ manage | 👁 view | — |

`/admin` pages and **all** `/api/admin/*` routes enforce permissions server-side
(`lib/auth.ts` → `apiUser(permission)`), plus a cookie-guard middleware.

---

## 3. Landing page (public)

Sticky nav · hero with lead form & RERA strip · overview fact cards · highlights ·
pricing table (4 configurations + disclaimer) · amenity cards with always-visible lists · gallery with
lightbox & category filters · SVG floor plans with modal + download · stylized location
map (click the map or **View Map** to open the enquiry popup; Google Maps link for the route) ·
configurable travel-time advantages · developer · **MahaRERA section with uploaded QR code & certificate** ·
offers · brochure (server-generated PDF via `pdf-lib`) · FAQ accordion · enquiry form ·
site-visit booking · contact · final CTA banner · footer with RERA/legal ·
sticky mobile CTA bar + floating WhatsApp · global lead modal opened by every CTA.

SEO: semantic HTML, `generateMetadata` from admin settings, JSON-LD
(`RealEstateListing` + `FAQPage`), `robots.ts`, `sitemap.ts`, optimized `next/image`.

### Lead capture
- `POST /api/leads` — enquiries / price / callback / brochure (validated, rate-limited)
- `POST /api/visits` — site-visit bookings (also mirrored into leads)
- Success state renders an on-form confirmation with a reference ID.

---

## 4. Admin panel (`/admin`)

| Area | What it does |
| ---- | ------------ |
| **Dashboard** | Lead/visit/section/user stats, recent activity |
| **Section Manager** | Add (11 ready templates incl. testimonials, payment plans, comparison, legal docs…), edit (title/subtitle/icon/background/layout/animation), reorder, duplicate, hide/show, rename, delete, **Save draft / Publish / Revert**, JSON content editor, live preview mode |
| **Website Settings** | Branding (logos light/dark/mobile, favicon, names, dimensions, link), contact (phone/whatsapp/email/address/hours/socials), website & SEO (title, meta, OG image, copyright, nav & footer links, CTA text), theme (light/dark, accent color, fonts, button & card style, radius, spacing, animations), maps & RERA |
| **Leads** | Search/filter/status pipeline, call/WhatsApp/email quick actions, CSV export, delete |
| **Site Visits** | Requests with date/slot/mode, confirm/complete/cancel |
| **Users & Security** | Create users with temporary passwords (forced change), role changes, enable/disable, password resets (also fulfils "forgot password" requests), delete — last super-admin protected |

Draft/publish model: **Save draft** writes to a draft layer (live site untouched),
**Publish** promotes draft content + field edits, **preview mode** (`/?preview=1`)
shows drafts & hidden sections to logged-in admins with badges.

---

### MahaRERA section (QR code & certificate)

The **MahaRERA Registered Project** section is a normal Section Manager entry.

1. **Admin → Website Sections → MahaRERA Details → Edit.**
2. In the green *“MahaRERA content — QR code & registration document”* panel:
   upload the **QR code image** (PNG/JPG/WEBP) and, optionally, the **registration
   document** (PDF or image), and edit the registration number / promoter / URL.
3. **Save draft → Publish.** Blank fields fall back to the defaults in `lib/siteConfig.ts`
   (`reraDefaults`), so the section also shows the registration number from
   **Settings → Maps & RERA** before anything is uploaded.

Uploads are stored in `public/uploads/` and served by the route handler
`app/uploads/[name]/route.ts` (Next resolves `/public` at build time, so a runtime-added
file needs that handler). Limits: 10 MB, png/jpg/webp/gif/svg/pdf, `manage_sections`
permission required. A new RERA block can be added any time via
**Add Section → “MahaRERA / RERA Details”**.

---

## 5. Storage & security

- JSON file store `data/db.json` (atomic writes, in-memory cache) — swap for Postgres/Prisma later without touching UI code.
- Passwords: **scrypt** with per-user salt; timing-safe compare.
- Sessions: HMAC-signed, httpOnly, sameSite=lax cookies (12 h TTL).
- Login + lead endpoints rate-limited in-memory.
- Forgot-password never leaks account existence; resets are fulfilled by a Super Admin.

---

## 5b. Deploying to Vercel (Postgres + lead safety)

Vercel's serverless filesystem is **read-only and per-instance**, so the JSON file
store cannot persist there. The app therefore supports two storage modes:

| `DATABASE_URL` | Mode | Use |
| --- | --- | --- |
| not set | `file` — `data/db.json` | local development (unchanged behaviour) |
| set | `postgres` — Neon / any Postgres | production |

### One-time setup

1. **Create the database** (Neon free tier is plenty: 1 GB storage, 100 CU-hours/project).
   Pick the region closest to your users (Singapore for India).
2. **Connect it to Vercel** — Vercel → project → **Storage → Connect Database → Neon**,
   or Neon → **Integrations → Vercel**. Vercel injects `DATABASE_URL` automatically.
   Use the **pooled** connection string (host contains `-pooler`).
3. **Add the remaining env vars** in Vercel → Settings → Environment Variables:
   `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `SESSION_SECRET`, `LEAD_WEBHOOK_URL` (recommended).
4. **Redeploy.** Tables are created automatically on first request; the database is
   seeded from `lib/siteConfig.ts` the first time it is empty.
5. **Verify:** open `/api/health` — it reports the storage mode and database reachability.

### Migrating your existing content

```bash
# preview, then apply; safe to re-run (upserts, never deletes)
DATABASE_URL="postgres://…" node scripts/db-push.mjs --dry-run
DATABASE_URL="postgres://…" node scripts/db-push.mjs
```

### Schema

- `app_state` — one JSONB row: sections, settings, users, audit log.
- `leads`, `site_visits` — real tables with transactional diff sync, so concurrent
  submissions can never overwrite each other (a single JSON blob cannot promise that).

### Lead safety net

`POST /api/leads` and `/api/visits` now **await the database write** before answering:

- write succeeds → `201`, and the lead is pushed to `LEAD_WEBHOOK_URL`;
- write fails → **`503` with an honest message including your phone number** (never a fake
  "thank you"), the lead is reported to `LEAD_WEBHOOK_URL` as `lead.failed`, and it stays
  in memory so it is written automatically on the next successful save.

---

## 6. Rebranding for another project

1. Edit `lib/siteConfig.ts` (project, pricing, configurations & floor-plan rooms,
   amenities, gallery, location, developer, offers, FAQs, default sections).
2. Delete `data/db.json`, restart → re-seeded from the new config.
3. Or do it all from the admin UI afterwards (no code).

Floor plans are data-driven SVGs (`rooms[]` per configuration) — editable in config,
rendered + downloadable on the site and embedded in the PDF brochure.

---

## 7. Structure

```
lib/siteConfig.ts        ← ALL project content (single source of truth)
lib/db.ts                ← JSON store, seeding, password hashing, audit log
lib/auth.ts              ← sessions, RBAC, rate limiting
lib/types.ts             ← entities + role/permission matrix
app/page.tsx             ← renders sections in admin-defined order
app/api/…                ← public lead/visit/brochure + protected admin API
app/admin/…              ← login + (panel) dashboard/sections/settings/leads/visits/users
components/site/…        ← landing sections (server + client)
components/admin/…       ← admin shell & UI primitives
public/images/…          ← generated marketing imagery
```

**Note:** images are AI-generated artistic impressions; RERA number, prices and travel
times are sample data — configure real values before going live.
#   s a r a s w a t i - c o r e l - n e w  
 #   s a r a s w a t i - c o r e l - n e w  
 