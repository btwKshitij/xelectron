import * as dealOfTheDayDal from "@/lib/server/dal/deal-of-the-day.dal";
import * as productsController from "@/lib/server/controllers/products.controller";

type SaveDealOfTheDayInput = {
  productId?: string;
  title?: string;
  description?: string;
  image?: string | null;
  dealPrice?: string | null;
  compareAtPrice?: string | null;
  badge?: string | null;
  features?: string[];
  unitsLeft?: number;
  totalUnits?: number;
  endsAt?: string;
  isActive?: boolean;
};

export function getDealOfTheDay() {
  return dealOfTheDayDal.getDealOfTheDay();
}

export function getActiveDealOfTheDay() {
  return dealOfTheDayDal.getActiveDealOfTheDay();
}

export async function saveDealOfTheDay(input: SaveDealOfTheDayInput) {
  const productId = input.productId?.trim();
  const title = input.title?.trim();
  const description = input.description?.trim();
  const dealPrice = input.dealPrice?.trim() || null;
  const compareAtPrice = input.compareAtPrice?.trim() || null;
  const unitsLeft = Number(input.unitsLeft);
  const totalUnits = Number(input.totalUnits);
  const endsAt = input.endsAt ? new Date(input.endsAt) : null;

  if (!productId || !title || !description) {
    throw new Error("Choose a product and enter the deal title and description");
  }
  if ((dealPrice && dealPrice.length > 50) || (compareAtPrice && compareAtPrice.length > 50)) {
    throw new Error("Price values must be 50 characters or fewer");
  }
  if (!Number.isSafeInteger(unitsLeft) || !Number.isSafeInteger(totalUnits) || unitsLeft < 0 || totalUnits <= 0 || unitsLeft > totalUnits) {
    throw new Error("Enter valid units left and total deal units");
  }
  if (!endsAt || Number.isNaN(endsAt.getTime())) {
    throw new Error("Choose a valid deal end date and time");
  }

  const product = await productsController.getProduct(productId);
  if (!product) throw new Error("Selected product was not found");

  const features = Array.isArray(input.features)
    ? input.features.map((feature) => feature.trim()).filter(Boolean).slice(0, 8)
    : [];

  return dealOfTheDayDal.saveDealOfTheDay({
    productId: product.id,
    title,
    description,
    image: input.image?.trim() || null,
    dealPrice,
    compareAtPrice,
    badge: input.badge?.trim() || null,
    features,
    unitsLeft,
    totalUnits,
    endsAt,
    isActive: Boolean(input.isActive),
  });
}
