import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/categories/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const category = await categoriesController.getCategory(id);
    if (!category) {
      return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/categories/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const category = await categoriesController.updateCategory(id, body);
    return NextResponse.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// DELETE /api/categories/:id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await categoriesController.deleteCategory(id);
    revalidatePath("/dashboard/products/categories");
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/navbar");
    revalidatePath("/");
    revalidatePath("/shop");
    return NextResponse.json({ success: true, message: "Category deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
