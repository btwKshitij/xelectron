import { NextRequest, NextResponse } from "next/server";
import { getAdminProfile, updateAdminProfile } from "@/lib/server/controllers/users.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

// GET /api/admin/profile
export async function GET(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    // Use session user email instead of query string
    const profile = await getAdminProfile(admin.id);
    return NextResponse.json({ success: true, data: profile });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to fetch profile";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/admin/profile
export async function PUT(request: NextRequest) {
  try {
    const admin = await requireAdmin();
    const body = await request.json();
    const updated = await updateAdminProfile(admin.id, body);
    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Failed to update profile";
    const status = message.includes("incorrect") || message.includes("required") || message.includes("least") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
