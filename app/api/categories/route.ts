import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

// GET /api/categories
export async function GET() {
  try {
    const categories = await categoriesController.listCategories();
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/categories
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const category = await categoriesController.createCategory(body);
    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("already exists") || message.includes("Missing") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
