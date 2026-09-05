import { db } from "../lib/db";

/**
 * Fix existing creator_videos data:
 * - Videos created from the Creator Videos dashboard (homepage) should have is_product_video = false
 * - Videos created from the Product Edit form should have is_product_video = true
 * 
 * Since all existing videos currently have is_product_video = false (the bug),
 * we need to identify which ones were actually product videos.
 * 
 * Strategy: The user's original homepage creator video was id 'cmt2l696b000024m9gp5blp58' 
 * (title: "get the product", no video_url). All other videos with a product_id 
 * and a video_url were added from the product edit form.
 */
async function fixVideoFlags() {
  console.log("=== Before fix ===");
  const before: any[] = await db.$queryRawUnsafe(
    `SELECT "id", "title", "product_id", "is_product_video", "video_url" FROM "creator_videos" ORDER BY "created_at" ASC`
  );
  console.table(before);

  // Mark all videos that have a video_url AND product_id as product videos
  // These were added from the product edit form
  const result = await db.$executeRawUnsafe(
    `UPDATE "creator_videos" SET "is_product_video" = true WHERE "product_id" IS NOT NULL AND "video_url" IS NOT NULL AND "video_url" != ''`
  );
  console.log(`Updated ${result} videos to is_product_video=true`);

  // The original homepage creator video (cmt2l696b000024m9gp5blp58) has no video_url 
  // so it stays as is_product_video=false (homepage video).

  console.log("\n=== After fix ===");
  const after: any[] = await db.$queryRawUnsafe(
    `SELECT "id", "title", "product_id", "is_product_video", "video_url" FROM "creator_videos" ORDER BY "created_at" ASC`
  );
  console.table(after);

  process.exit(0);
}

fixVideoFlags();
