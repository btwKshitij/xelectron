import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import {
  getBrandMarqueeItem,
  updateBrandMarqueeItem,
  deleteBrandMarqueeItem,
} from "@/lib/server/controllers/brand-marquee.controller";

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
    const item = await getBrandMarqueeItem(id);
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch item" },
      { status: 500 }
    );
  }
}

// POST handler (WAF workaround — dispatches update/delete via _method field)
export async function POST(
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
    if (body?._method === "DELETE") {
      await deleteBrandMarqueeItem(id);
      try {
        revalidatePath("/", "layout");
        revalidatePath("/", "page");
        revalidatePath("/dashboard/brand-marquee", "page");
        revalidatePath("/dashboard/brand-marquee", "layout");
        revalidatePath("/api/admin/brand-marquee");
      } catch {}
      return NextResponse.json({ success: true }, {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
          Pragma: "no-cache",
          Expires: "0",
        },
      });
    }

    const updateData: any = {};

    if (body.name !== undefined) updateData.name = body.name.trim();
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl ? body.logoUrl.trim() : null;
    if (body.color !== undefined) updateData.color = body.color.trim();
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await updateBrandMarqueeItem(id, updateData);
    try {
      revalidatePath("/", "layout");
      revalidatePath("/", "page");
      revalidatePath("/dashboard/brand-marquee", "page");
      revalidatePath("/dashboard/brand-marquee", "layout");
      revalidatePath("/api/admin/brand-marquee");
    } catch {}

    return NextResponse.json(updated, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    });
  } catch (error: any) {
    console.error("Failed to process brand marquee item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process item" },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    if (body.logoUrl !== undefined) updateData.logoUrl = body.logoUrl ? body.logoUrl.trim() : null;
    if (body.color !== undefined) updateData.color = body.color.trim();
    if (body.linkUrl !== undefined) updateData.linkUrl = body.linkUrl ? body.linkUrl.trim() : null;
    if (body.sortOrder !== undefined) updateData.sortOrder = Number(body.sortOrder) || 0;
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive);

    const updated = await updateBrandMarqueeItem(id, updateData);
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Failed to update brand marquee item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update item" },
      { status: 500 }
    );
  }
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
    await deleteBrandMarqueeItem(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Failed to delete brand marquee item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete item" },
      { status: 500 }
    );
  }
}
