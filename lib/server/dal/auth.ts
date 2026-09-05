import "server-only";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { getSessionToken, hashToken } from "@/lib/server/auth/session-utils";
import * as sessionsDal from "@/lib/server/dal/sessions.dal";

// ─── Types ───────────────────────────────────────────────────────────────────

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  phone?: string | null;
};

// ─── Errors ──────────────────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(public message: string, public status: number) {
    super(message);
    this.name = "AuthError";
  }
}

// ─── Core Session Verification ───────────────────────────────────────────────

/**
 * Verify the current request's session cookie.
 * Returns the authenticated user or `null` if invalid/expired/missing.
 */
export async function verifySession(): Promise<SessionUser | null> {
  const token = await getSessionToken();
  if (!token) return null;

  const tokenHash = hashToken(token);
  const session = await sessionsDal.getSessionByTokenHash(tokenHash);

  if (!session) return null;

  // Check expiry
  if (session.expiresAt < new Date()) {
    try {
      // Clean up expired session best-effort
      await sessionsDal.deleteSession(tokenHash);
    } catch (error) {
      console.error("Failed to clean expired session:", error);
    }
    return null;
  }

  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    role: session.user.role as "ADMIN" | "CUSTOMER",
    phone: session.user.phone,
  };
}

// ─── Authorization Guards (API Routes) ───────────────────────────────────────

/**
 * Require the user to be authenticated.
 * Throws AuthError (401) if no valid session. For API routes.
 */
export async function requireAuth(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) {
    throw new AuthError("Unauthorized", 401);
  }
  return user;
}

/**
 * Require the user to be an authenticated ADMIN.
 * Throws AuthError (401) if no session, or (403) if wrong role. For API routes.
 */
export async function requireAdmin(): Promise<SessionUser> {
  const user = await verifySession();
  if (!user) {
    throw new AuthError("Unauthorized", 401);
  }
  if (user.role !== "ADMIN") {
    throw new AuthError("Forbidden: Admin access required", 403);
  }
  return user;
}

/**
 * Soft version: returns the current user or null.
 * Does NOT redirect or throw. Useful for client-facing endpoints like /api/auth/me.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  return verifySession();
}

// ─── Utilities ───────────────────────────────────────────────────────────────

export async function getUserCount() {
  return db.user.count();
}
