import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset, RESET_MESSAGE, AccountNotRegisteredError } from "@/lib/server/auth/password-reset";
import { limitPasswordReset } from "@/lib/server/auth/password-reset-request";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(254) });
export async function POST(request: NextRequest) {
  try {
    const limited = limitPasswordReset(request, "forgot-password");
    if (limited) return limited;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: "Enter a valid email address." }, { status: 400 });
    const emailLimited = limitPasswordReset(request, "forgot-password-email", parsed.data.email);
    if (emailLimited) return emailLimited;
    await requestPasswordReset(parsed.data.email, request.nextUrl.origin);
    return NextResponse.json({ success: true, message: RESET_MESSAGE });
  } catch (error) {
    if (error instanceof AccountNotRegisteredError) {
      return NextResponse.json({ success: false, code: "ACCOUNT_NOT_REGISTERED", error: error.message }, { status: 404 });
    }
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
    console.error("Password recovery unavailable:", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json({ success: false, error: "We could not send a reset email right now. Please try again in a few minutes or contact support." }, { status: 503 });
  }
}
