import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requestPasswordReset, RESET_MESSAGE } from "@/lib/server/auth/password-reset";
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
    if (error instanceof SyntaxError) return NextResponse.json({ success: false, error: "Invalid request." }, { status: 400 });
    console.error("Password recovery unavailable");
    return NextResponse.json({ success: false, error: "Password recovery is temporarily unavailable. Please try again later." }, { status: 503 });
  }
}
