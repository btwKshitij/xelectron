import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import {
  listVerifiedReviews,
  createVerifiedReview,
} from "@/lib/server/controllers/verified-reviews.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listVerifiedReviews();
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Failed to fetch verified buyer reviews:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch verified buyer reviews" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    if (!body.name || !body.product || !body.text) {
      return NextResponse.json(
        { error: "Customer name, product name, and review text are required." },
        { status: 400 }
      );
    }

    const review = await createVerifiedReview({
      name: body.name.trim(),
      product: body.product.trim(),
      avatar: (body.avatar || "").trim() || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      text: body.text.trim(),
      rating: typeof body.rating === "number" ? body.rating : 5,
      size: body.size === "sm" || body.size === "lg" ? body.size : "md",
      cardSide: body.cardSide === "left" ? "left" : "right",
      desktopTop: body.desktopTop || "50%",
      desktopLeft: body.desktopLeft || "50%",
      mobileTop: body.mobileTop || "50%",
      mobileLeft: body.mobileLeft || "50%",
      sortOrder: typeof body.sortOrder === "number" ? body.sortOrder : 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json(review, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create verified review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create verified review" },
      { status: 500 }
    );
  }
}
