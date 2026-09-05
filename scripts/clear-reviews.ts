import "dotenv/config";
import { db } from "../lib/db";

async function clearReviews() {
  try {
    const deleted = await db.productReview.deleteMany({});
    console.log("Deleted reviews count:", deleted.count);
  } catch (err) {
    console.error("Error clearing reviews:", err);
  } finally {
    process.exit(0);
  }
}

clearReviews();
