import { NextResponse } from "next/server";
import { fetchDelhiveryWaybill, getDelhiveryTrackingUrl } from "@/lib/server/delhivery";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function GET() {
  try {
    await requireAdmin();
    const awb = await fetchDelhiveryWaybill();
    const trackingUrl = getDelhiveryTrackingUrl(awb);
    return NextResponse.json({ success: true, awb, trackingUrl });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Failed to fetch waybill";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
