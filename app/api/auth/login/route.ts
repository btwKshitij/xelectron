import { NextRequest, NextResponse } from "next/server";
import { loginUser, InvalidCredentialsError } from "@/lib/server/controllers/auth.controller";
import { loginSchema } from "@/lib/server/validators";
import { setSessionCookie } from "@/lib/server/auth/session-utils";
import { checkRateLimit } from "@/lib/server/auth/rate-limit";

// POST /api/auth/login
export async function POST(request: NextRequest) {
  try {
    // 1. Rate limit by IP
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const rateCheck = checkRateLimit(ip);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many login attempts. Try again in ${rateCheck.retryAfterSeconds} seconds.`,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.retryAfterSeconds),
          },
        }
      );
    }

    // 2. Validate input with Zod
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    // 3. Authenticate + create session
    const { token, redirectTo } = await loginUser(
      parsed.data.email,
      parsed.data.password
    );

    // 4. Set HttpOnly session cookie
    await setSessionCookie(token);

    // 5. Return redirect target (not the role)
    return NextResponse.json({ success: true, redirectTo });
  } catch (error) {
    if (error instanceof InvalidCredentialsError) {
      return NextResponse.json(
        { success: false, error: "Invalid email or password" },
        { status: 401 }
      );
    }
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { success: false, error: "Malformed JSON payload" },
        { status: 400 }
      );
    }
    
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, error: "Unable to sign in" },
      { status: 500 }
    );
  }
}
