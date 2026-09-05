import { db } from "@/lib/db";
import * as abandonedCheckoutsDal from "@/lib/server/dal/abandoned-checkouts.dal";

type CartLine = { id?: unknown; quantity?: unknown };

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function parsePrice(value: string) {
  const parsed = Number(value.replace(/[^\d.]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function trackAbandonedCheckout(data: unknown) {
  if (!data || typeof data !== "object") throw new Error("Invalid checkout data");

  const payload = data as Record<string, unknown>;
  const sessionToken = cleanText(payload.sessionToken, 128);
  const lines = Array.isArray(payload.items) ? payload.items.slice(0, 100) as CartLine[] : [];

  if (sessionToken.length < 16) throw new Error("Invalid checkout session");
  if (lines.length === 0) throw new Error("A checkout needs at least one product");

  const quantities = new Map<string, number>();
  for (const line of lines) {
    const productId = cleanText(line?.id, 128);
    const quantity = Number(line?.quantity);
    if (productId && Number.isInteger(quantity) && quantity > 0) {
      quantities.set(productId, Math.min(99, (quantities.get(productId) ?? 0) + quantity));
    }
  }

  const products = await db.product.findMany({
    where: { id: { in: [...quantities.keys()] } },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      mainImage: true,
      category: { select: { title: true } },
    },
  });

  const items = products.flatMap((product: any) => {
    const quantity = quantities.get(product.id);
    if (!quantity) return [];

    return [{
      productId: product.id,
      name: product.name,
      slug: product.slug,
      image: product.mainImage,
      category: product.category.title,
      quantity,
      unitPrice: parsePrice(product.price),
    }];
  });

  if (items.length === 0) throw new Error("No valid products were found for this checkout");

  const subtotal = items.reduce((total: number, item: any) => total + item.unitPrice * item.quantity, 0);
  return abandonedCheckoutsDal.saveAbandonedCheckout({
    sessionToken,
    customerName: cleanText(payload.customerName, 160) || undefined,
    email: cleanText(payload.email, 320) || undefined,
    phone: cleanText(payload.phone, 40) || undefined,
    items,
    subtotal,
    total: subtotal,
  });
}

export async function recoverAbandonedCheckout(sessionToken: unknown) {
  const value = cleanText(sessionToken, 128);
  if (value.length < 16) throw new Error("Invalid checkout session");
  return abandonedCheckoutsDal.markAbandonedCheckoutRecovered(value);
}

export async function listOpenAbandonedCheckouts() {
  return abandonedCheckoutsDal.getOpenAbandonedCheckouts();
}

export async function getAbandonedCheckout(id: string) {
  const checkout = await abandonedCheckoutsDal.getAbandonedCheckoutById(id);
  if (!checkout) throw new Error("Abandoned checkout not found");
  return checkout;
}
