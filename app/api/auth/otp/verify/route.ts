import { NextRequest, NextResponse } from "next/server";
import { verifyOtp } from "@/lib/server/auth/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone, otp } = body;

    if (!phone || !otp) {
      return NextResponse.json(
        { success: false, error: "Phone number and 6-digit OTP are required" },
        { status: 400 }
      );
    }

    const result = verifyOtp(phone, otp);

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
