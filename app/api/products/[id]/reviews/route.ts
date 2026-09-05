import { NextRequest, NextResponse } from "next/server";
import * as reviewsController from "@/lib/server/controllers/reviews.controller";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const reviews = await reviewsController.getProductReviews(id);
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product reviews" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const review = await reviewsController.createProductReview(id, {
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
      { success: false, error: error.message || "Failed to create review" },
      { status: 500 }
    );
  }
}
