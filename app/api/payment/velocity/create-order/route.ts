import { NextRequest, NextResponse } from "next/server";
import {
  assertVelocityConfig,
  createVelocityOrder,
  buildVelocityRedirectUrl,
  createVelocityStateToken,
} from "@/lib/server/velocity";
import * as ordersDal from "@/lib/server/dal/orders.dal";
import * as usersDal from "@/lib/server/dal/users.dal";

type CheckoutItem = {
  id?: string;
  productId?: string;
  name?: string;
  price?: number;
  unitPrice?: number;
  quantity?: number;
  product?: { name?: string };
};

type VelocityCheckoutRequest = {
  userId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  addressLine1?: string;
  addressLine2?: string;
  items?: CheckoutItem[];
  total?: number;
  discountAmount?: number;
  discountCode?: string;
  shippingAddress?: string;
  createAccount?: boolean;
  password?: string;
  emiTenure?: number;
};

export async function POST(request: NextRequest) {
  let createdOrderId: string | null = null;
  let velocityOrderCreated = false;

  try {
    const body = (await request.json()) as VelocityCheckoutRequest;
    const {
      userId,
      customerName,
      customerEmail,
      customerPhone,
      city,
      state,
      pincode,
      addressLine1,
      addressLine2,
      items,
      total,
      discountAmount = 0,
      discountCode,
      shippingAddress,
      createAccount,
      password,
      emiTenure,
    } = body;
    const orderTotal = typeof total === "number" ? total : Number.NaN;
    const preferredEmiTenure = [3, 6, 9, 12].includes(emiTenure || 0) ? emiTenure : undefined;

    if (
      !customerEmail ||
      !customerPhone ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !Number.isFinite(orderTotal) ||
      items.some((item) => !(item.productId || item.id))
    ) {
      return NextResponse.json(
        { success: false, error: "Invalid checkout details or empty items." },
        { status: 400 }
      );
    }

    // Validate credentials before creating an internal order.
    assertVelocityConfig();

    // 1. Account creation if requested
    let finalUserId = userId || null;
    if (!finalUserId && createAccount && customerEmail && password) {
      try {
        const cleanEmail = customerEmail.toLowerCase().trim();
        let user = await usersDal.getUserByEmail(cleanEmail);
        if (!user) {
          const bcrypt = await import("bcryptjs");
          const passwordHash = await bcrypt.hash(password, 10);
          user = await usersDal.createUser({
            name: customerName?.trim() || cleanEmail.split("@")[0] || "Valued Customer",
            email: cleanEmail,
            passwordHash,
            phone: customerPhone,
            role: "CUSTOMER",
          });
        }
        finalUserId = user.id;
      } catch (err) {
        console.warn("Auto-account creation skipped during Velocity checkout:", err);
      }
    }

    // 2. Create the initial pending order. Tracking is added by an admin only
    // after the shipment is prepared, so customers never receive a fake AWB.
    const fullAddress = shippingAddress || [addressLine1, addressLine2, city, state, pincode]
      .filter(Boolean)
      .join(", ");

    const createdOrder = await ordersDal.createOrder({
      userId: finalUserId,
      total: Math.round(orderTotal),
      customerName: customerName || "Customer",
      customerEmail,
      customerPhone,
      shippingAddress: fullAddress,
      city: city || "",
      state: state || "",
      pincode: pincode || "",
      country: "India",
      internalNotes: `Payment method: VELOCITY_BNPL${preferredEmiTenure ? `\nEMI preference: ${preferredEmiTenure} months` : ""}`,
      items: items.map((item) => ({
        productId: item.productId || item.id || "",
        quantity: item.quantity || 1,
        unitPrice: Number(item.unitPrice || item.price || 0),
      })),
    });
    createdOrderId = createdOrder.id;

    // 3. Build Velocity Payload
    const cleanPhone = (customerPhone || "").replace(/[^0-9]/g, "").slice(-10);
    const origin =
      process.env.VELOCITY_REDIRECT_URI ||
      request.headers.get("origin") ||
      process.env.NEXTAUTH_URL ||
      "http://localhost:3000";

    const velocityPayload = {
      order_id: createdOrder.id,
      customer: {
        name: customerName || "Customer",
        email: customerEmail,
        phone: cleanPhone,
        address: {
          address_line_1: addressLine1 || "Address Line 1",
          address_line_2: addressLine2 || undefined,
          city: city || "City",
          state: state || "State",
          country: "India",
          zip: pincode || "110001",
        },
      },
      order_details: {
        total_price: Math.round(orderTotal),
        total_discount: Math.round(discountAmount) || 0,
        total_tax: 0,
        line_items: items.map((item) => {
          const unitP = Number(item.unitPrice || item.price || 0);
          const qty = Number(item.quantity || 1);
          return {
            name: item.name || item.product?.name || "Product",
            unit_price: Math.round(unitP),
            quantity: qty,
            total_price: Math.round(unitP * qty),
          };
        }),
      },
      notes: [
        discountCode ? `Coupon applied: ${discountCode}` : null,
        preferredEmiTenure ? `EMI preference: ${preferredEmiTenure} months` : null,
      ].filter(Boolean).join("\n") || undefined,
    };

    // 5. Call Velocity API to create order
    const velocityRes = await createVelocityOrder(velocityPayload);
    velocityOrderCreated = true;

    await ordersDal.updateOrder(createdOrder.id, {
      internalNotes: `${createdOrder.internalNotes || "Payment method: VELOCITY_BNPL"}\nVelocity Order ID: ${velocityRes.velocity_order_id}`,
    });

    // 6. Build Hosted Checkout Redirection URL
    const stateToken = createVelocityStateToken(createdOrder.id);
    const redirectUri = process.env.VELOCITY_REDIRECT_URI || `${origin}/checkout/velocity-callback`;

    const redirectUrl = buildVelocityRedirectUrl({
      velocityOrderId: velocityRes.velocity_order_id,
      stateToken,
      redirectUri,
    });

    return NextResponse.json({
      success: true,
      orderId: createdOrder.id,
      velocityOrderId: velocityRes.velocity_order_id,
      redirectUrl,
    });
  } catch (error) {
    // If Velocity rejected order creation, cancel the internal placeholder so it
    // can never be mistaken for an unpaid order awaiting a real payment.
    if (createdOrderId && !velocityOrderCreated) {
      try {
        await ordersDal.updateOrder(createdOrderId, {
          status: "CANCELLED",
          internalNotes: "Payment method: VELOCITY_BNPL\nVelocity checkout initialization failed.",
        });
      } catch (cleanupError) {
        console.error("Unable to cancel failed Velocity order:", cleanupError);
      }
    }
    const message =
      error instanceof Error ? error.message : "Failed to initialize Velocity BNPL order";
    console.error("Velocity Order Init Error:", error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
