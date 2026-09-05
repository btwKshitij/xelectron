import "server-only";
import { cookies } from "next/headers";
import crypto from "crypto";
import { SESSION_COOKIE_NAME, SESSION_MAX_AGE_SECONDS } from "./constants";

// ─── Token Utilities ─────────────────────────────────────────────────────────

/** Generate a cryptographically random session token (64 hex chars). */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/** SHA-256 hash a raw session token for safe DB storage. */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

// ─── Cookie Utilities ────────────────────────────────────────────────────────

/** Set the session cookie with HttpOnly + Secure + SameSite=Lax. */
export async function setSessionCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

/** Clear the session cookie. */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}

/** Read the raw session token from the cookie jar (returns undefined if absent). */
export async function getSessionToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_NAME)?.value;
}
