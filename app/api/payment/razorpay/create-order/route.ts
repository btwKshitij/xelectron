import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRazorpayInstance } from "@/lib/server/razorpay";
import { validateDealCheckout } from "@/lib/server/deal-checkout";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import { getCurrentUser } from "@/lib/server/dal/auth";
import { setSessionCookie } from "@/lib/server/auth/session-utils";
import {
  attachRazorpayOrderId,
  cancelPendingRazorpayOrder,
  RAZORPAY_PAYMENT_NOTE,
} from "@/lib/server/razorpay-orders";

export async function POST(request: NextRequest) {
  let pendingOrderId: string | null = null;

  try {
    const body = await request.json();
    const { amount, receipt, notes, items, discountCode, orderDetails } = body;

    if (!amount || Number(amount) <= 0) {
      return NextResponse.json(
        { success: false, error: "Invalid order amount" },
        { status: 400 }
      );
    }

    if (Array.isArray(items) && items.length > 0) {
      await validateDealCheckout(items, Number(amount), discountCode);
      const { db } = await import("@/lib/db");
      for (const item of items) {
        if (!item?.id) continue;
        const product = await db.product.findFirst({
          where: { OR: [{ id: item.id }, { slug: item.id }] },
          select: { name: true, quantity: true },
        });
        if (product && typeof product.quantity === "number" && product.quantity < (item.quantity || 1)) {
          return NextResponse.json(
            {
              success: false,
              error:
                product.quantity <= 0
                  ? `"${product.name}" is out of stock. Please remove it from your cart to proceed.`
                  : `Only ${product.quantity} unit(s) of "${product.name}" available in stock.`,
            },
            { status: 400 }
          );
        }
      }
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim() || "";
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim() || "";

    if (!keyId || !keySecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Razorpay credentials are not loaded. Please restart your Next.js server (npm run dev) to load .env variables.",
        },
        { status: 500 }
      );
    }

    const razorpay = getRazorpayInstance();

    // Create the order on our side BEFORE the customer pays, so the payment can
    // be matched to it even if the browser never returns from Razorpay.
    let orderTotal = Number(amount);
    if (orderDetails && Array.isArray(orderDetails.items) && orderDetails.items.length > 0) {
      const user = await getCurrentUser();
      const pendingOrder = await ordersController.createOrder(
        {
          ...orderDetails,
          total: Number(amount),
          paymentVerified: false,
          discountCode: orderDetails.discountCode || discountCode || undefined,
          userId: user?.id || orderDetails.userId || null,
          customerName:
            orderDetails.customerName ||
            (orderDetails.firstName ? `${orderDetails.firstName} ${orderDetails.lastName || ""}`.trim() : user?.name),
          customerEmail: (orderDetails.customerEmail || orderDetails.email || user?.email)?.toLowerCase().trim(),
          customerPhone: (orderDetails.customerPhone || orderDetails.phone)?.replace(/[^0-9]/g, ""),
          internalNotes: `${RAZORPAY_PAYMENT_NOTE}\nAwaiting Razorpay payment`,
        },
        { deferStockDecrement: true }
      );
      pendingOrderId = pendingOrder.id;
      orderTotal = pendingOrder.total;

      if ("sessionToken" in pendingOrder && typeof pendingOrder.sessionToken === "string") {
        await setSessionCookie(pendingOrder.sessionToken);
      }
    }

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(orderTotal * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: (pendingOrderId || receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes: { ...(notes || {}), ...(pendingOrderId ? { order_id: pendingOrderId } : {}) },
    });

    if (pendingOrderId) {
      await attachRazorpayOrderId(pendingOrderId, order.id);
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      dbOrderId: pendingOrderId,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId,
    });
  } catch (error: unknown) {
    console.error("Razorpay order creation error details:", error);

    if (pendingOrderId) {
      await cancelPendingRazorpayOrder(pendingOrderId, "Razorpay checkout could not be started").catch(() => null);
    }

    const details = (error ?? {}) as { error?: { description?: string; reason?: string }; description?: string; message?: string };
    const rzpDescription =
      details.error?.description ||
      details.error?.reason ||
      details.description ||
      details.message ||
      "Failed to initialize Razorpay order";

    return NextResponse.json(
      {
        success: false,
        error: rzpDescription,
      },
      { status: 500 }
    );
  }
}
