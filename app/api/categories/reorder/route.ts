import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AuthError, requireAdmin } from "@/lib/server/dal/auth";
import * as categoriesController from "@/lib/server/controllers/categories.controller";

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    let items: { id: string; sortOrder: number }[] = [];

    if (Array.isArray(body?.items)) {
      items = body.items.map((item: any) => ({
        id: String(item.id),
        sortOrder: Number(item.sortOrder),
      }));
    } else if (Array.isArray(body?.ids)) {
      items = body.ids.map((id: string, index: number) => ({
        id: String(id),
        sortOrder: index,
      }));
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid payload: items or ids array is required" },
        { status: 400 }
      );
    }

    await categoriesController.reorderCategories(items);

    revalidatePath("/dashboard/products/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/navbar");
    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Could not reorder categories.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function POST(request: NextRequest) {
  return PUT(request);
}
