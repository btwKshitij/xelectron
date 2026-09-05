import { db } from "../lib/db";

async function cleanDummyVideos() {
  try {
    const deleted = await db.creatorVideo.deleteMany({
      where: {
        OR: [
          { thumbnailUrl: "/creator-earbuds.png" },
          { thumbnailUrl: "/creator-dashcam.png" },
          { thumbnailUrl: "/creator-smartwatch.png" },
          { title: "Earbuds Unboxing & Review" },
          { title: "Night Drive Dashcam Test" },
          { title: "Smartwatch Daily Life Test" },
          { title: "Cozy Cinema Projector Night", productId: null },
          { videoUrl: null, productId: null },
        ],
      },
    });
    console.log("Deleted dummy creator videos:", deleted.count);
  } catch (err) {
    console.error("Error cleaning dummy videos:", err);
  } finally {
    process.exit(0);
  }
}

cleanDummyVideos();
