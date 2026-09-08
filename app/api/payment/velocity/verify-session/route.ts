import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getVelocityOrderSessions, parseVelocityStateToken } from "@/lib/server/velocity";
import { confirmVelocityOrder } from "@/lib/server/velocity-orders";

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

      if (successfulSession) {
        await confirmVelocityOrder(order.id, successfulSession.session_uuid);
        const updated = await db.order.findUnique({ where: { id: order.id } });
        if (updated && updated.paymentVerified) {
          return NextResponse.json({
            success: true,
            data: {
              id: updated.id,
              orderNumber: `XE-${updated.id.slice(-6).toUpperCase()}`,
              total: updated.total,
              shippingCarrier: updated.shippingCarrier,
              trackingNumber: updated.trackingNumber,
              trackingUrl: updated.trackingUrl,
              estimatedDelivery: updated.estimatedDelivery,
              customerName: updated.customerName,
              customerEmail: updated.customerEmail,
            },
          });
        }
      }

      return NextResponse.json(
        {
          success: false,
          pending: true,
          paymentStatus: successfulSession?.status || latestSession?.status || "created",
          error:
            "Payment is awaiting confirmation from Velocity. Your order has not been confirmed.",
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

    if (!order.paymentVerified) {
      return NextResponse.json({ success: false, pending: true, error: "Payment is not verified yet." }, { status: 202 });
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
