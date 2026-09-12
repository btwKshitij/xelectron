import * as dal from "@/lib/server/dal/verified-reviews.dal";

export type VerifiedReviewItem = {
  id: string;
  name: string;
  product: string;
  avatar: string;
  text: string;
  rating: number;
  size: "sm" | "md" | "lg";
  cardSide: "left" | "right";
  desktopTop: string;
  desktopLeft: string;
  mobileTop: string;
  mobileLeft: string;
  desktopPos: { top: string; left: string };
  mobilePos: { top: string; left: string };
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

function formatReview(r: dal.VerifiedReviewEntity): VerifiedReviewItem {
  return {
    id: r.id,
    name: r.name,
    product: r.product,
    avatar: r.avatar,
    text: r.text,
    rating: r.rating,
    size: r.size,
    cardSide: r.cardSide,
    desktopTop: r.desktopTop,
    desktopLeft: r.desktopLeft,
    mobileTop: r.mobileTop,
    mobileLeft: r.mobileLeft,
    desktopPos: { top: r.desktopTop, left: r.desktopLeft },
    mobilePos: { top: r.mobileTop, left: r.mobileLeft },
    sortOrder: r.sortOrder,
    isActive: r.isActive,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
  };
}

export async function listVerifiedReviews(): Promise<VerifiedReviewItem[]> {
  const items = await dal.getAllVerifiedReviews(false);
  return items.map(formatReview);
}

export async function listActiveVerifiedReviews(): Promise<VerifiedReviewItem[]> {
  const items = await dal.getAllVerifiedReviews(true);
  return items.map(formatReview);
}

export async function getVerifiedReview(id: string): Promise<VerifiedReviewItem | null> {
  const item = await dal.getVerifiedReviewById(id);
  return item ? formatReview(item) : null;
}

export async function createVerifiedReview(data: {
  name: string;
  product: string;
  avatar: string;
  text: string;
  rating?: number;
  size?: "sm" | "md" | "lg";
  cardSide?: "left" | "right";
  desktopTop?: string;
  desktopLeft?: string;
  mobileTop?: string;
  mobileLeft?: string;
  sortOrder?: number;
  isActive?: boolean;
}): Promise<VerifiedReviewItem> {
  const created = await dal.createVerifiedReview(data);
  return formatReview(created);
}

export async function updateVerifiedReview(
  id: string,
  data: Partial<{
    name: string;
    product: string;
    avatar: string;
    text: string;
    rating: number;
    size: "sm" | "md" | "lg";
    cardSide: "left" | "right";
    desktopTop: string;
    desktopLeft: string;
    mobileTop: string;
    mobileLeft: string;
    sortOrder: number;
    isActive: boolean;
  }>
): Promise<VerifiedReviewItem> {
  const updated = await dal.updateVerifiedReview(id, data);
  return formatReview(updated);
}

export async function deleteVerifiedReview(id: string): Promise<{ id: string }> {
  return dal.deleteVerifiedReview(id);
}

export async function resetVerifiedReviewsToDefaults(): Promise<VerifiedReviewItem[]> {
  const seeded = await dal.seedVerifiedReviewsDefaults();
  return seeded.map(formatReview);
}
