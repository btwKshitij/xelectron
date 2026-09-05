import { db } from "@/lib/db";
import {
  generateSessionToken,
  hashToken,
} from "@/lib/server/auth/session-utils";
import { SESSION_MAX_AGE_SECONDS } from "@/lib/server/auth/constants";

// ─── Create ──────────────────────────────────────────────────────────────────

/**
 * Create a new session for the given user.
 * Returns the raw token (to be sent as cookie) and the session record.
 */
export async function createSession(userId: string) {
  const token = generateSessionToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const session = await db.session.create({
    data: {
      tokenHash,
      userId,
      expiresAt,
    },
  });

  return { token, session };
}

// ─── Read ────────────────────────────────────────────────────────────────────

/** Look up a session by its hashed token. Returns null if not found. */
export async function getSessionByTokenHash(tokenHash: string) {
  return db.session.findUnique({
    where: { tokenHash },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
        },
      },
    },
  });
}

// ─── Delete ──────────────────────────────────────────────────────────────────

/** Delete a single session by its hashed token. */
export async function deleteSession(tokenHash: string) {
  return db.session.deleteMany({ where: { tokenHash } });
}

/** Delete ALL sessions for a user (e.g. logout-everywhere, password change). */
export async function deleteAllUserSessions(userId: string) {
  return db.session.deleteMany({ where: { userId } });
}

/** Delete all expired sessions (housekeeping). */
export async function deleteExpiredSessions() {
  return db.session.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
}
