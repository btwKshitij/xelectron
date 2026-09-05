import { NextResponse } from "next/server";

import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import { uploadProductImage } from "@/lib/server/r2";

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
