import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import * as ordersController from "@/lib/server/controllers/orders.controller";
import { getCurrentUser, AuthError } from "@/lib/server/dal/auth";
import { setSessionCookie } from "@/lib/server/auth/session-utils";

// GET /api/orders?userId=
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized. Please log in to view and track orders." }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId") || undefined;
    const all = searchParams.get("all") === "true";

    if (queryUserId) {
      const orders = await ordersController.listOrders(queryUserId, undefined, user.email, user.phone || undefined);
      return NextResponse.json({ success: true, data: orders });
    }

    if (user.role === "ADMIN" && all) {
      const orders = await ordersController.listOrders();
      return NextResponse.json({ success: true, data: orders });
    }

    const orders = await ordersController.listOrders(user.id, undefined, user.email, user.phone || undefined);
    return NextResponse.json({ success: true, data: orders });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// POST /api/orders
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    const body = await request.json();

    const isCod = body.paymentMethod === "COD" || /\[Payment:\s*COD/i.test(body.shippingAddress || "");
    const internalNotes = isCod
      ? "Payment method: COD\nStatus: Cash on Delivery Verified"
      : (body.internalNotes || undefined);

    const cleanEmail = (body.customerEmail || body.email || user?.email)?.toLowerCase().trim();
    const cleanPhone = (body.customerPhone || body.phone || user?.phone)?.replace(/[^0-9]/g, "");

    const order = await ordersController.createOrder({
      ...body,
      discountCode: isCod ? undefined : body.discountCode,
      discountAmount: isCod ? 0 : body.discountAmount,
      status: "PENDING",
      paymentVerified: false,
      internalNotes,
      userId: user?.id || body.userId || null,
      customerName: body.customerName || (body.firstName ? `${body.firstName} ${body.lastName || ""}`.trim() : user?.name),
      customerEmail: cleanEmail,
      customerPhone: cleanPhone,
    });

    // If an account was automatically created during order placement, set session cookie
    if ((order as any).sessionToken) {
      await setSessionCookie((order as any).sessionToken);
    }

    // Trigger order confirmation email in background to customer and notify info@xelectron.com & customercare@xelectron.com
    if (order) {
      import("@/lib/server/mail").then(({ sendOrderConfirmationEmail }) => {
        sendOrderConfirmationEmail({
          id: order.id,
          customerName: order.customerName,
          customerEmail: order.customerEmail || body.email,
          customerPhone: order.customerPhone || cleanPhone,
          shippingAddress: order.shippingAddress || body.shippingAddress,
          city: order.city || body.city,
          state: order.state || body.state,
          pincode: order.pincode || body.pincode,
          paymentMethod: isCod ? "Cash on Delivery (COD)" : (body.paymentMethod || "COD"),
          total: order.total,
          trackingNumber: order.trackingNumber,
          trackingUrl: order.trackingUrl,
          estimatedDelivery: order.estimatedDelivery,
          items: order.items?.map((item: any) => ({
            name: item.product?.name || item.name || "Product",
            quantity: item.quantity,
            price: item.unitPrice,
            unitPrice: item.unitPrice,
          })),
        }).catch((err) => console.warn("Failed to send order email:", err));
      });
    }

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ success: false, error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : "Internal server error";
    const status = message.includes("Missing") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
