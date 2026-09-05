import { NextResponse } from "next/server";

import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { deleteProductMedia, uploadProductImage } from "@/lib/server/r2";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Choose an image to upload." }, { status: 400 });
    }

    const media = await uploadProductImage(file);
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to upload the image.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdmin();
    const body = await request.json();
    const keyOrUrl = body?.key || body?.url;

    if (!keyOrUrl) {
      return NextResponse.json({ success: false, error: "Missing key or url to delete." }, { status: 400 });
    }

    const deleted = await deleteProductMedia(keyOrUrl);
    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to delete media.";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
