import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import crypto from "crypto";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import { getCurrentUser } from "@/lib/server/dal/auth";
import { setSessionCookie } from "@/lib/server/auth/session-utils";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderDetails,
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

    // Signature is authentic - Proceed to persist order
    const user = await getCurrentUser();
    const internalNotes = `Paid via Razorpay. Payment ID: ${razorpay_payment_id} | Order ID: ${razorpay_order_id}`;

    const order = await ordersController.createOrder({
      ...orderDetails,
      status: "CONFIRMED",
      userId: user?.id || orderDetails?.userId || null,
      customerName:
        orderDetails?.customerName ||
        (orderDetails?.firstName ? `${orderDetails.firstName} ${orderDetails.lastName || ""}`.trim() : user?.name),
      customerEmail: orderDetails?.customerEmail || orderDetails?.email || user?.email,
      customerPhone: orderDetails?.customerPhone || orderDetails?.phone,
      internalNotes,
      paymentMethod: "ONLINE_RAZORPAY",
    });

    if ((order as any).sessionToken) {
      await setSessionCookie((order as any).sessionToken);
    }

    return NextResponse.json({
      success: true,
      data: order,
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Internal payment verification error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
