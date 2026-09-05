import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/server/dal/auth";
import {
  createAnnouncement,
  listAnnouncements,
} from "@/lib/server/controllers/announcements.controller";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, data: await listAnnouncements() });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to load announcements.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const announcement = await createAnnouncement(await request.json());
    return NextResponse.json({ success: true, data: announcement }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to create announcement.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
