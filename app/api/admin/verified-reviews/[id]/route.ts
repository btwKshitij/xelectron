import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import {
  getVerifiedReview,
  updateVerifiedReview,
  deleteVerifiedReview,
} from "@/lib/server/controllers/verified-reviews.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  try {
    const review = await getVerifiedReview(id);
    if (!review) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }
    return NextResponse.json(review);
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch review" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  try {
    const body = await request.json();
    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.product !== undefined) updateData.product = body.product.trim();
    if (body.avatar !== undefined) updateData.avatar = body.avatar.trim();
    if (body.text !== undefined) updateData.text = body.text.trim();
    if (body.rating !== undefined) updateData.rating = Number(body.rating);
    if (body.size !== undefined) updateData.size = body.size;
    if (body.cardSide !== undefined) updateData.cardSide = body.cardSide;
    if (body.desktopTop !== undefined) updateData.desktopTop = body.desktopTop;
    if (body.desktopLeft !== undefined) updateData.desktopLeft = body.desktopLeft;
    if (body.mobileTop !== undefined) updateData.mobileTop = body.mobileTop;
    if (body.mobileLeft !== undefined) updateData.mobileLeft = body.mobileLeft;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder);
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await updateVerifiedReview(id, updateData);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update verified review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update review" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  return PUT(request, props);
}

export async function DELETE(
  _request: Request,
  props: { params: Promise<{ id: string }> }
) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await props.params;
  try {
    await deleteVerifiedReview(id);

    try {
      revalidatePath("/");
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete verified review:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete review" },
      { status: 500 }
    );
  }
}
