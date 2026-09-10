import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";
import { isOrderPaidOrCod, paidOrCodOrderPrismaFilter } from "@/lib/server/orders-filter";

// ─── Queries ─────────────────────────────────────────────────────────────────

export async function getAllOrders() {
  const orders = await db.order.findMany({
    where: paidOrCodOrderPrismaFilter,
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, mainImage: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.filter(isOrderPaidOrCod);
}

export async function getOrderById(id: string) {
  return db.order.findUnique({
    where: { id },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: {
            select: { id: true, name: true, mainImage: true, slug: true, price: true },
          },
        },
      },
    },
  });
}

export async function getOrdersByUserId(userId: string, email?: string, phone?: string) {
  const cleanEmail = email?.trim().toLowerCase();
  const cleanPhone = phone?.replace(/[^0-9]/g, "");

  // Link any unlinked orders with this email/phone to the user ID
  if (cleanEmail || (cleanPhone && cleanPhone.length >= 10)) {
    try {
      await db.order.updateMany({
        where: {
          userId: null,
          OR: [
            ...(cleanEmail ? [{ customerEmail: { equals: cleanEmail, mode: "insensitive" as const } }] : []),
            ...(cleanPhone && cleanPhone.length >= 10 ? [{ customerPhone: { contains: cleanPhone } }] : []),
          ],
        },
        data: {
          userId,
        },
      });
    } catch {}
  }

  const conditions: Prisma.OrderWhereInput[] = [{ userId }];
  if (cleanEmail) {
    conditions.push({ customerEmail: { equals: cleanEmail, mode: "insensitive" as const } });
  }
  if (cleanPhone && cleanPhone.length >= 10) {
    conditions.push({ customerPhone: { contains: cleanPhone } });
  }

  const orders = await db.order.findMany({
    where: {
      AND: [
        paidOrCodOrderPrismaFilter,
        { OR: conditions },
      ],
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, mainImage: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.filter(isOrderPaidOrCod);
}

export async function getOrdersByEmailOrPhone(contact: string) {
  const clean = contact.trim().toLowerCase();
  const orders = await db.order.findMany({
    where: {
      AND: [
        paidOrCodOrderPrismaFilter,
        {
          OR: [
            { customerEmail: { equals: clean, mode: "insensitive" } },
            { customerPhone: { contains: clean.replace(/[^0-9]/g, "") } },
          ],
        },
      ],
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, mainImage: true, slug: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return orders.filter(isOrderPaidOrCod);
}

// ─── Mutations ───────────────────────────────────────────────────────────────

export type CreateOrderInput = {
  userId?: string | null;
  total: number;
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  country?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
  paymentVerified?: boolean;
  phone?: string;
  discountCode?: string;
  items: {
    productId: string;
    quantity: number;
    unitPrice: number;
  }[];
  createAccount?: boolean;
  password?: string;
};

export async function createOrder(data: CreateOrderInput) {
  return db.order.create({
    data: {
      userId: data.userId || null,
      total: data.total,
      shippingAddress: data.shippingAddress,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone || data.phone,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      country: data.country || "India",
      shippingCarrier: data.shippingCarrier,
      trackingNumber: data.trackingNumber,
      trackingUrl: data.trackingUrl,
      estimatedDelivery: data.estimatedDelivery,
      internalNotes: data.internalNotes,
      paymentVerified: data.paymentVerified === true,
      items: {
        create: data.items.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      },
    },
    include: {
      items: {
        include: {
          product: { select: { id: true, name: true, mainImage: true, slug: true } },
        },
      },
    },
  });
}

export async function updateOrderStatus(
  id: string,
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED"
) {
  return db.order.update({
    where: { id },
    data: { status },
  });
}

export type UpdateOrderInput = {
  status?: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  paymentVerified?: boolean;
  shippingAddress?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  city?: string;
  state?: string;
  pincode?: string;
  shippingCarrier?: string;
  trackingNumber?: string;
  trackingUrl?: string;
  estimatedDelivery?: string;
  internalNotes?: string;
};

export async function updateOrder(id: string, data: UpdateOrderInput) {
  if (data.trackingNumber !== undefined || data.shippingCarrier !== undefined) {
    const current = await db.order.findUnique({ where: { id }, select: { deliveryBooking: true, trackingNumber: true, shippingCarrier: true } });
    if (current?.deliveryBooking && (
      (data.trackingNumber !== undefined && data.trackingNumber !== (current.trackingNumber || "")) ||
      (data.shippingCarrier !== undefined && data.shippingCarrier !== (current.shippingCarrier || ""))
    )) throw new Error("This order has a Delhivery booking. Its courier and AWB cannot be replaced manually.");
  }
  return db.order.update({
    where: { id },
    data: {
      ...(data.status ? { status: data.status } : {}),
      ...(data.paymentVerified !== undefined ? { paymentVerified: data.paymentVerified } : {}),
      ...(data.shippingAddress !== undefined ? { shippingAddress: data.shippingAddress } : {}),
      ...(data.customerName !== undefined ? { customerName: data.customerName } : {}),
      ...(data.customerEmail !== undefined ? { customerEmail: data.customerEmail } : {}),
      ...(data.customerPhone !== undefined ? { customerPhone: data.customerPhone } : {}),
      ...(data.city !== undefined ? { city: data.city } : {}),
      ...(data.state !== undefined ? { state: data.state } : {}),
      ...(data.pincode !== undefined ? { pincode: data.pincode } : {}),
      ...(data.shippingCarrier !== undefined ? { shippingCarrier: data.shippingCarrier } : {}),
      ...(data.trackingNumber !== undefined ? { trackingNumber: data.trackingNumber } : {}),
      ...(data.trackingUrl !== undefined ? { trackingUrl: data.trackingUrl } : {}),
      ...(data.estimatedDelivery !== undefined ? { estimatedDelivery: data.estimatedDelivery } : {}),
      ...(data.internalNotes !== undefined ? { internalNotes: data.internalNotes } : {}),
    },
    include: {
      user: { select: { id: true, name: true, email: true, phone: true } },
      items: {
        include: {
          product: { select: { id: true, name: true, mainImage: true, slug: true, price: true } },
        },
      },
    },
  });
}

export async function deleteOrder(id: string) {
  return db.order.delete({ where: { id } });
}

export async function countOrders() {
  return db.order.count({
    where: paidOrCodOrderPrismaFilter,
  });
}
