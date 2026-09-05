import { NextResponse } from "next/server";
import { listActiveCreatorVideos } from "@/lib/server/controllers/creator-videos.controller";

export const revalidate = 60;

export async function GET() {
  try {
    const videos = await listActiveCreatorVideos();
    return NextResponse.json(videos, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error: any) {
    console.error("Failed to list active creator videos:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch creator videos" }, { status: 500 });
  }
}
