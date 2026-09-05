import { db } from "@/lib/db";

export type SaveDealOfTheDayData = {
  productId: string;
  title: string;
  description: string;
  image: string | null;
  dealPrice: string | null;
  compareAtPrice: string | null;
  badge: string | null;
  features: string[];
  unitsLeft: number;
  totalUnits: number;
  endsAt: Date;
  isActive: boolean;
};

const dealInclude = {
  product: {
    select: {
      id: true,
      slug: true,
      name: true,
      price: true,
      oldPrice: true,
      mainImage: true,
      description: true,
      shippingNotice: true,
    },
  },
} as const;

export function getDealOfTheDay() {
  return db.dealOfTheDay.findUnique({
    where: { id: "default" },
    include: dealInclude,
  });
}

export function getActiveDealOfTheDay() {
  return db.dealOfTheDay.findFirst({
    where: { id: "default", isActive: true, endsAt: { gt: new Date() } },
    include: dealInclude,
  });
}

export function saveDealOfTheDay(data: SaveDealOfTheDayData) {
  return db.dealOfTheDay.upsert({
    where: { id: "default" },
    update: data,
    create: { id: "default", ...data },
    include: dealInclude,
  });
}
