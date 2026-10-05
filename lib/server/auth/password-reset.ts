import "server-only";
import { randomBytes, createHash } from "node:crypto";
import bcrypt from "bcryptjs";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/server/mail";

export const RESET_MESSAGE = "Your reset email has been accepted for sending. Check your inbox and spam folder.";
export class AccountNotRegisteredError extends Error {
  constructor() {
    super("No account is registered with this email. Please create an account first.");
    this.name = "AccountNotRegisteredError";
  }
}
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
  const user = await db.user.findFirst({ where: { email: { equals: email.trim().toLowerCase(), mode: "insensitive" } } });
  if (!user) throw new AccountNotRegisteredError();
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
    html: `<div style="background:#f3f7fc;padding:32px 16px;font-family:Arial,sans-serif;color:#10243a"><div style="max-width:520px;margin:auto;background:#fff;border:1px solid #dce6f0;border-radius:16px;padding:32px"><p style="font-size:24px;font-weight:700;margin:0 0 32px"><span style="color:#0a7ae6">X</span>Electron</p><h1 style="font-size:26px">Reset your password</h1><p style="line-height:1.7;color:#526277">Use the button below to choose a new password for your XElectron account.</p><p style="margin:28px 0"><a href="${link.toString().replace(/&/g, "&amp;").replace(/"/g, "&quot;")}" style="display:inline-block;background:#0a7ae6;color:white;padding:15px 24px;border-radius:8px;text-decoration:none;font-weight:bold">Reset password</a></p><p style="font-size:14px;line-height:1.7;color:#526277">This link expires in 30 minutes and can be used once. If you did not request it, you can safely ignore this email.</p><p style="font-size:12px;line-height:1.6;color:#526277;word-break:break-all">Button not working? Copy this link into your browser:<br>${link.toString().replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;")}</p></div></div>`,
    text: `Reset your XElectron password using this link:\n\n${link.toString()}\n\nThis link expires in 30 minutes and can only be used once. If you did not request a password reset, you can ignore this email.`,
  });
  if (!result.success) {
    await db.passwordResetToken.deleteMany({ where: { tokenHash } });
    // Never report success when SMTP did not accept the reset message.
    throw new Error("Password reset email delivery failed");
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
