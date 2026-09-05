import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import * as dealOfTheDayController from "@/lib/server/controllers/deal-of-the-day.controller";

export async function GET() {
  try {
    const deal = await dealOfTheDayController.getDealOfTheDay();
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await requireAdmin();
    const deal = await dealOfTheDayController.saveDealOfTheDay(await request.json());
    revalidatePath("/");
    revalidatePath("/dashboard/deal-of-the-day");
    return NextResponse.json({ success: true, data: deal });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Could not save the deal";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
