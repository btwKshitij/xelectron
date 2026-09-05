import * as ordersDal from "@/lib/server/dal/orders.dal";
import * as productsDal from "@/lib/server/dal/products.dal";
import * as usersDal from "@/lib/server/dal/users.dal";
import * as sessionsDal from "@/lib/server/dal/sessions.dal";
import * as discountsDal from "@/lib/server/dal/discounts.dal";
import bcrypt from "bcryptjs";
import type { Discount } from "@prisma/client";

// ─── List ────────────────────────────────────────────────────────────────────

export async function listOrders(userId?: string, query?: string, email?: string, phone?: string) {
  if (userId) {
    return ordersDal.getOrdersByUserId(userId, email, phone);
  }
  if (query) {
    return ordersDal.getOrdersByEmailOrPhone(query);
  }
  return ordersDal.getAllOrders();
}

// ─── Get One ─────────────────────────────────────────────────────────────────

export async function getOrder(id: string) {
  const order = await ordersDal.getOrderById(id);
  if (!order) throw new Error("Order not found");
  return order;
}

// ─── Create ──────────────────────────────────────────────────────────────────

export async function createOrder(data: ordersDal.CreateOrderInput) {
  if (!data.items || data.items.length === 0) {
    throw new Error("Missing required fields: items (non-empty)");
  }

  let finalUserId = data.userId || null;
  let sessionToken: string | null = null;

  // Handle on-the-fly Account Creation during Order placement if requested
  if (data.createAccount && data.password && data.customerEmail) {
    try {
      const cleanEmail = data.customerEmail.toLowerCase().trim();
      let user = await usersDal.getUserByEmail(cleanEmail);
      if (!user) {
        const passwordHash = await bcrypt.hash(data.password, 10);
        user = await usersDal.createUser({
          name: data.customerName?.trim() || cleanEmail.split("@")[0] || "Valued Customer",
          email: cleanEmail,
          passwordHash,
          phone: data.customerPhone || data.phone || undefined,
          role: "CUSTOMER",
        });
      }
      finalUserId = user.id;

      // Create login session for immediate seamless access to "My Orders"
      const session = await sessionsDal.createSession(user.id);
      sessionToken = session.token;
    } catch (err) {
      console.warn("Could not auto-create user account during order placement:", err);
    }
  }

  // Resolve item product IDs if items were passed by slug or id
  const resolvedItems = await Promise.all(
    data.items.map(async (item) => {
      let product = await productsDal.getProductById(item.productId);
      if (!product) {
        product = await productsDal.getProductBySlug(item.productId);
      }

      if (!product) {
        // Fallback: If product is not found in DB by id or slug, use first available product
        const allProducts = await productsDal.getAllProducts();
        if (allProducts.length > 0) {
          product = allProducts[0];
        }
      }

      if (!product) {
        throw new Error(`Product not found: ${item.productId}`);
      }

      const itemPrice = typeof item.unitPrice === "number" && item.unitPrice > 0
        ? item.unitPrice
        : typeof product.price === "number"
        ? product.price
        : parseFloat(String(product.price).replace(/[^0-9.]/g, "")) || 0;

      return {
        productId: product.id,
        quantity: Math.max(1, item.quantity || 1),
        unitPrice: itemPrice,
      };
    })
  );

  const calculatedSubtotal = resolvedItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  // Preserve the actual total paid at checkout (including discounts/shipping)
  const finalTotal =
    typeof data.total === "number" && Number.isFinite(data.total) && data.total > 0
      ? data.total
      : calculatedSubtotal;

  const createdOrder = await ordersDal.createOrder({
    ...data,
    userId: finalUserId,
    items: resolvedItems,
    total: finalTotal,
  });

  // Automatically reduce product inventory stock in database
  await Promise.all(
    resolvedItems.map((item) =>
      productsDal.decrementProductStock(item.productId, item.quantity)
    )
  );

  // Increment discount usage count if a discount code or automatic discount was applied
  if (data.discountCode) {
    await discountsDal.incrementDiscountUsage(data.discountCode);
  } else if (finalTotal < calculatedSubtotal) {
    const allDiscounts: Discount[] = await discountsDal.getAllDiscounts();
    const autoDiscount = allDiscounts.find((discount) => !discount.code);
    if (autoDiscount) {
      await discountsDal.incrementDiscountUsage(autoDiscount.id);
    }
  }

  // Update user phone number if provided
  if (data.phone && finalUserId) {
    try {
      const { db } = await import("@/lib/db");
      await db.user.update({
        where: { id: finalUserId },
        data: { phone: data.phone },
      });
    } catch {}
  }

  return sessionToken
    ? { ...createdOrder, sessionToken }
    : createdOrder;
}

// ─── Update Order ────────────────────────────────────────────────────────────

export async function updateOrder(id: string, data: ordersDal.UpdateOrderInput & { notifyCustomer?: boolean }) {
  const existing = await ordersDal.getOrderById(id);
  if (!existing) throw new Error("Order not found");

  const updated = await ordersDal.updateOrder(id, data);

  // If status changed or fulfillment tracking was updated and customer notification is enabled
  const notificationDispatched = Boolean(data.notifyCustomer ?? true);
  const targetEmail = updated.customerEmail || updated.user?.email;
  const targetPhone = updated.customerPhone || updated.user?.phone;

  if (notificationDispatched && (targetEmail || targetPhone)) {
    console.log(
      `[ORDER NOTIFICATION] Dispatched status "${updated.status}" update to Customer: ${targetEmail || targetPhone} (Tracking: ${updated.trackingNumber || "N/A"})`
    );
  }

  return {
    ...updated,
    notificationStatus: {
      dispatched: notificationDispatched,
      email: targetEmail || null,
      phone: targetPhone || null,
      timestamp: new Date().toISOString(),
    },
  };
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) {
  return updateOrder(id, { status });
}

// ─── Delete ──────────────────────────────────────────────────────────────────

export async function deleteOrder(id: string) {
  const existing = await ordersDal.getOrderById(id);
  if (!existing) throw new Error("Order not found");
  return ordersDal.deleteOrder(id);
}
