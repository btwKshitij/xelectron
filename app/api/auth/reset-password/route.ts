import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { resetPassword, INVALID_RESET } from "@/lib/server/auth/password-reset";
import { limitPasswordReset } from "@/lib/server/auth/password-reset-request";
import { clearSessionCookie } from "@/lib/server/auth/session-utils";

const schema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/),
  password: z.string().min(8, "Use at least 8 characters.").max(72, "Use at most 72 characters.")
    .refine((value) => Buffer.byteLength(value, "utf8") <= 72, "Password must be at most 72 bytes."),
});
export async function POST(request: NextRequest) {
  try {
    const limited = limitPasswordReset(request, "reset-password");
    if (limited) return limited;
    const parsed = schema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ success: false, error: parsed.error.issues[0]?.path[0] === "token" ? INVALID_RESET : parsed.error.issues[0]?.message }, { status: 400 });
    await resetPassword(parsed.data.token, parsed.data.password);
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof SyntaxError || (error instanceof Error && error.message === INVALID_RESET)) {
      return NextResponse.json({ success: false, error: INVALID_RESET }, { status: 400 });
    }
    console.error("Password reset failed");
    return NextResponse.json({ success: false, error: "Unable to reset your password. Please try again." }, { status: 503 });
  }
}
