import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";
import type { DeliveryBooking } from "@/lib/delivery-booking";

export async function GET() {
  try {
    await requireAdmin();
    const environment = process.env.DELHIVERY_ENVIRONMENT?.toLowerCase() === "staging" ? "staging" : "production";
    const configured = process.env.DELHIVERY_PICKUP_LOCATION?.trim();
    if (configured) return NextResponse.json({ success: true, data: { pickupLocation: configured, source: "configured" } });
    const lastShipment = await db.order.findFirst({
      where: { AND: [
        { deliveryBooking: { path: ["state"], equals: "MANIFESTED" } },
        { deliveryBooking: { path: ["environment"], equals: environment } },
      ] },
      orderBy: { updatedAt: "desc" }, select: { deliveryBooking: true },
    });
    const booking = lastShipment?.deliveryBooking as DeliveryBooking | null;
    return NextResponse.json({ success: true, data: { pickupLocation: booking?.parcel.pickupLocation || "", source: booking ? "last-shipment" : "none" } });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof AuthError ? error.message : "Unable to load the default pickup location." }, { status: error instanceof AuthError ? error.status : 500 });
  }
}
