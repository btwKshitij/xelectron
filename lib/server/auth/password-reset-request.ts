import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit } from "./rate-limit";

export function limitPasswordReset(request: NextRequest, scope: string, email?: string) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  const checks = [checkRateLimit(`${scope}:ip:${ip}`)];
  if (email) checks.push(checkRateLimit(`${scope}:email:${email}`));
  const blocked = checks.find((check) => !check.success);
  if (blocked) return NextResponse.json(
    { success: false, error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(blocked.retryAfterSeconds) } },
  );
  return null;
}
