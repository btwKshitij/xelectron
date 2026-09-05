import { NextResponse } from "next/server";
import { logoutUser } from "@/lib/server/controllers/auth.controller";
import {
  getSessionToken,
  hashToken,
  clearSessionCookie,
} from "@/lib/server/auth/session-utils";

// POST /api/auth/logout
export async function POST() {
  try {
    const token = await getSessionToken();

    if (token) {
      const tokenHash = hashToken(token);
      await logoutUser(tokenHash);
    }

    await clearSessionCookie();

    return NextResponse.json({ success: true });
  } catch {
    // Even if DB delete fails, clear the cookie
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  }
}
