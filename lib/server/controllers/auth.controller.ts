import bcrypt from "bcryptjs";
import * as usersDal from "@/lib/server/dal/users.dal";
import * as sessionsDal from "@/lib/server/dal/sessions.dal";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("Invalid email or password");
    this.name = "InvalidCredentialsError";
  }
}

const SALT_ROUNDS = 12;

// ─── Login ───────────────────────────────────────────────────────────────────

/**
 * Verify credentials, create a DB session, and return the raw token + redirect.
 * Throws on invalid credentials.
 */
export async function loginUser(email: string, password: string) {
  const cleanEmail = email.toLowerCase().trim();
  const user = await usersDal.getUserByEmail(cleanEmail);
  if (!user) {
    throw new InvalidCredentialsError();
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new InvalidCredentialsError();
  }

  // Link any unlinked past orders placed with this email (or phone) to this user
  try {
    const { db } = await import("@/lib/db");
    const cleanPhone = user.phone?.replace(/[^0-9]/g, "");
    await db.order.updateMany({
      where: {
        userId: null,
        OR: [
          { customerEmail: { equals: cleanEmail, mode: "insensitive" } },
          ...(cleanPhone && cleanPhone.length >= 10 ? [{ customerPhone: { contains: cleanPhone } }] : []),
        ],
      },
      data: {
        userId: user.id,
      },
    });
  } catch (err) {
    console.warn("Could not link orders on login:", err);
  }

  // Create DB session
  const { token } = await sessionsDal.createSession(user.id);

  // Compute redirect server-side (frontend never sees the role)
  const redirectTo = user.role === "ADMIN" ? "/dashboard" : "/orders";

  return {
    token,
    redirectTo,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
  };
}

// ─── Register ────────────────────────────────────────────────────────────────

import { isPhoneVerified, verifyOtp, normalizePhone } from "@/lib/server/auth/otp-service";

/**
 * Create a new CUSTOMER user, create a DB session, return token + redirect.
 * Role is always CUSTOMER — never trust client-provided role.
 */
export async function registerUser(
  name: string,
  email: string,
  password: string,
  phone?: string,
  otp?: string
) {
  const cleanEmail = email.toLowerCase().trim();
  const existing = await usersDal.getUserByEmail(cleanEmail);
  if (existing) {
    throw new Error("An account with this email address already exists");
  }

  const cleanPhone = phone ? normalizePhone(phone) : undefined;
  if (cleanPhone) {
    // If an OTP was submitted with the registration form, verify it now
    if (otp) {
      const verification = verifyOtp(cleanPhone, otp);
      if (!verification.success) {
        throw new Error(verification.message);
      }
    } else if (!isPhoneVerified(cleanPhone)) {
      // If no OTP code was sent in the signup payload, verify if the phone was pre-verified
      // For development/demo convenience, allow signup if OTP verification was performed
      // If not, ask user to verify phone
      throw new Error("Please verify your phone number with the OTP before creating your account");
    }
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newUser = await usersDal.createUser({
    name: name.trim(),
    email: cleanEmail,
    passwordHash,
    phone: cleanPhone || null as any,
    role: "CUSTOMER", // Always CUSTOMER — admin is provisioned separately
  });

  // Automatically link all past orders placed with this email (or phone) to this new user account!
  try {
    const { db } = await import("@/lib/db");
    await db.order.updateMany({
      where: {
        userId: null,
        OR: [
          { customerEmail: { equals: cleanEmail, mode: "insensitive" } },
          ...(cleanPhone && cleanPhone.length >= 10 ? [{ customerPhone: { contains: cleanPhone } }] : []),
        ],
      },
      data: {
        userId: newUser.id,
      },
    });
  } catch (err) {
    console.warn("Could not link past orders on registration:", err);
  }

  // Create DB session
  const { token } = await sessionsDal.createSession(newUser.id);

  return {
    token,
    redirectTo: "/orders",
    user: {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      phone: newUser.phone,
    },
  };
}

// ─── Logout ──────────────────────────────────────────────────────────────────

/**
 * Delete the session identified by the raw token's hash.
 */
export async function logoutUser(tokenHash: string) {
  await sessionsDal.deleteSession(tokenHash);
}
