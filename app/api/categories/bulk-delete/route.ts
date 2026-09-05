import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { AuthError, requireAdmin } from "@/lib/server/dal/auth";
import * as categoriesController from "@/lib/server/controllers/categories.controller";

// POST /api/categories/bulk-delete
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();

    const body = await request.json();
    const ids = Array.isArray(body?.ids) ? body.ids : [];
    const reassignProductsToId = typeof body?.reassignProductsToId === "string"
      ? body.reassignProductsToId
      : undefined;
    const result = await categoriesController.deleteCategories(ids, reassignProductsToId);

    revalidatePath("/dashboard/products/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/navbar");
    revalidatePath("/");
    revalidatePath("/shop");

    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }

    const message = error instanceof Error ? error.message : "Could not delete the selected categories.";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
