import { NextResponse } from "next/server";
import { listActiveVerifiedReviews } from "@/lib/server/controllers/verified-reviews.controller";

export const revalidate = 60;

export async function GET() {
  try {
    const reviews = await listActiveVerifiedReviews();
    return NextResponse.json(reviews);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch verified reviews" },
      { status: 500 }
    );
  }
}
