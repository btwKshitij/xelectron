import { NextResponse } from "next/server";
import { listBrandMarqueeItems } from "@/lib/server/controllers/brand-marquee.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const items = await listBrandMarqueeItems(true);
    return NextResponse.json({ success: true, data: items });
  } catch (error: any) {
    console.error("Failed to list brand marquee items:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Failed to list items" },
      { status: 500 }
    );
  }
}
