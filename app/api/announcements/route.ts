import { NextResponse } from "next/server";
import {
  getAnnouncementSettings,
  listAnnouncements,
} from "@/lib/server/controllers/announcements.controller";

export const dynamic = "force-dynamic";

// Public, active messages only. Admin mutations are kept under /api/admin.
export async function GET() {
  try {
    const [announcements, settings] = await Promise.all([
      listAnnouncements(true),
      getAnnouncementSettings(),
    ]);
    return NextResponse.json({ success: true, data: announcements, tickerEnabled: settings.tickerEnabled }, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to load announcements.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
