export function isExtendedWarrantyCategory(
  category: string | { slug?: string | null; title?: string | null } | null | undefined,
): boolean {
  const values = typeof category === "string" ? [category] : [category?.slug, category?.title];
  return values.some((value) => value?.trim().toLowerCase().replace(/[\s_]+/g, "-") === "extended-warranty");
}

export class CodNotAvailableError extends Error {
  constructor() {
    super("Cash on Delivery is not available for Extended Warranty products. Please choose an online payment method.");
  }
}
