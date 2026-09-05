import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as productsController from "@/lib/server/controllers/products.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/products/:id
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const product = await productsController.getProduct(id);
    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// PUT /api/products/:id
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();
    const isNavbarToggle =
      typeof body?.showInNavbar === "boolean" &&
      Object.keys(body).length === 1;
    const isWarrantyMenuToggle =
      typeof body?.showInWarrantyMenu === "boolean" &&
      Object.keys(body).length === 1;
    const product = isNavbarToggle
      ? await productsController.setProductNavbarPlacement(id, body.showInNavbar)
      : isWarrantyMenuToggle
        ? await productsController.setProductWarrantyMenuPlacement(id, body.showInWarrantyMenu)
      : await productsController.updateProduct(id, body);
    revalidatePath("/");
    revalidatePath("/product");
    revalidatePath(`/product/${product.id}`);
    if (product.slug) revalidatePath(`/product/${product.slug}`);
    revalidatePath("/dashboard/products");
    revalidatePath("/dashboard/products/navbar");
    revalidatePath("/dashboard/products/warranty");
    revalidatePath("/terms-policy");
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : message.includes("maximum") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}

// DELETE /api/products/:id
export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    await productsController.deleteProduct(id);
    revalidatePath("/");
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
