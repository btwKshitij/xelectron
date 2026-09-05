import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import * as discountsController from "@/lib/server/controllers/discounts.controller";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function GET() {
  try {
    const discounts = await discountsController.listDiscounts();
    return NextResponse.json({ success: true, data: discounts });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const discount = await discountsController.createDiscount(await request.json());
    revalidatePath("/dashboard/discounts");
    return NextResponse.json({ success: true, data: discount }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
