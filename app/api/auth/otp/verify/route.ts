import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/server/auth/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : undefined;
    const phone = typeof body.phone === "string" ? body.phone.trim() : undefined;
    const otp = typeof body.otp === "string" ? body.otp.trim() : undefined;

    const identifier = email || phone;

    if (!identifier || !otp) {
      return NextResponse.json(
        { success: false, error: "Email or phone number, along with the 6-digit OTP code, are required" },
        { status: 400 }
      );
    }

    const result = verifyOtp(identifier, otp);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      verified: true,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify OTP";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
