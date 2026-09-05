import bcrypt from "bcryptjs";
import * as usersDal from "@/lib/server/dal/users.dal";
import * as sessionsDal from "@/lib/server/dal/sessions.dal";

const SALT_ROUNDS = 12;

// ─── Register ────────────────────────────────────────────────────────────────

export async function registerUser(data: {
  name: string;
  email: string;
  password: string;
  role?: "ADMIN" | "CUSTOMER";
  phone?: string;
}) {
  if (!data.name || !data.email || !data.password) {
    throw new Error("Missing required fields: name, email, password");
  }

  // Check duplicate email
  const existing = await usersDal.getUserByEmail(data.email);
  if (existing) {
    throw new Error("A user with this email already exists");
  }

  // Validate password strength
  if (data.password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  return usersDal.createUser({
    name: data.name,
    email: data.email.toLowerCase().trim(),
    passwordHash,
    role: data.role,
    phone: data.phone,
  });
}

// ─── List ────────────────────────────────────────────────────────────────────

export async function listUsers() {
  return usersDal.getAllUsers();
}

// ─── Get One ─────────────────────────────────────────────────────────────────

export async function getUser(id: string) {
  const user = await usersDal.getUserById(id);
  if (!user) throw new Error("User not found");
  return user;
}

// ─── Update ──────────────────────────────────────────────────────────────────

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; phone?: string }
) {
  const existing = await usersDal.getUserById(id);
  if (!existing) throw new Error("User not found");
  return usersDal.updateUser(id, data);
}

export async function getAdminProfile(userId: string) {
  const user = await usersDal.getUserById(userId);
  if (!user) {
    throw new Error("Admin user not found");
  }
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone || "",
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function updateAdminProfile(userId: string, data: {
  name?: string;
  phone?: string;
  currentPassword?: string;
  newPassword?: string;
}) {
  const user = await usersDal.getUserByIdWithPassword(userId);
  if (!user) {
    throw new Error("Admin profile not found");
  }

  let newPasswordHash: string | undefined;
  if (data.newPassword) {
    if (!data.currentPassword) {
      throw new Error("Current password is required to update your password");
    }
    const isPasswordValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error("Current password is incorrect");
    }
    if (data.newPassword.length < 6) {
      throw new Error("New password must be at least 6 characters");
    }
    newPasswordHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    
    // Revoke all existing sessions on password change
    await sessionsDal.deleteAllUserSessions(userId);
  }

  const updatePayload: { name?: string; phone?: string; passwordHash?: string } = {};
  if (data.name !== undefined) updatePayload.name = data.name;
  if (data.phone !== undefined) updatePayload.phone = data.phone;
  if (newPasswordHash) updatePayload.passwordHash = newPasswordHash;

  const updated = await usersDal.updateUser(user.id, updatePayload);

  return {
    id: updated.id,
    name: updated.name,
    email: updated.email,
    phone: updated.phone || "",
    role: updated.role,
  };
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteUser(id: string) {
  const existing = await usersDal.getUserById(id);
  if (!existing) throw new Error("User not found");
  return usersDal.deleteUser(id);
}
