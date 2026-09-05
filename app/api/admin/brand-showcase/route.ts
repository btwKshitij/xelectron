import { NextResponse } from "next/server";
import { verifySession } from "@/lib/server/dal/auth";
import {
  listBrandShowcaseItems,
  createBrandShowcaseItem,
} from "@/lib/server/controllers/brand-showcase.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await listBrandShowcaseItems(false);
    return NextResponse.json(items);
  } catch (error: any) {
    console.error("Failed to fetch admin brand showcase items:", error);
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
    if (!body.title || !body.image) {
      return NextResponse.json(
        { error: "Title and Image are required." },
        { status: 400 }
      );
    }

    const item = await createBrandShowcaseItem({
      title: body.title.trim(),
      subtitle: (body.subtitle || "").trim(),
      image: body.image.trim(),
      linkUrl: body.linkUrl ? body.linkUrl.trim() : null,
      sortOrder: Number(body.sortOrder) || 0,
      isActive: body.isActive !== undefined ? Boolean(body.isActive) : true,
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error: any) {
    console.error("Failed to create brand showcase item:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create item" },
      { status: 500 }
    );
  }
}
