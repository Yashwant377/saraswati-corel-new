import crypto from "crypto";
import fs from "fs";
import path from "path";
import { cookies } from "next/headers";
import { getDB, verifyPassword } from "./db";
import { AdminUser, Permission, ROLE_PERMISSIONS } from "./types";

export const SESSION_COOKIE = "ag_session";
export const PREVIEW_COOKIE = "ag_preview";
const SESSION_TTL_MS = 1000 * 60 * 60 * 12; // 12 hours

let warnedNoSecret = false;

function secretKey(): string {
  if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;
  const keyFile = path.join(process.cwd(), "data", ".session-key");
  try {
    if (fs.existsSync(keyFile)) return fs.readFileSync(keyFile, "utf8").trim();
    const key = crypto.randomBytes(32).toString("hex");
    fs.mkdirSync(path.dirname(keyFile), { recursive: true });
    fs.writeFileSync(keyFile, key, { mode: 0o600 });
    return key;
  } catch {
    if (process.env.NODE_ENV === "production" && !warnedNoSecret) {
      warnedNoSecret = true;
      console.error(
        "[auth] ⚠ SESSION_SECRET is not set and the key file could not be written " +
        "(read-only filesystem?). Admin sessions are using a PUBLIC fallback key — " +
        "set SESSION_SECRET in your hosting environment immediately."
      );
    }
    return "dev-insecure-key";
  }
}

function sign(payload: string): string {
  return crypto.createHmac("sha256", secretKey()).update(payload).digest("base64url");
}

export function createSessionToken(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ uid: userId, exp: Date.now() + SESSION_TTL_MS })
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function readSessionToken(token: string | undefined): string | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = sign(payload);
  try {
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!data?.uid || Date.now() > data.exp) return null;
    return data.uid as string;
  } catch {
    return null;
  }
}

export function getSessionUser(): AdminUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  const uid = readSessionToken(token);
  if (!uid) return null;
  const user = getDB().users.find((u) => u.id === uid && u.active);
  return user ?? null;
}

export function can(user: AdminUser | null | undefined, perm: Permission): boolean {
  if (!user) return false;
  return ROLE_PERMISSIONS[user.role]?.includes(perm) ?? false;
}

/* --------------------------- simple rate limiting -------------------------- */
const attempts = new Map<string, { count: number; first: number }>();
export function rateLimited(key: string, max = 8, windowMs = 10 * 60 * 1000): boolean {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.first > windowMs) {
    attempts.set(key, { count: 1, first: now });
    return false;
  }
  rec.count += 1;
  return rec.count > max;
}

/* ------------------------------- login flow -------------------------------- */
export function authenticate(identifier: string, password: string): AdminUser | null {
  const db = getDB();
  const id = identifier.trim().toLowerCase();
  const user = db.users.find(
    (u) => u.email.toLowerCase() === id || (u.username || "").toLowerCase() === id
  );
  if (!user || !user.active) return null;
  return verifyPassword(password, user.passwordHash) ? user : null;
}

/**
 * For API route handlers: returns the session user if they hold `perm`,
 * otherwise null (caller responds 401/403).
 */
export function apiUser(perm?: Permission): AdminUser | null {
  const user = getSessionUser();
  if (!user) return null;
  if (perm && !can(user, perm)) return null;
  return user;
}
