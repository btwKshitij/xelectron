import { getPurchaseAnalytics } from "@/lib/server/purchase-analytics";
import { metaRequestContext } from "@/lib/server/meta-capi";
import { sendMetaPurchase } from "@/lib/server/meta-purchase";
import { after, NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import { getRazorpayInstance } from "@/lib/server/razorpay";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import * as ordersDal from "@/lib/server/dal/orders.dal";
import { getCurrentUser } from "@/lib/server/dal/auth";
import { setSessionCookie } from "@/lib/server/auth/session-utils";
import {
  confirmRazorpayOrder,
  findRazorpayOrder,
  queueRazorpayOrderEmail,
  razorpayOrderNote,
  RAZORPAY_PAYMENT_NOTE,
} from "@/lib/server/razorpay-orders";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
      dbOrderId,
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Missing Razorpay verification parameters" },
        { status: 400 }
      );
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keySecret) {
      return NextResponse.json(
        { success: false, error: "Razorpay secret key is not configured" },
        { status: 500 }
      );
    }

    // Verify signature using HMAC SHA256
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed: invalid signature" },
        { status: 400 }
      );
    }

    // The order was created before the popup opened (see create-order).
    const pendingOrder = await findRazorpayOrder(
      typeof dbOrderId === "string" ? dbOrderId : null,
      razorpay_order_id
    );

    const payment = await getRazorpayInstance().payments.fetch(razorpay_payment_id);
    const expectedTotal = pendingOrder ? pendingOrder.total : Number(orderDetails?.total);
    const expectedAmount = Math.round(expectedTotal * 100);
    if (payment.order_id !== razorpay_order_id || payment.status !== "captured" || payment.currency !== "INR" || !Number.isFinite(expectedAmount) || Number(payment.amount) !== expectedAmount) {
      return NextResponse.json({ success: false, error: "Payment has not been captured for this order amount." }, { status: 400 });
    }

    const coupon = orderDetails?.discountCode || "";
    const metaContext = metaRequestContext(request);

    if (pendingOrder) {
      const result = await confirmRazorpayOrder(pendingOrder.id, {
        paymentId: razorpay_payment_id,
        razorpayOrderId: razorpay_order_id,
        method: typeof payment.method === "string" ? payment.method : null,
        source: "verify",
      });
      const order = result.order ?? pendingOrder;

      // If the webhook got here first the email and Meta event were already sent.
      if (result.confirmed) {
        after(() => sendMetaPurchase(order.id, metaContext));
        queueRazorpayOrderEmail(order);
      }

      return NextResponse.json({
        success: true,
        data: order,
        analytics: await getPurchaseAnalytics(order.id, coupon),
        paymentId: razorpay_payment_id,
      });
    }

    // Fallback for checkouts started before the pending-order flow was deployed:
    // create the order now from the details the browser sent.
    if (!orderDetails) {
      return NextResponse.json(
        { success: false, error: "No order found for this payment. Please contact support with your payment ID." },
        { status: 404 }
      );
    }

    const user = await getCurrentUser();
    const internalNotes = `${RAZORPAY_PAYMENT_NOTE}\nPaid via Razorpay. Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}\n${razorpayOrderNote(razorpay_order_id)}`;

    const order = await ordersController.createOrder({
      ...orderDetails,
      paymentVerified: true,
      userId: user?.id || orderDetails?.userId || null,
      customerName:
        orderDetails?.customerName ||
        (orderDetails?.firstName ? `${orderDetails.firstName} ${orderDetails.lastName || ""}`.trim() : user?.name),
      customerEmail: (orderDetails?.customerEmail || orderDetails?.email || user?.email)?.toLowerCase().trim(),
      customerPhone: (orderDetails?.customerPhone || orderDetails?.phone)?.replace(/[^0-9]/g, ""),
      internalNotes,
    });
    await ordersDal.updateOrderStatus(order.id, "CONFIRMED").catch(() => null);

    if ("sessionToken" in order && typeof order.sessionToken === "string") {
      await setSessionCookie(order.sessionToken);
    }

    after(() => sendMetaPurchase(order.id, metaContext));
    queueRazorpayOrderEmail(order);

    return NextResponse.json({
      success: true,
      data: order,
      analytics: await getPurchaseAnalytics(order.id, coupon),
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal payment verification error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
