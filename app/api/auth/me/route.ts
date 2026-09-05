import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/server/dal/auth";

// GET /api/auth/me
export async function GET() {
  const user = await getCurrentUser();
  return NextResponse.json({ user });
}
