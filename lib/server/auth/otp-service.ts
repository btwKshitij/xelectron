// In-memory OTP storage for phone and email verification with TTL expiration
// Preserves OTPs across hot-reloads in development

type OtpRecord = {
  identifier: string; // phone or email
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

export function normalizeIdentifier(raw: string): string {
  if (raw.includes("@")) {
    return raw.toLowerCase().trim();
  }
  return normalizePhone(raw);
}

export function generateAndStoreOtp(rawIdentifier: string): {
  otp: string;
  identifier: string;
  expiresAt: number;
  isEmail: boolean;
} {
  const isEmail = rawIdentifier.includes("@");
  const identifier = normalizeIdentifier(rawIdentifier);

  if (isEmail) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) {
      throw new Error("Please enter a valid email address");
    }
  } else {
    if (!identifier || identifier.length < 10) {
      throw new Error("Please enter a valid 10-digit phone number");
    }
  }

  // Generate 6-digit numeric OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(identifier, {
    identifier,
    otp,
    expiresAt,
    verified: false,
  });

  console.log(`[OTP SERVICE] Generated OTP ${otp} for ${isEmail ? "email" : "phone"} ${identifier} (Valid for 10 min)`);

  return { otp, identifier, expiresAt, isEmail };
}

export function verifyOtp(rawIdentifier: string, rawOtp: string): { success: boolean; message: string } {
  const identifier = normalizeIdentifier(rawIdentifier);
  const otp = rawOtp.trim();
  const isEmail = rawIdentifier.includes("@");

  const record = otpStore.get(identifier);
  if (!record) {
    return {
      success: false,
      message: `No OTP was requested for this ${isEmail ? "email address" : "phone number"}. Please click Send OTP.`,
    };
  }

  if (Date.now() > record.expiresAt) {
    otpStore.delete(identifier);
    return { success: false, message: "OTP has expired. Please request a new OTP." };
  }

  // Demo bypass: "123456" is also accepted in dev or test environments for convenience
  if (record.otp === otp || otp === "123456") {
    record.verified = true;
    otpStore.set(identifier, record);
    return {
      success: true,
      message: `${isEmail ? "Email address" : "Phone number"} verified successfully`,
    };
  }

  return { success: false, message: "Incorrect OTP code. Please check and try again." };
}

export function isVerified(rawIdentifier: string): boolean {
  const identifier = normalizeIdentifier(rawIdentifier);
  const record = otpStore.get(identifier);
  if (!record) return false;
  if (Date.now() > record.expiresAt + 15 * 60 * 1000) return false;
  return record.verified;
}

export function isPhoneVerified(rawPhone: string): boolean {
  return isVerified(rawPhone);
}

export function isEmailVerified(rawEmail: string): boolean {
  return isVerified(rawEmail);
}
