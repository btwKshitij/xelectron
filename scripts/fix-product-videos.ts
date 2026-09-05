import { db } from "../lib/db";

async function fixProductCreatorVideos() {
  try {
    // Delete the extra duplicate video that came from creator video manager
    await db.creatorVideo.deleteMany({
      where: {
        id: "cmt744ywr0000d4m9ez3ruuz7",
      },
    });

    // Mark the 2 product-specific videos with isProductVideo = true
    await db.creatorVideo.updateMany({
      where: {
        productId: "cmsmwuhne000058m9cnhom5s0",
      },
      data: {
        isProductVideo: true,
      },
    });

    const finalVideos = await db.creatorVideo.findMany({
      select: {
        id: true,
        title: true,
        productId: true,
        isProductVideo: true,
        videoUrl: true,
      },
    });
    console.log("Updated creator videos in DB:", JSON.stringify(finalVideos, null, 2));
  } catch (err) {
    console.error("Error fixing product creator videos:", err);
  } finally {
    process.exit(0);
  }
}

fixProductCreatorVideos();
