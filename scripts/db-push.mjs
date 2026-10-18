#!/usr/bin/env node
/**
 * Pushes the local JSON database (data/db.json, or a fresh seed from
 * lib/siteConfig.ts) into Postgres.
 *
 * Usage:
 *   DATABASE_URL="postgres://…" node scripts/db-push.mjs            # apply
 *   DATABASE_URL="postgres://…" node scripts/db-push.mjs --dry-run  # preview only
 *
 * Safe to re-run: existing rows are updated, nothing is deleted.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { Pool } = require("pg");

const DRY = process.argv.includes("--dry-run");
const URL_ = process.env.DATABASE_URL;

if (!URL_) {
  console.error("✖ DATABASE_URL is not set. Copy it from the Neon dashboard (the pooled connection string).");
  process.exit(1);
}

const DB_FILE = path.join(process.cwd(), "data", "db.json");
if (!fs.existsSync(DB_FILE)) {
  console.error(`✖ ${DB_FILE} not found. Run the app once (or npm run build) so it can be seeded.`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DB_FILE, "utf8"));
const { leads = [], visits = [], ...state } = data;

const pool = new Pool({
  connectionString: URL_,
  max: 2,
  ssl: /localhost|127\.0\.0\.1|sslmode=disable/i.test(URL_) ? undefined : { rejectUnauthorized: false },
});

const LEAD_COLS = ["id","type","name","phone","email","configuration","message","preferred_date","source","status","assigned_to","created_at"];
const leadRow = (l) => [l.id, l.type || "enquiry", l.name, l.phone, l.email || "", l.configuration || "", l.message || "", l.preferredDate || null, l.source || "website", l.status || "new", l.assignedTo || null, l.createdAt];

const VISIT_COLS = ["id","name","phone","email","preferred_date","preferred_slot","mode","notes","status","created_at"];
const visitRow = (v) => [v.id, v.name, v.phone, v.email || "", v.preferredDate || "", v.preferredSlot || "", v.mode || "self", v.notes || "", v.status || "requested", v.createdAt];

const placeholders = (cols, rows) =>
  rows.map((_, r) => `(${cols.map((__, c) => `$${r * cols.length + c + 1}`).join(",")})`).join(",");

async function upsert(client, table, cols, rows) {
  if (!rows.length) return 0;
  const sets = cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`).join(", ");
  await client.query(
    `insert into ${table} (${cols.join(",")}) values ${placeholders(cols, rows)}
     on conflict (id) do update set ${sets}`,
    rows.flat()
  );
  return rows.length;
}

async function main() {
  console.log(`→ Target: ${URL_.replace(/:[^:@/]+@/, ":****@")}`);
  console.log(`→ Source: data/db.json  (sections ${state.sections?.length ?? 0}, users ${state.users?.length ?? 0}, leads ${leads.length}, visits ${visits.length})`);

  const client = await pool.connect();
  try {
    await client.query(`
      create table if not exists app_state (id text primary key, data jsonb not null, updated_at timestamptz not null default now());
      create table if not exists leads (
        id text primary key, type text not null default 'enquiry', name text not null, phone text not null,
        email text not null default '', configuration text not null default '', message text not null default '',
        preferred_date text, source text not null default 'website', status text not null default 'new',
        assigned_to text, created_at timestamptz not null default now());
      create table if not exists site_visits (
        id text primary key, name text not null, phone text not null, email text not null default '',
        preferred_date text not null default '', preferred_slot text not null default '',
        mode text not null default 'self', notes text not null default '',
        status text not null default 'requested', created_at timestamptz not null default now());
    `);

    const existing = await client.query("select 1 from app_state where id = 'main'");
    if (existing.rowCount) {
      console.log("✓ app_state already exists — content will be overwritten with the local state (delete the row first if you'd rather keep the remote copy).");
    }

    if (DRY) {
      console.log("• dry run: no changes written.");
      return;
    }

    await client.query("begin");
    await client.query(
      `insert into app_state (id, data, updated_at) values ('main', $1::jsonb, now())
       on conflict (id) do update set data = excluded.data, updated_at = now()`,
      [JSON.stringify(state)]
    );
    const l = await upsert(client, "leads", LEAD_COLS, leads.map(leadRow));
    const v = await upsert(client, "site_visits", VISIT_COLS, visits.map(visitRow));
    await client.query("commit");

    console.log(`✓ Done — state saved, ${l} lead(s) and ${v} site visit(s) upserted.`);
  } catch (e) {
    await client.query("rollback").catch(() => {});
    console.error("✖ Migration failed:", e.message);
    process.exitCode = 1;
  } finally {
    client.release();
    await pool.end();
  }
}

main();
