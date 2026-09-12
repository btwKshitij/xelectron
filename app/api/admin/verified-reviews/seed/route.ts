import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import { resetVerifiedReviewsToDefaults } from "@/lib/server/controllers/verified-reviews.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await resetVerifiedReviewsToDefaults();
    try {
      revalidatePath("/");
    } catch {}
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Failed to seed verified reviews:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed default reviews" },
      { status: 500 }
    );
  }
}
