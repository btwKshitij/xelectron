import { NextRequest, NextResponse } from "next/server";
import { generateAndStoreOtp } from "@/lib/server/auth/otp-service";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const phone = body.phone;

    if (!phone || typeof phone !== "string") {
      return NextResponse.json(
        { success: false, error: "Phone number is required" },
        { status: 400 }
      );
    }

    const { otp, phone: cleanPhone } = generateAndStoreOtp(phone);

    // 1. Dispatch SMS to mobile via SMS Alert India (smsalert.co.in)
    import("@/lib/server/sms/smsalert").then(({ sendOtpSms }) => {
      sendOtpSms(cleanPhone, otp).catch((err) =>
        console.warn("[OTP] SMS Alert delivery warning:", err)
      );
    });

    // 2. Dispatch Email OTP if email was provided
    const email = body.email;
    if (email) {
      import("@/lib/server/mail").then(({ sendEmail }) => {
        sendEmail({
          to: email,
          subject: `Your XElectron Verification Code: ${otp}`,
          html: `<div style="font-family: sans-serif; padding: 20px; color: #1e293b;">
            <h2>XElectron Verification Code</h2>
            <p>Your one-time code for order confirmation is:</p>
            <h1 style="color: #0a7ae6; letter-spacing: 4px;">${otp}</h1>
            <p style="color: #64748b; font-size: 13px;">This code will expire in 10 minutes. Do not share this code with anyone.</p>
          </div>`,
        }).catch((e) => console.warn("Could not email OTP:", e));
      });
    }

    return NextResponse.json({
      success: true,
      message: `OTP sent successfully to +91 ${cleanPhone}`,
      otp: process.env.NODE_ENV !== "production" ? otp : undefined,
      phone: cleanPhone,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send OTP";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
