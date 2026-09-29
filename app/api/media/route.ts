import { NextResponse } from "next/server";

import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { deleteProductMedia, uploadProductImage } from "@/lib/server/r2";

export const runtime = "nodejs";
export const maxDuration = 300;

export async function POST(request: Request) {
  try {
    await requireAdmin();

    const contentType = request.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await request.json();
      if (body?._method === "DELETE") {
        const keyOrUrl = body?.key || body?.url;
        if (!keyOrUrl) {
          return NextResponse.json({ success: false, error: "Missing key or url to delete." }, { status: 400 });
        }
        const deleted = await deleteProductMedia(keyOrUrl);
        return NextResponse.json({ success: true, deleted });
      }
    }

    const formData = await request.formData();
    const methodField = formData.get("_method");
    if (methodField === "DELETE") {
      const keyOrUrl = (formData.get("key") || formData.get("url")) as string;
      if (!keyOrUrl) {
        return NextResponse.json({ success: false, error: "Missing key or url to delete." }, { status: 400 });
      }
      const deleted = await deleteProductMedia(keyOrUrl);
      return NextResponse.json({ success: true, deleted });
    }

    const file = formData.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ success: false, error: "Choose an image or video to upload." }, { status: 400 });
    }

    const media = await uploadProductImage(file);
    return NextResponse.json({ success: true, data: media }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to upload the media file.";
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
