import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireAdmin } from "@/lib/server/dal/auth";
import {
  deleteAnnouncement,
  updateAnnouncement,
} from "@/lib/server/controllers/announcements.controller";

import { revalidatePath } from "next/cache";

type RouteParams = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const announcement = await updateAnnouncement(id, await request.json());
    revalidatePath("/");
    revalidatePath("/dashboard/announcements");
    revalidatePath("/api/announcements");
    return NextResponse.json({ success: true, data: announcement });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to update announcement.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await deleteAnnouncement(id);
    revalidatePath("/");
    revalidatePath("/dashboard/announcements");
    revalidatePath("/api/announcements");
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to delete announcement.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest, context: RouteParams) {
  const clone = request.clone();
  try {
    const body = await clone.json();
    if (body?._method === "DELETE" || body?.action === "delete") {
      return DELETE(request, context);
    }
  } catch {}
  return PATCH(request, context);
}
