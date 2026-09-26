import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import * as productsController from "@/lib/server/controllers/products.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

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

// POST /api/products/:id (handles update, toggle, or delete to avoid WAF 403 on PUT/DELETE)
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAdmin();
    const { id } = await params;
    const body = await request.json();

    if (body?._method === "DELETE" || body?.action === "delete") {
      await productsController.deleteProduct(id);
      revalidatePath("/");
      return NextResponse.json({ success: true, message: "Product deleted" });
    }

    const isNavbarToggle =
      typeof body?.showInNavbar === "boolean" &&
      Object.keys(body).length === 1;
    const isWarrantyMenuToggle =
      typeof body?.showInWarrantyMenu === "boolean" &&
      Object.keys(body).length === 1;
    const isBestSellerToggle =
      typeof body?.showInBestSellers === "boolean" &&
      Object.keys(body).length === 1;

    const product = isNavbarToggle
      ? await productsController.setProductNavbarPlacement(id, body.showInNavbar)
      : isWarrantyMenuToggle
        ? await productsController.setProductWarrantyMenuPlacement(id, body.showInWarrantyMenu)
      : isBestSellerToggle
        ? await productsController.setProductBestSellerPlacement(id, body.showInBestSellers)
      : await productsController.updateProduct(id, body);

    revalidatePath("/product/[id]", "page");
    revalidatePath("/dashboard/products/[id]", "page");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/");
    revalidatePath("/shop");
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
    const isBestSellerToggle =
      typeof body?.showInBestSellers === "boolean" &&
      Object.keys(body).length === 1;

    const product = isNavbarToggle
      ? await productsController.setProductNavbarPlacement(id, body.showInNavbar)
      : isWarrantyMenuToggle
        ? await productsController.setProductWarrantyMenuPlacement(id, body.showInWarrantyMenu)
      : isBestSellerToggle
        ? await productsController.setProductBestSellerPlacement(id, body.showInBestSellers)
      : await productsController.updateProduct(id, body);
    revalidatePath("/product/[id]", "page");
    revalidatePath("/dashboard/products/[id]", "page");
    revalidatePath("/dashboard/products/new");
    revalidatePath("/");
    revalidatePath("/shop");
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
