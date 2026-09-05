import { NextRequest, NextResponse } from "next/server";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import { getCurrentUser, AuthError } from "@/lib/server/dal/auth";
import { getDelhiveryTracking } from "@/lib/server/delhivery";

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/orders/:id/tracking
// The carrier response is fetched on the server so the Delhivery token is never
// exposed to a browser. Customers may access only their own order.
export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      throw new AuthError("Unauthorized. Please sign in to track this order.", 401);
    }

    const { id } = await params;
    const order = await ordersController.getOrder(id);
    const customerEmail = order.customerEmail?.trim().toLowerCase();
    const customerPhone = order.customerPhone?.replace(/\D/g, "");
    const userPhone = user.phone?.replace(/\D/g, "");
    const isOwner =
      order.userId === user.id ||
      Boolean(customerEmail && customerEmail === user.email.trim().toLowerCase()) ||
      Boolean(customerPhone && userPhone && customerPhone === userPhone);

    if (user.role !== "ADMIN" && !isOwner) {
      throw new AuthError("Forbidden", 403);
    }
    if (!order.trackingNumber) {
      return NextResponse.json(
        {
          success: false,
          error: "Tracking will be available after your shipment is prepared.",
          code: "TRACKING_NOT_READY",
        },
        { status: 409 }
      );
    }

    const tracking = await getDelhiveryTracking(order.trackingNumber);
    return NextResponse.json({
      success: true,
      data: {
        ...tracking,
        carrier: order.shippingCarrier || "Delhivery",
        estimatedDelivery: order.estimatedDelivery || null,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Unable to retrieve courier tracking.";
    const status = message.includes("not found") ? 404 : 502;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
