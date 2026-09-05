import { NextResponse } from "next/server";
import { verifySession } from "@/lib/server/dal/auth";
import { seedBrandShowcaseDefaults } from "@/lib/server/controllers/brand-showcase.controller";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const items = await seedBrandShowcaseDefaults();
    return NextResponse.json({ success: true, count: items.length, data: items });
  } catch (error: any) {
    console.error("Failed to seed brand showcase defaults:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to seed defaults" },
      { status: 500 }
    );
  }
}
