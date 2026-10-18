import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  DB, AdminUser, Section, Settings, Lead, SiteVisit, Role,
} from "./types";
import {
  defaultSections, brandingDefaults, contactDefaults, websiteDefaults,
  themeDefaults, conversionDefaults, project,
} from "./siteConfig";
import {
  pgEnabled, ensureSchema, loadState, saveState, loadLeads, loadVisits,
  syncLeads, syncVisits, testConnection,
} from "./pg";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

/** "postgres" when DATABASE_URL is configured (e.g. on Vercel), else the local JSON file. */
export const storageMode: "postgres" | "file" = pgEnabled ? "postgres" : "file";

export const uid = () => crypto.randomBytes(8).toString("hex");

/* ------------------------- password hashing (scrypt) --------------------- */
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}
export function verifyPassword(password: string, stored: string): boolean {
  try {
    const [salt, hash] = stored.split(":");
    const check = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(check, "hex"));
  } catch {
    return false;
  }
}

/* ------------------------------- seeding ---------------------------------- */
function seedDB(): DB {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "ChangeMe@12345";

  const admin: AdminUser = {
    id: uid(),
    name: "Super Administrator",
    email: adminEmail,
    username: adminEmail.split("@")[0],
    role: "super_admin",
    passwordHash: hashPassword(adminPassword),
    mustChangePassword: true, // forced change after first login
    active: true,
    createdAt: new Date().toISOString(),
  };

  const sections: Section[] = defaultSections.map((s, i) => ({
    ...s,
    order: i,
    status: "published",
    data: s.data ?? null,
    draftData: s.data ?? null,
    draftMeta: null,
    updatedAt: new Date().toISOString(),
  }));

  const settings: Settings = {
    branding: { ...brandingDefaults },
    contact: { ...contactDefaults },
    website: { ...websiteDefaults, navLinks: [...websiteDefaults.navLinks], footerLinks: [...websiteDefaults.footerLinks] },
    theme: { ...themeDefaults },
    conversion: { ...conversionDefaults, socialMessages: [...conversionDefaults.socialMessages] },
    maps: {
      address: project.location,
      lat: project.mapCoords.lat,
      lng: project.mapCoords.lng,
      directionsUrl: project.mapsUrl,
      city: project.city,
      state: "Maharashtra",
    },
    rera: { number: project.reraNumber, url: project.reraUrl },
  };

  return {
    version: 1,
    users: [admin],
    sections,
    settings,
    leads: [],
    visits: [],
    passwordResets: [],
    auditLog: [],
  };
}

/* ------------------------------ cache & state ----------------------------- */
let cache: DB | null = null;
let writeTimer: NodeJS.Timeout | null = null;
let readyPromise: Promise<void> | null = null;
let persistChain: Promise<void> = Promise.resolve();
let lastPersistError: any = null;
let warnedMissingReady = false;

const snapshots = { leads: new Map<string, string>(), visits: new Map<string, string>() };

function fingerprint<T extends { id: string }>(items: T[]): Map<string, string> {
  const m = new Map<string, string>();
  for (const it of items) m.set(it.id, JSON.stringify(it));
  return m;
}

/** Anything stored in app_state (leads/visits live in their own tables). */
function stateForStorage(db: DB) {
  const { leads, visits, ...rest } = db;
  return rest;
}

/** Merge any default sections added in code after this database was seeded. */
function mergeNewDefaults(db: DB) {
  const existing = new Set(db.sections.map((s) => s.id));
  defaultSections.forEach((def, i) => {
    if (!existing.has(def.id)) {
      db.sections.push({
        ...def, order: 1000 + i, status: "published",
        data: def.data ?? null, draftData: def.data ?? null,
        updatedAt: new Date().toISOString(),
      } as Section);
    }
  });
}

/* --------------------------------- PG mode -------------------------------- */

/**
 * Hydrates the cache from Postgres (or the JSON file). Call `await dbReady()`
 * once at the start of every route/page that touches the database.
 * Memoised: the work happens once per server instance.
 */
export function dbReady(): Promise<void> {
  if (!pgEnabled) { getDB(); return Promise.resolve(); }
  if (!readyPromise) {
    readyPromise = (async () => {
      await ensureSchema();
      const [state, leads, visits] = await Promise.all([loadState(), loadLeads(), loadVisits()]);

      if (state && typeof state === "object" && (state as any).settings) {
        cache = { ...(state as DB), leads, visits };
      } else {
        // First run against a fresh database → seed it from siteConfig.
        const seeded = seedDB();
        cache = { ...seeded, leads: leads ?? [], visits: visits ?? [] };
        await saveState(stateForStorage(cache));
      }
      mergeNewDefaults(cache!);
      snapshots.leads = fingerprint(cache!.leads);
      snapshots.visits = fingerprint(cache!.visits);
    })().catch((e) => {
      readyPromise = null; // let the next request retry
      throw e;
    });
  }
  return readyPromise;
}

function enqueuePersist() {
  lastPersistError = null;
  persistChain = persistChain
    .then(async () => {
      if (!cache) return;
      await saveState(stateForStorage(cache));
      snapshots.leads = await syncLeads(cache.leads, snapshots.leads);
      snapshots.visits = await syncVisits(cache.visits, snapshots.visits);
    })
    .catch((e) => {
      lastPersistError = e;
      console.error("[db] persist failed:", e?.message || e);
    });
}

/**
 * Waits for pending writes to land in Postgres.
 * Throws if the most recent write failed — callers must surface that to the
 * user instead of pretending the data was saved.
 */
export async function flushDB(): Promise<void> {
  if (!pgEnabled) { saveDB(true); return; }
  enqueuePersist();
  await persistChain;
  if (lastPersistError) {
    const err = lastPersistError;
    lastPersistError = null;
    throw err;
  }
}

/* --------------------------- file-backed store ---------------------------- */
function loadFromFile(): DB {
  try {
    if (fs.existsSync(DB_FILE)) {
      cache = JSON.parse(fs.readFileSync(DB_FILE, "utf8")) as DB;
      mergeNewDefaults(cache!);
      return cache!;
    }
  } catch (e) {
    console.error("DB read failed, re-seeding:", e);
  }
  cache = seedDB();
  saveDB(true);
  return cache;
}

export function getDB(): DB {
  if (cache) return cache;

  if (pgEnabled) {
    // A route forgot `await dbReady()`. Serve a seed for this request and
    // hydrate in the background so later requests are correct.
    if (!warnedMissingReady) {
      warnedMissingReady = true;
      console.warn("[db] getDB() called before dbReady() — a route is missing `await dbReady()`. Falling back to an in-memory seed for this request.");
    }
    void dbReady().catch(() => {});
    cache = seedDB();
    return cache;
  }

  return loadFromFile();
}

export function saveDB(immediate = false) {
  if (!cache) return;

  if (pgEnabled) { enqueuePersist(); return; }

  const flush = () => {
    try {
      fs.mkdirSync(DATA_DIR, { recursive: true });
      const tmp = DB_FILE + ".tmp";
      fs.writeFileSync(tmp, JSON.stringify(cache, null, 2));
      fs.renameSync(tmp, DB_FILE);
    } catch (e) {
      console.error("DB save failed:", e);
    }
  };
  if (immediate) { flush(); return; }
  if (writeTimer) clearTimeout(writeTimer);
  writeTimer = setTimeout(flush, 120);
}

export function mutate<T>(fn: (db: DB) => T): T {
  const db = getDB();
  const result = fn(db);
  saveDB();
  return result;
}

export function audit(db: DB, action: string, userId?: string, meta?: any) {
  db.auditLog.unshift({ id: uid(), at: new Date().toISOString(), userId, action, meta });
  if (db.auditLog.length > 500) db.auditLog.length = 500;
}

/** Diagnostics for the admin panel / ops. */
export async function dbHealth() {
  if (!pgEnabled) {
    return { mode: "file" as const, ok: true, info: `JSON file store (${path.relative(process.cwd(), DB_FILE)})` };
  }
  const r = await testConnection();
  return { mode: "postgres" as const, ...r };
}

/* ------------------------------ collections -------------------------------- */
export const leadStatuses: Lead["status"][] = ["new", "contacted", "qualified", "site_visit", "closed_won", "closed_lost"];
export const leadTypes: Lead["type"][] = ["enquiry", "price", "visit", "callback", "brochure"];
export const roles: Role[] = ["super_admin", "content_manager", "sales_manager", "sales_agent", "enquiry_manager"];

export function sortedSections(preview = false): Section[] {
  const db = getDB();
  return [...db.sections]
    .sort((a, b) => a.order - b.order)
    .filter((s) => preview || (s.visible && s.status === "published"));
}
