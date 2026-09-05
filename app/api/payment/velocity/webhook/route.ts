import { NextRequest, NextResponse } from "next/server";
import { verifyVelocityWebhook, getVelocityConfig } from "@/lib/server/velocity";
import { cancelVelocityOrder, confirmVelocityOrder } from "@/lib/server/velocity-orders";

type VelocityWebhookData = {
  order_id?: string;
  merchant_order_id?: string;
  payment_id?: string;
  session_uuid?: string;
  id?: string;
  status?: string;
};

type VelocityWebhookPayload = {
  event?: string;
  data?: VelocityWebhookData;
  order_id?: string;
  merchant_order_id?: string;
};

export async function GET() {
  return NextResponse.json({
    success: true,
    status: "active",
    message: "Velocity Webhook endpoint is active and listening for POST requests.",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("x-velocity-signature");
    const config = getVelocityConfig();

    // A payment event is trusted only when the Velocity webhook signature can
    // be verified. Never allow an unsigned request to confirm an order.
    if (!config.webhookSecret) {
      return NextResponse.json(
        { success: false, error: "Velocity webhook secret is not configured" },
        { status: 503 }
      );
    }

    const isValid = verifyVelocityWebhook(rawBody, signature, config.webhookSecret);
    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Invalid Velocity webhook signature" },
        { status: 401 }
      );
    }

    let payload: VelocityWebhookPayload;
    try {
      payload = JSON.parse(rawBody) as VelocityWebhookPayload;
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    const { event, data } = payload;
    const orderId =
      data?.order_id ||
      data?.merchant_order_id ||
      payload?.order_id ||
      payload?.merchant_order_id ||
      data?.id;
    const paymentId = data?.payment_id || data?.session_uuid || data?.id;

    if (!orderId) {
      return NextResponse.json(
        { success: false, error: "Missing order_id in webhook data" },
        { status: 400 }
      );
    }

    if (event === "payments.success" || data?.status === "success") {
      const result = await confirmVelocityOrder(orderId, paymentId);

      if (result.confirmed && result.order?.customerEmail) {
        import("@/lib/server/mail").then(({ sendOrderConfirmationEmail }) => {
          sendOrderConfirmationEmail({
            id: result.order.id,
            customerName: result.order.customerName,
            customerEmail: result.order.customerEmail,
            total: result.order.total,
            trackingNumber: result.order.trackingNumber,
            trackingUrl: result.order.trackingUrl,
            estimatedDelivery: result.order.estimatedDelivery,
          }).catch((err) => console.warn("Failed to send Velocity order email:", err));
        });
      }
    } else if (event === "payments.failed" || data?.status === "failed") {
      await cancelVelocityOrder(orderId, paymentId);
    }

    return NextResponse.json({ success: true, status: "ok" }, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook handler failed";
    console.error("Velocity Webhook Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
