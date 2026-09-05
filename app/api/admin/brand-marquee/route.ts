import { NextResponse } from "next/server";
import { verifySession } from "@/lib/server/dal/auth";
import {
  listBrandMarqueeItems,
  createBrandMarqueeItem,
} from "@/lib/server/controllers/brand-marquee.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listBrandMarqueeItems(false);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Failed to fetch admin brand marquee items:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch items" },
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
    if (!body.name || !body.name.trim()) {
      return NextResponse.json(
        { error: "Brand Name is required." },
        { status: 400 }
      );
    }

    const item = await createBrandMarqueeItem({
      name: body.name.trim(),
      logoUrl: body.logoUrl ? body.logoUrl.trim() : null,
      color: (body.color || "#000000").trim(),
      linkUrl: body.linkUrl ? body.linkUrl.trim() : null,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create brand marquee item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create item" },
      { status: 500 }
    );
  }
}
