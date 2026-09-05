import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import { updateCreatorVideo, deleteCreatorVideo } from "@/lib/server/controllers/creator-videos.controller";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    const body = await request.json();
    const updated = await updateCreatorVideo(id, {
      ...(body.title !== undefined && { title: body.title }),
      ...(body.thumbnailUrl !== undefined && { thumbnailUrl: body.thumbnailUrl }),
      ...(body.videoUrl !== undefined && { videoUrl: body.videoUrl }),
      ...(body.productId !== undefined && { productId: body.productId }),
      ...(body.sortOrder !== undefined && { sortOrder: Number(body.sortOrder) }),
      ...(body.isActive !== undefined && { isActive: Boolean(body.isActive) }),
    });

    revalidatePath("/");
    revalidatePath("/dashboard/creator-videos");
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update creator video:", error);
    return NextResponse.json({ error: error?.message || "Failed to update creator video" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await params;
    await deleteCreatorVideo(id);
    revalidatePath("/");
    revalidatePath("/dashboard/creator-videos");
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete creator video:", error);
    return NextResponse.json({ error: error?.message || "Failed to delete creator video" }, { status: 500 });
  }
}
