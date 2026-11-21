export function isOnlinePaymentOnlyCategory(
  category: string | { slug?: string | null; title?: string | null } | null | undefined,
): boolean {
  const values = typeof category === "string" ? [category] : [category?.slug, category?.title];
  return values.some((value) => ["extended-warranty", "remote-controls"].includes(
    value?.trim().toLowerCase().replace(/[\s_]+/g, "-") || "",
  ));
}

export const COD_UNAVAILABLE_MESSAGE = "Remote Controls and Extended Warranty products require online payment. Cash on Delivery is unavailable for this order.";

export class CodNotAvailableError extends Error {
  constructor() {
    super(COD_UNAVAILABLE_MESSAGE);
  }
}
