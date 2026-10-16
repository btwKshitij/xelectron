import { randomInt } from "node:crypto";

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
    if (!/^[6-9]\d{9}$/.test(identifier)) {
      throw new Error("Please enter a valid 10-digit phone number");
    }
  }

  // Generate 6-digit numeric OTP
  const otp = randomInt(100000, 1000000).toString();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes validity

  otpStore.set(identifier, {
    identifier,
    otp,
    expiresAt,
    verified: false,
  });


  return { otp, identifier, expiresAt, isEmail };
}

export function invalidateOtp(rawIdentifier: string, otp: string): void {
  const identifier = normalizeIdentifier(rawIdentifier);
  if (otpStore.get(identifier)?.otp === otp) otpStore.delete(identifier);
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

  if (record.otp === otp) {
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
