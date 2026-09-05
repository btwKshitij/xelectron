import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import { listCreatorVideos, createCreatorVideo } from "@/lib/server/controllers/creator-videos.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const videos = await listCreatorVideos();
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error("Failed to list creator videos:", error);
    return NextResponse.json({ error: error?.message || "Failed to list creator videos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.thumbnailUrl) {
      return NextResponse.json({ error: "Thumbnail image URL is required" }, { status: 400 });
    }

    const video = await createCreatorVideo({
      title: body.title,
      thumbnailUrl: body.thumbnailUrl,
      videoUrl: body.videoUrl,
      productId: body.productId || undefined,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    revalidatePath("/");
    revalidatePath("/dashboard/creator-videos");
    return NextResponse.json(video, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create creator video:", error);
    return NextResponse.json({ error: error?.message || "Failed to create creator video" }, { status: 500 });
  }
}
