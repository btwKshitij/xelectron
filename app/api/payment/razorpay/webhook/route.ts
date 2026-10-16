import { after, NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/server/razorpay";
import { db } from "@/lib/db";
import { notifyOrderSms } from "@/lib/server/sms/notifications";
import * as productsDal from "@/lib/server/dal/products.dal";
import { sendMetaPurchase } from "@/lib/server/meta-purchase";

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

    if (!webhookSecret) {
      return NextResponse.json({ success: false, error: "Webhook verification is not configured" }, { status: 503 });
    }

    // Payment notifications must have a valid signature.
    if (webhookSecret) {
      const isValid = verifyRazorpayWebhook(rawBody, signature, webhookSecret);
      if (!isValid) {
        return NextResponse.json(
          { success: false, error: "Invalid Razorpay webhook signature" },
          { status: 401 }
        );
      }
    }

    type Entity = { id?: string; payment_id?: string; method?: string; order_id?: string; amount?: number; amount_paid?: number; currency?: string; notes?: Record<string, string> };
    let payload: { event?: string; payload?: { payment?: { entity?: Entity }; order?: { entity?: Entity }; refund?: { entity?: Entity } } };
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

      if (order) {
        const amount = Number(paymentEntity?.amount ?? orderEntity?.amount_paid);
        const currency = paymentEntity?.currency ?? orderEntity?.currency;
        if (currency !== "INR" || amount !== Math.round(order.total * 100)) {
          return NextResponse.json({ success: false, error: "Payment amount mismatch" }, { status: 400 });
        }
        await db.order.update({ where: { id: order.id }, data: { paymentVerified: true } });
        await notifyOrderSms(order.id, "paid");
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

        // Decrement product stock only if order was previously PENDING and not yet decremented
        if (order.items && order.items.length > 0 && order.status === "PENDING") {
          try {
            await Promise.all(
              order.items.map((item: { productId: string; quantity: number }) =>
                productsDal.decrementProductStock(item.productId, item.quantity).catch(() => null)
              )
            );
          } catch {}
        }
      }

      // Webhook-confirmed payment: send the Meta Purchase if the client verify path has not already.
      if (order) {
        const confirmedOrderId = order.id;
        after(() => sendMetaPurchase(confirmedOrderId));
      }
    } else if (event === "payment.failed") {
      if (dbOrderId) {
        const cancelled = await db.order.updateMany({
          where: { id: dbOrderId, status: "PENDING", paymentVerified: false },
          data: {
            status: "CANCELLED",
          },
        });
        if (cancelled.count) await notifyOrderSms(dbOrderId, "paymentFailed");
      }
    } else if (event === "refund.created" || event === "refund.processed") {
      const refund = eventPayload?.refund?.entity;
      if (typeof refund?.id === "string" && typeof refund?.payment_id === "string" && /^pay_[A-Za-z0-9]+$/.test(refund.payment_id)) {
        const order = await db.order.findFirst({ where: { paymentVerified: true, internalNotes: { contains: refund.payment_id } } });
        if (order) await notifyOrderSms(order.id, "refund", refund.id);
      }
    }

    return NextResponse.json({ success: true, status: "ok" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Razorpay Webhook handler failed";
    console.error("Razorpay Webhook Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
