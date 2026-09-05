import { NextRequest, NextResponse } from "next/server";
import * as reviewsController from "@/lib/server/controllers/reviews.controller";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId") || undefined;
    const reviews = await reviewsController.listReviews({ productId });
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch reviews" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.productId) {
      return NextResponse.json(
        { success: false, error: "Product ID is required" },
        { status: 400 }
      );
    }
    const review = await reviewsController.createProductReview(body.productId, {
      author: body.author,
      rating: body.rating,
      content: body.content,
      title: body.title,
      image: body.image,
      imageCount: body.imageCount,
      verified: body.verified,
    });
    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit review" },
      { status: 500 }
    );
  }
}
