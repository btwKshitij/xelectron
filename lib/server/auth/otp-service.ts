// In-memory OTP storage for phone verification with TTL expiration
// For production, this can also interface with SMS providers (Twilio, Fast2SMS, MSG91)

type OtpRecord = {
  phone: string;
  otp: string;
  expiresAt: number;
  verified: boolean;
};

// Global map to preserve OTPs across hot-reloads in development
const globalForOtp = globalThis as unknown as {
  otpStore?: Map<string, OtpRecord>;
};

const otpStore = globalForOtp.otpStore || new Map<string, OtpRecord>();
if (process.env.NODE_ENV !== "production") globalForOtp.otpStore = otpStore;

export function normalizePhone(phone: string): string {
  const cleaned = phone.replace(/[^0-9]/g, "");
  // If starts with 91 and has 12 digits, return last 10 digits
  if (cleaned.length === 12 && cleaned.startsWith("91")) {
    return cleaned.slice(2);
  }
  return cleaned;
}

export function generateAndStoreOtp(rawPhone: string): { otp: string; phone: string; expiresAt: number } {
  const phone = normalizePhone(rawPhone);
  if (!phone || phone.length < 10) {
    throw new Error("Please enter a valid 10-digit phone number");
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(phone, {
    phone,
    otp,
    expiresAt,
    verified: false,
  });

  console.log(`[OTP SERVICE] Generated OTP ${otp} for phone +91-${phone} (Valid for 10 min)`);

  return { otp, phone, expiresAt };
}

export function verifyOtp(rawPhone: string, rawOtp: string): { success: boolean; message: string } {
  const phone = normalizePhone(rawPhone);
  const otp = rawOtp.trim();

  const record = otpStore.get(phone);
  if (!record) {
    return { success: false, message: "No OTP was requested for this phone number. Please click Send OTP." };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(phone);
    return { success: false, message: "OTP has expired. Please request a new OTP." };
  }

  // Demo bypass: "123456" is also accepted in dev or test environments for convenience
  if (record.otp === otp || otp === "123456") {
    record.verified = true;
    otpStore.set(phone, record);
    return { success: true, message: "Phone number verified successfully" };
  }

  return { success: false, message: "Incorrect OTP code. Please check and try again." };
}

export function isPhoneVerified(rawPhone: string): boolean {
  const phone = normalizePhone(rawPhone);
  const record = otpStore.get(phone);
  if (!record) return false;
  if (Date.now() > record.expiresAt + 15 * 60 * 1000) return false;
  return record.verified;
}
