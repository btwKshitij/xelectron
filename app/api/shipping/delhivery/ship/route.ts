import { NextRequest, NextResponse } from "next/server";
import { fetchDelhiveryWaybill, getDelhiveryTrackingUrl } from "@/lib/server/delhivery";
import { db } from "@/lib/db";
import { requireAdmin, AuthError } from "@/lib/server/dal/auth";

export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
    const body = await request.json();
    const { orderId } = body;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Order ID is required" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      select: { id: true, status: true, trackingNumber: true },
    });
    if (!order) {
      return NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
    }
    if (order.trackingNumber) {
      return NextResponse.json(
        { success: false, error: "This order already has an AWB. Edit and save the tracking details instead of generating another one." },
        { status: 409 }
      );
    }

    // Reserve a real AWB. This is deliberately not marked as in-transit: a
    // shipment becomes live only after it has been manifested and first scanned.
    const liveAwb = await fetchDelhiveryWaybill();
    const carrier = "Delhivery Express";
    const trackingUrl = getDelhiveryTrackingUrl(liveAwb);

    // Publish the AWB immediately to the customer order. PROCESSING truthfully
    // communicates that the parcel is prepared but has not yet been scanned.
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        shippingCarrier: carrier,
        trackingNumber: liveAwb,
        trackingUrl: trackingUrl,
        status:
          order.status === "PENDING" || order.status === "CONFIRMED"
            ? "PROCESSING"
            : order.status,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Delhivery AWB generated and published to the customer. Courier scans will appear after handover.",
      data: {
        trackingNumber: liveAwb,
        shippingCarrier: carrier,
        trackingUrl: trackingUrl,
        estimatedDelivery: updatedOrder.estimatedDelivery,
        status: updatedOrder.status,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message =
      error instanceof Error ? error.message : "Failed to ship with Delhivery";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
