import { after, NextRequest, NextResponse } from "next/server";
import { verifyRazorpayWebhook } from "@/lib/server/razorpay";
import { db } from "@/lib/db";
import { notifyOrderSms } from "@/lib/server/sms/notifications";
import { sendMetaPurchase } from "@/lib/server/meta-purchase";
import { confirmRazorpayOrder, findRazorpayOrder, queueRazorpayOrderEmail } from "@/lib/server/razorpay-orders";

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
      const order = await findRazorpayOrder(dbOrderId, razorpayOrderId);

      if (!order) {
        console.warn(`[Razorpay Webhook] No order found for Razorpay order ${razorpayOrderId} (payment ${paymentId})`);
      } else {
        const amount = Number(paymentEntity?.amount ?? orderEntity?.amount_paid);
        const currency = paymentEntity?.currency ?? orderEntity?.currency;
        if (currency !== "INR" || amount !== Math.round(order.total * 100)) {
          return NextResponse.json({ success: false, error: "Payment amount mismatch" }, { status: 400 });
        }

        // Confirms the pending order exactly once; a no-op if the browser's
        // verify call already did it. Email is only sent on the first confirmation.
        const result = await confirmRazorpayOrder(order.id, {
          paymentId,
          razorpayOrderId,
          method: paymentMethod,
          source: "webhook",
        });
        if (result.confirmed && result.order) {
          queueRazorpayOrderEmail(result.order);
        }

        // sendMetaPurchase de-duplicates itself, so it is safe on every confirmed order.
        if (result.confirmed || order.paymentVerified) {
          const confirmedOrderId = order.id;
          after(() => sendMetaPurchase(confirmedOrderId));
        }
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
