/**
 * Postgres persistence (Neon or any Postgres) — active when DATABASE_URL is set.
 *
 * Layout:
 *   app_state    → one JSONB row: sections, settings, users, audit log, resets
 *   leads        → a real table (CRM can grow; concurrent submissions can never
 *                  overwrite each other, which a single JSON blob cannot promise)
 *   site_visits  → same treatment
 *
 * `pg` is imported lazily so the module stays cheap to load and never gets
 * pulled into an edge bundle.
 */
import type { Lead, SiteVisit } from "./types";

const CONN = process.env.DATABASE_URL || "";

/** Postgres mode is on only when a connection string is configured. */
export const pgEnabled = /^postgres(ql)?:\/\//i.test(CONN);

let pool: any = null;
let schemaReady: Promise<void> | null = null;

function useSsl(url: string) {
  if (/localhost|127\.0\.0\.1|sslmode=disable/i.test(url)) return false;
  return true; // Neon and other hosted Postgres require TLS
}

export async function getPool() {
  if (pool) return pool;
  const { Pool } = await import("pg");
  pool = new Pool({
    connectionString: CONN,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 8_000,
    ssl: useSsl(CONN) ? { rejectUnauthorized: false } : undefined,
  });
  pool.on("error", (e: any) => console.error("[pg] idle client error:", e?.message));
  return pool;
}

export async function ensureSchema() {
  if (!schemaReady) {
    schemaReady = (async () => {
      const p = await getPool();
      await p.query(`
        create table if not exists app_state (
          id text primary key,
          data jsonb not null,
          updated_at timestamptz not null default now()
        );
        create table if not exists leads (
          id text primary key,
          type text not null default 'enquiry',
          name text not null,
          phone text not null,
          email text not null default '',
          configuration text not null default '',
          message text not null default '',
          preferred_date text,
          source text not null default 'website',
          status text not null default 'new',
          assigned_to text,
          created_at timestamptz not null default now()
        );
        create table if not exists site_visits (
          id text primary key,
          name text not null,
          phone text not null,
          email text not null default '',
          preferred_date text not null default '',
          preferred_slot text not null default '',
          mode text not null default 'self',
          notes text not null default '',
          status text not null default 'requested',
          created_at timestamptz not null default now()
        );
        create index if not exists leads_created_idx on leads (created_at desc);
        create index if not exists leads_status_idx on leads (status);
        create index if not exists visits_created_idx on site_visits (created_at desc);
      `);
    })().catch((e) => {
      schemaReady = null; // allow a retry on the next call
      throw e;
    });
  }
  return schemaReady;
}

export async function testConnection(): Promise<{ ok: boolean; info?: string; error?: string }> {
  try {
    const p = await getPool();
    const r = await p.query("select current_database() as db, version() as v");
    return { ok: true, info: `${r.rows[0].db} · ${String(r.rows[0].v).split(" ").slice(0, 2).join(" ")}` };
  } catch (e: any) {
    return { ok: false, error: e?.message || String(e) };
  }
}

/* --------------------------------- state ---------------------------------- */

const STATE_ID = "main";

export async function loadState(): Promise<any | null> {
  await ensureSchema();
  const p = await getPool();
  const r = await p.query("select data from app_state where id = $1", [STATE_ID]);
  return r.rows[0]?.data ?? null;
}

export async function saveState(data: any): Promise<void> {
  await ensureSchema();
  const p = await getPool();
  await p.query(
    `insert into app_state (id, data, updated_at) values ($1, $2::jsonb, now())
     on conflict (id) do update set data = excluded.data, updated_at = now()`,
    [STATE_ID, JSON.stringify(data)]
  );
}

/* ---------------------------------- rows ---------------------------------- */

type RowCfg<T> = {
  table: string;
  cols: string[];
  toRow: (item: T) => any[];
  fromRow: (row: any) => T;
  key: (item: T) => string;
};

const LEADS: RowCfg<Lead> = {
  table: "leads",
  cols: ["id", "type", "name", "phone", "email", "configuration", "message", "preferred_date", "source", "status", "assigned_to", "created_at"],
  key: (l) => l.id,
  toRow: (l) => [
    l.id, l.type, l.name, l.phone, l.email || "", l.configuration || "", l.message || "",
    l.preferredDate || null, l.source || "website", l.status || "new", l.assignedTo || null,
    l.createdAt,
  ],
  fromRow: (r) => ({
    id: r.id, type: r.type, name: r.name, phone: r.phone,
    email: r.email || "", configuration: r.configuration || "", message: r.message || "",
    ...(r.preferred_date ? { preferredDate: r.preferred_date } : {}),
    source: r.source || "website", status: r.status,
    ...(r.assigned_to ? { assignedTo: r.assigned_to } : {}),
    createdAt: new Date(r.created_at).toISOString(),
  }),
};

const VISITS: RowCfg<SiteVisit> = {
  table: "site_visits",
  cols: ["id", "name", "phone", "email", "preferred_date", "preferred_slot", "mode", "notes", "status", "created_at"],
  key: (v) => v.id,
  toRow: (v) => [
    v.id, v.name, v.phone, v.email || "", v.preferredDate || "", v.preferredSlot || "",
    v.mode || "self", v.notes || "", v.status || "requested", v.createdAt,
  ],
  fromRow: (r) => ({
    id: r.id, name: r.name, phone: r.phone, email: r.email || "",
    preferredDate: r.preferred_date || "", preferredSlot: r.preferred_slot || "",
    mode: r.mode, notes: r.notes || "", status: r.status,
    createdAt: new Date(r.created_at).toISOString(),
  }),
};

async function loadRows<T>(cfg: RowCfg<T>): Promise<T[]> {
  await ensureSchema();
  const p = await getPool();
  const r = await p.query(`select * from ${cfg.table} order by created_at desc`);
  return r.rows.map(cfg.fromRow) as T[];
}

export const loadLeads = () => loadRows(LEADS);
export const loadVisits = () => loadRows(VISITS);

/**
 * Persists the difference between the current collection and the previous
 * snapshot: new rows are inserted, changed rows updated, removed rows deleted.
 * Runs in one transaction, so a partial write can never happen.
 *
 * Returns the new snapshot (id → row fingerprint).
 */
async function syncRows<T>(cfg: RowCfg<T>, current: T[], prev: Map<string, string>): Promise<Map<string, string>> {
  await ensureSchema();
  const p = await getPool();

  const now = new Map<string, string>();
  const inserts: T[] = [];
  const updates: T[] = [];
  const deletes: string[] = [];

  for (const item of current) {
    const id = cfg.key(item);
    const fp = JSON.stringify(item);
    now.set(id, fp);
    const before = prev.get(id);
    if (before === undefined) inserts.push(item);
    else if (before !== fp) updates.push(item);
  }
  for (const id of Array.from(prev.keys())) if (!now.has(id)) deletes.push(id);

  if (!inserts.length && !updates.length && !deletes.length) return now;

  const client = await p.connect();
  try {
    await client.query("begin");

    const placeholders = (rows: any[][]) =>
      rows.map((_, r) => `(${cfg.cols.map((__, c) => `$${r * cfg.cols.length + c + 1}`).join(",")})`).join(",");

    if (inserts.length) {
      const rows = inserts.map(cfg.toRow);
      await client.query(
        `insert into ${cfg.table} (${cfg.cols.join(",")}) values ${placeholders(rows)} on conflict (id) do nothing`,
        rows.flat()
      );
    }
    if (updates.length) {
      const rows = updates.map(cfg.toRow);
      const sets = cfg.cols.filter((c) => c !== "id").map((c) => `${c} = excluded.${c}`).join(", ");
      await client.query(
        `insert into ${cfg.table} (${cfg.cols.join(",")}) values ${placeholders(rows)}
         on conflict (id) do update set ${sets}`,
        rows.flat()
      );
    }
    if (deletes.length) {
      await client.query(`delete from ${cfg.table} where id = any($1::text[])`, [deletes]);
    }

    await client.query("commit");
  } catch (e) {
    await client.query("rollback").catch(() => {});
    throw e;
  } finally {
    client.release();
  }

  return now;
}

export const syncLeads = (current: Lead[], prev: Map<string, string>) => syncRows(LEADS, current, prev);
export const syncVisits = (current: SiteVisit[], prev: Map<string, string>) => syncRows(VISITS, current, prev);
