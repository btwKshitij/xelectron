import { db } from "@/lib/db";

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function getUserByIdWithPassword(id: string) {
  return db.user.findUnique({
    where: { id },
  });
}

export async function getUserByEmail(email: string) {
  return db.user.findUnique({
    where: { email },
  });
}

export async function getAllUsers() {
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export type CreateUserInput = {
  name: string;
  email: string;
  passwordHash: string;
  role?: "ADMIN" | "CUSTOMER";
  phone?: string;
};

export async function createUser(data: CreateUserInput) {
  return db.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: { name?: string; email?: string; phone?: string; passwordHash?: string }
) {
  return db.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      updatedAt: true,
    },
  });
}

export async function deleteUser(id: string) {
  return db.user.delete({ where: { id } });
}
