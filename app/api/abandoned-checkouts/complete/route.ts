import { NextResponse } from "next/server";

import * as abandonedCheckoutsController from "@/lib/server/controllers/abandoned-checkouts.controller";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await abandonedCheckoutsController.recoverAbandonedCheckout(body?.sessionToken);
    return NextResponse.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to complete checkout";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
