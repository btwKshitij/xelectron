import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getRazorpayInstance } from "@/lib/server/razorpay";
import { validateDealCheckout } from "@/lib/server/deal-checkout";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, receipt, notes, items, discountCode } = body;

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

    // Razorpay requires amount in paise (1 INR = 100 paise)
    const amountInPaise = Math.round(Number(amount) * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
      notes: notes || {},
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID?.trim() || keyId,
    });
  } catch (error: any) {
    console.error("Razorpay order creation error details:", error);

    const rzpDescription =
      error?.error?.description ||
      error?.error?.reason ||
      error?.description ||
      error?.message ||
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
