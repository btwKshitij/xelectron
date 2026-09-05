import { NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/server/razorpay";
import { db } from "@/lib/db";
import * as productsDal from "@/lib/server/dal/products.dal";

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    message: "Razorpay Webhook endpoint is active and listening for POST requests.",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    // Verify webhook HMAC signature if webhook secret is configured
    if (webhookSecret) {
      const isValid = verifyRazorpayWebhook(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid Razorpay webhook signature" },
          { status: 401 }
        );
      }
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { event, payload: eventPayload } = payload || {};
    const paymentEntity = eventPayload?.payment?.entity;
    const orderEntity = eventPayload?.order?.entity;

    // Extract payment details (UPI, EMI, Card, etc.)
    const paymentId = paymentEntity?.id;
    const paymentMethod = paymentEntity?.method; // 'upi', 'emi', 'card', 'netbanking', etc.
    const razorpayOrderId = paymentEntity?.order_id || orderEntity?.id;
    const notes = paymentEntity?.notes || orderEntity?.notes || {};
    const dbOrderId = notes.order_id || notes.orderId;

    console.log(
      `[Razorpay Webhook] Event: ${event}, Method: ${paymentMethod}, Payment ID: ${paymentId}, Order ID: ${razorpayOrderId}`
    );

    // Handle Payment Success (payment.captured or order.paid)
    if (event === "payment.captured" || event === "order.paid") {
      let order = null;

      if (dbOrderId) {
        order = await db.order.findUnique({
          where: { id: dbOrderId },
          include: { items: true },
        });
      }

      if (!order && razorpayOrderId) {
        // Search by razorpayOrderId in internalNotes if dbOrderId wasn't in notes
        const orders = await db.order.findMany({
          where: {
            internalNotes: {
              contains: razorpayOrderId,
            },
          },
          include: { items: true },
          take: 1,
        });
        if (orders.length > 0) {
          order = orders[0];
        }
      }

      if (order && order.status !== "CONFIRMED" && order.status !== "PROCESSING" && order.status !== "SHIPPED") {
        const methodNote = paymentMethod ? ` (Method: ${paymentMethod.toUpperCase()})` : "";
        const updatedNotes = order.internalNotes
          ? `${order.internalNotes}\nWebhook confirmed payment ${paymentId}${methodNote}`
          : `Paid via Razorpay ${paymentId}${methodNote}`;

        await db.order.update({
          where: { id: order.id },
          data: {
            status: "CONFIRMED",
            internalNotes: updatedNotes,
          },
        });

        // Decrement product stock if not already decremented
        if (order.items && order.items.length > 0) {
          await Promise.all(
            order.items.map((item: any) =>
              productsDal.decrementProductStock(item.productId, item.quantity)
            )
          );
        }
      }
    } else if (event === "payment.failed") {
      if (dbOrderId) {
        await db.order.updateMany({
          where: { id: dbOrderId, status: "PENDING" },
          data: {
            status: "CANCELLED",
          },
        });
      }
    }

    return NextResponse.json({ success: true, status: "ok" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Razorpay Webhook handler failed";
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
