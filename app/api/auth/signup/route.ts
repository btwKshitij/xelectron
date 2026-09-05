import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/server/controllers/auth.controller";
import { signupSchema } from "@/lib/server/validators";
import { setSessionCookie } from "@/lib/server/auth/session-utils";

// POST /api/auth/signup
export async function POST(request: NextRequest) {
  try {
    // 1. Validate input with Zod
    const body = await request.json();
    const parsed = signupSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.issues[0]?.message || "Invalid input";
      return NextResponse.json(
        { success: false, error: firstError },
        { status: 400 }
      );
    }

    // 2. Register user (always CUSTOMER) + create session
    const { token, redirectTo } = await registerUser(
      parsed.data.name,
      parsed.data.email,
      parsed.data.password,
      parsed.data.phone,
      parsed.data.otp
    );

    // 3. Set HttpOnly session cookie
    await setSessionCookie(token);

    // 4. Return redirect target
    return NextResponse.json(
      { success: true, redirectTo },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Internal server error";
    const status =
      message.includes("exists") || message.includes("required") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
