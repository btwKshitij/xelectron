import { db } from "../lib/db";

async function inspectCreatorVideos() {
  try {
    const allVideos = await db.creatorVideo.findMany({
      select: {
        id: true,
        title: true,
        thumbnailUrl: true,
        videoUrl: true,
        productId: true,
        sortOrder: true,
        isActive: true,
      },
    });
    console.log("All creator videos in DB:", JSON.stringify(allVideos, null, 2));
  } catch (err) {
    console.error("Error inspecting creator videos:", err);
  } finally {
    process.exit(0);
  }
}

inspectCreatorVideos();
