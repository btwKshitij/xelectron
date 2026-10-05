import "server-only";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/server/mail";

export const RESET_MESSAGE = "If an account exists for this email, you will receive a password reset link. Check your inbox and spam folder.";
export const INVALID_RESET = "This reset link is invalid or has expired. Please request a new link.";
const hash = (token: string) => createHash("sha256").update(token).digest("hex");

export function getResetOrigin(developmentOrigin?: string) {
  const configured = process.env.NEXT_PUBLIC_APP_URL || process.env.NEXTAUTH_URL;
  let fallback = "https://xelectron.com";
  if (process.env.NODE_ENV !== "production") {
    const local = new URL(developmentOrigin || "http://localhost:3000");
    if (["localhost", "127.0.0.1", "[::1]"].includes(local.hostname)) fallback = local.origin;
  }
  const url = new URL(configured || fallback);
  if (url.protocol !== "https:" && !(process.env.NODE_ENV !== "production" && url.protocol === "http:")) {
    throw new Error("Password recovery requires an HTTPS app URL.");
  }
  return url.origin;
}

export async function requestPasswordReset(email: string, developmentOrigin?: string) {
  const origin = getResetOrigin(developmentOrigin);
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return;
  const token = randomBytes(32).toString("hex");
  const tokenHash = hash(token);
  await db.passwordResetToken.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.passwordResetToken.create({ data: {
    tokenHash, userId: user.id, passwordHash: user.passwordHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  } });
  const link = new URL("/reset-password", origin);
  link.searchParams.set("token", token);
  const result = await sendEmail({
    to: user.email,
    subject: "Reset your XElectron password",
    text: `Reset your XElectron password using this link:\n\n${link.toString()}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a password reset, you can ignore this email.`,
  });
  if (!result.success) {
    await db.passwordResetToken.deleteMany({ where: { tokenHash } });
    // Do not reveal account existence through different public responses.
    console.error("Password reset email delivery failed");
  }
}

export async function resetPassword(token: string, password: string) {
  const tokenHash = hash(token);
  const reset = await db.passwordResetToken.findUnique({ where: { tokenHash } });
  if (!reset || reset.expiresAt <= new Date()) throw new Error(INVALID_RESET);
  const passwordHash = await bcrypt.hash(password, 12);
  await db.$transaction(async (tx: Prisma.TransactionClient) => {
    // Claim the token atomically; concurrent submissions cannot reuse it.
    const claimed = await tx.passwordResetToken.deleteMany({
      where: { tokenHash, expiresAt: { gt: new Date() } },
    });
    if (claimed.count !== 1) throw new Error(INVALID_RESET);
    const changed = await tx.user.updateMany({
      where: { id: reset.userId, passwordHash: reset.passwordHash },
      data: { passwordHash },
    });
    if (changed.count !== 1) throw new Error(INVALID_RESET);
    await tx.passwordResetToken.deleteMany({ where: { userId: reset.userId } });
    await tx.session.deleteMany({ where: { userId: reset.userId } });
  });
}
