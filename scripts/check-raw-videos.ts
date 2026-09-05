import { db } from "../lib/db";

async function checkAll() {
  const rows = await db.$queryRawUnsafe(`SELECT "id", "title", "product_id", "is_product_video", "video_url" FROM "creator_videos"`);
  console.log("All DB raw rows:", rows);
  process.exit(0);
}

checkAll();
