import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function getAllReviews(options?: {
  productId?: string;
  isApproved?: boolean;
}) {
  const where: any = {};
  if (options?.productId) {
    where.productId = options.productId;
  }
  if (typeof options?.isApproved === "boolean") {
    where.isApproved = options.isApproved;
  }

  return db.productReview.findMany({
    where,
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          mainImage: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getReviewsByProductId(productId: string) {
  return db.productReview.findMany({
    where: { productId, isApproved: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function createReview(data: {
  author: string;
  rating: number;
  content: string;
  title?: string;
  image?: string;
  imageCount?: number;
  verified?: boolean;
  productId: string;
  date?: string;
}) {
  const review = await db.productReview.create({
    data: {
      author: data.author,
      rating: data.rating,
      content: data.content,
      title: data.title || null,
      image: data.image || null,
      imageCount: data.imageCount || (data.image ? 1 : 0),
      verified: typeof data.verified === "boolean" ? data.verified : true,
      date: data.date || new Date().toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
      productId: data.productId,
      isApproved: true,
    },
    include: {
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  // Update product reviews count and rating in background
  try {
    const allProductReviews = await db.productReview.findMany({
      where: { productId: data.productId, isApproved: true },
      select: { rating: true },
    });
    if (allProductReviews.length > 0) {
      const avgRating =
        allProductReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
        allProductReviews.length;
      await db.product.update({
        where: { id: data.productId },
        data: {
          rating: Number(avgRating.toFixed(1)),
          reviewsCount: String(allProductReviews.length),
        },
      });
    }
  } catch {}

  return review;
}

export async function deleteReview(id: string) {
  const review = await db.productReview.delete({
    where: { id },
  });

  // Update product review stats
  try {
    const allProductReviews = await db.productReview.findMany({
      where: { productId: review.productId, isApproved: true },
      select: { rating: true },
    });
    const avgRating =
      allProductReviews.length > 0
        ? allProductReviews.reduce((sum: number, r: any) => sum + r.rating, 0) /
          allProductReviews.length
        : 5;
    await db.product.update({
      where: { id: review.productId },
      data: {
        rating: Number(avgRating.toFixed(1)),
        reviewsCount: String(allProductReviews.length),
      },
    });
  } catch {}

  return review;
}

export async function updateReview(
  id: string,
  data: Prisma.ProductReviewUpdateInput
) {
  return db.productReview.update({
    where: { id },
    data,
  });
}
