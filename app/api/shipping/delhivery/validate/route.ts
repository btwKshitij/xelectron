import { NextRequest, NextResponse } from "next/server";

import { getDelhiveryTracking } from "@/lib/server/delhivery";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const { trackingNumber } = await request.json();
    if (typeof trackingNumber !== "string" || !trackingNumber.trim()) {
      return NextResponse.json({ success: false, error: "Enter a tracking number to verify." }, { status: 400 });
    }

    const tracking = await getDelhiveryTracking(trackingNumber);
    return NextResponse.json({ success: true, data: tracking });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to verify the Delhivery tracking number.";
    return NextResponse.json({ success: false, error: message }, { status: 502 });
  }
}
