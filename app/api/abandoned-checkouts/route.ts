import { NextResponse } from "next/server";

import * as abandonedCheckoutsController from "@/lib/server/controllers/abandoned-checkouts.controller";

export async function POST(request: Request) {
  try {
    const checkout = await abandonedCheckoutsController.trackAbandonedCheckout(await request.json());
    return NextResponse.json({ success: true, data: { id: checkout.id } }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save checkout";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
