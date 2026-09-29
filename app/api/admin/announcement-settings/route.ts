import { NextRequest, NextResponse } from "next/server";

import { AuthError, requireAdmin } from "@/lib/server/dal/auth";
import {
  getAnnouncementSettings,
  setAnnouncementTickerEnabled,
} from "@/lib/server/controllers/announcements.controller";

export async function GET() {
  try {
    await requireAdmin();
    return NextResponse.json({ success: true, data: await getAnnouncementSettings() });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to load ticker settings.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

import { revalidatePath } from "next/cache";

export async function PATCH(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const settings = await setAnnouncementTickerEnabled(body.tickerEnabled);
    revalidatePath("/");
    revalidatePath("/dashboard/announcements");
    revalidatePath("/api/announcements");
    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to update ticker settings.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

// POST handler (WAF workaround — dispatches update via _method field)
export async function POST(request: NextRequest) {
  const clone = request.clone();
  try {
    const body = await clone.json();
    if (body?._method === "PATCH" || body?._method === "PUT") {
      return PATCH(request);
    }
  } catch {}
  return PATCH(request);
}

