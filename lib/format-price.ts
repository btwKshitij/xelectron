/** Formats dashboard price values for the Indian storefront (for example ₹17,999.00). */
export function formatINR(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "";

  const rawValue = String(value).trim();
  const numericText = rawValue.replace(/[^\d.]/g, "");
  const numericValue = Number(numericText);

  if (!numericText || !Number.isFinite(numericValue)) {
    return rawValue.startsWith("₹") ? rawValue : `₹${rawValue}`;
  }

  const decimalPlaces = rawValue.match(/\.(\d+)/)?.[1]?.length ?? 0;
  const fractionDigits = Math.min(decimalPlaces, 2);

  return `₹${numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

export function parsePriceNumber(value: string | number | null | undefined): number {
  if (value === null || value === undefined || value === "") return 0;
  const numericText = String(value).replace(/[^\d.]/g, "");
  const num = Number(numericText);
  return Number.isFinite(num) ? num : 0;
}
