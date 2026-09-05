import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVelocityOrderSessions, parseVelocityStateToken } from "@/lib/server/velocity";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { state?: unknown };
    const state = typeof body.state === "string" ? body.state : null;
    const targetOrderId = parseVelocityStateToken(state);

    if (!targetOrderId) {
      return NextResponse.json(
        { success: false, error: "Invalid or missing Velocity return state" },
        { status: 400 }
      );
    }

    const order = await db.order.findUnique({
      where: { id: targetOrderId },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    // A browser redirect is not proof of an approved payment. Velocity's
    // signed webhook is the only code path allowed to confirm an order.
    if (order.status === "PENDING") {
      const velocityOrderId = order.internalNotes
        ?.split("\n")
        .find((line: string) => line.startsWith("Velocity Order ID: "))
        ?.slice("Velocity Order ID: ".length);

      if (!velocityOrderId) {
        return NextResponse.json(
          { success: false, error: "Velocity order reference is missing" },
          { status: 500 }
        );
      }

      const sessions = await getVelocityOrderSessions(velocityOrderId);
      const successfulSession = sessions.find((session) => session.status === "success");
      const latestSession = sessions.at(-1);

      return NextResponse.json(
        {
          success: false,
          pending: true,
          paymentStatus: successfulSession?.status || latestSession?.status || "created",
          error:
            "Payment is awaiting the signed confirmation from Velocity. Your order has not been confirmed.",
        },
        { status: 202 }
      );
    }

    if (order.status === "CANCELLED") {
      return NextResponse.json(
        {
          success: false,
          error: "Velocity reported that this payment was not completed. No order has been confirmed.",
        },
        { status: 402 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: order.id,
        orderNumber: `XE-${order.id.slice(-6).toUpperCase()}`,
        total: order.total,
        shippingCarrier: order.shippingCarrier,
        trackingNumber: order.trackingNumber,
        trackingUrl: order.trackingUrl,
        estimatedDelivery: order.estimatedDelivery,
        customerName: order.customerName,
        customerEmail: order.customerEmail,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to verify session";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
