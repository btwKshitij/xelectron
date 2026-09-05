/**
 * The home-page offer shown before an administrator saves a custom deal.
 * Both the storefront and dashboard import this so the content stays in sync.
 */
export const defaultDealOfTheDay = {
  productSlug: "techno-projector",
  title: "BLAZE B2000",
  description: "Powerhouse home audio system designed to turn your living room into a cinematic experience.",
  image: "/deal-soundbar.png",
  dealPrice: "₹ 14,999",
  compareAtPrice: "₹ 32,999",
  badge: "DOLBY AUDIO",
  features: ["DOLBY AUDIO", "900W", "5.2 CHANNEL", "3D SURROUND"],
  unitsLeft: 16,
  totalUnits: 114,
} as const;
