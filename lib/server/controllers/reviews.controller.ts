import * as reviewsDal from "@/lib/server/dal/reviews.dal";
import * as productsDal from "@/lib/server/dal/products.dal";

export async function listReviews(options?: {
  productId?: string;
  isApproved?: boolean;
}) {
  return reviewsDal.getAllReviews(options);
}

export async function getProductReviews(productIdOrSlug: string) {
  let productId = productIdOrSlug;
  // If slug was passed, look up product id
  if (!productId.startsWith("c") && productId.length !== 25) {
    const prod = await productsDal.getProductBySlug(productIdOrSlug);
    if (prod) {
      productId = prod.id;
    }
  }
  return reviewsDal.getReviewsByProductId(productId);
}

export async function createProductReview(
  productIdOrSlug: string,
  data: {
    author: string;
    rating: number;
    content: string;
    title?: string;
    image?: string;
    imageCount?: number;
    verified?: boolean;
    date?: string;
  }
) {
  if (!data.author?.trim() || !data.content?.trim()) {
    throw new Error("Missing required review fields: author, content");
  }

  let productId = productIdOrSlug;
  // If slug was passed, find product ID
  const prod = await productsDal.getProductById(productIdOrSlug);
  if (prod) {
    productId = prod.id;
  } else {
    const prodBySlug = await productsDal.getProductBySlug(productIdOrSlug);
    if (prodBySlug) {
      productId = prodBySlug.id;
    }
  }

  return reviewsDal.createReview({
    ...data,
    productId,
    rating: Math.max(1, Math.min(5, Number(data.rating) || 5)),
  });
}

export async function deleteProductReview(id: string) {
  return reviewsDal.deleteReview(id);
}

export async function updateProductReview(id: string, data: any) {
  return reviewsDal.updateReview(id, data);
}
