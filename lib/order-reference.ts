/** Shared display reference; retain the full database ID for lookups and links. */
export function formatOrderReference(orderId: string): string {
  return `XE-${orderId.slice(-8).toUpperCase()}`;
}
