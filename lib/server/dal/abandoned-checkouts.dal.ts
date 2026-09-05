import { db } from "@/lib/db";

export type AbandonedCheckoutItem = {
  productId: string;
  name: string;
  slug: string;
  image: string;
  category: string;
  quantity: number;
  unitPrice: number;
};

export type AbandonedCheckoutInput = {
  sessionToken: string;
  customerName?: string;
  email?: string;
  phone?: string;
  items: AbandonedCheckoutItem[];
  subtotal: number;
  total: number;
};

export function readAbandonedCheckoutItems(value: unknown): AbandonedCheckoutItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const entry = item as Record<string, unknown>;

    return typeof entry.productId === "string" &&
      typeof entry.name === "string" &&
      typeof entry.slug === "string" &&
      typeof entry.image === "string" &&
      typeof entry.category === "string" &&
      typeof entry.quantity === "number" &&
      typeof entry.unitPrice === "number"
      ? [{
          productId: entry.productId,
          name: entry.name,
          slug: entry.slug,
          image: entry.image,
          category: entry.category,
          quantity: entry.quantity,
          unitPrice: entry.unitPrice,
        }]
      : [];
  });
}

export async function saveAbandonedCheckout(data: AbandonedCheckoutInput) {
  const itemCount = data.items.reduce((total, item) => total + item.quantity, 0);

  return db.abandonedCheckout.upsert({
    where: { sessionToken: data.sessionToken },
    create: {
      ...data,
      itemCount,
    },
    update: {
      customerName: data.customerName,
      email: data.email,
      phone: data.phone,
      items: data.items,
      itemCount,
      subtotal: data.subtotal,
      total: data.total,
    },
  });
}

export async function markAbandonedCheckoutRecovered(sessionToken: string) {
  return db.abandonedCheckout.updateMany({
    where: { sessionToken, status: "OPEN" },
    data: { status: "RECOVERED", recoveredAt: new Date() },
  });
}

export async function getOpenAbandonedCheckouts() {
  return db.abandonedCheckout.findMany({
    where: { status: "OPEN" },
    orderBy: { lastActivityAt: "desc" },
  });
}

export async function getAbandonedCheckoutById(id: string) {
  return db.abandonedCheckout.findUnique({ where: { id } });
}
