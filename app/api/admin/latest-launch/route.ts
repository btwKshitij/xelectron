import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/server/dal/auth";
import { db } from "@/lib/db";
import { saveLatestLaunchIds } from "@/lib/server/dal/latest-launch.dal";
import { LATEST_LAUNCH_LIMIT } from "@/lib/latest-launch";

export async function PUT(request: Request) {
  const session = await verifySession();
  if (!session || session.role !== "ADMIN") return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { productIds } = await request.json();
    if (!Array.isArray(productIds) || productIds.length > LATEST_LAUNCH_LIMIT || productIds.some((id) => typeof id !== "string" || !id.trim()) || new Set(productIds).size !== productIds.length) {
      return NextResponse.json({ error: "Choose up to four different products." }, { status: 400 });
    }
    const count = await db.product.count({ where: { id: { in: productIds } } });
    if (count !== productIds.length) return NextResponse.json({ error: "A selected product no longer exists. Refresh and choose again." }, { status: 400 });
    await saveLatestLaunchIds(productIds);
    revalidatePath("/");
    revalidatePath("/dashboard/products/latest-launch");
    return NextResponse.json({ productIds });
  } catch (error) {
    console.error("Failed to save latest launch products", error);
    return NextResponse.json({ error: "Unable to save Latest Launch products." }, { status: 500 });
  }
}
