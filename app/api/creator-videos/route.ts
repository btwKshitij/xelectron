import { NextResponse } from "next/server";
import { listActiveCreatorVideos } from "@/lib/server/controllers/creator-videos.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const videos = await listActiveCreatorVideos();
    return NextResponse.json(videos);
  } catch (error: any) {
    console.error("Failed to list active creator videos:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch creator videos" }, { status: 500 });
  }
}
