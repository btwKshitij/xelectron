import { Suspense } from "react";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import ProductDetail from "@/components/product/product-detail";
import type { SimilarProductCard } from "@/lib/products-data";
import * as productsController from "@/lib/server/controllers/products.controller";
import * as dealOfTheDayController from "@/lib/server/controllers/deal-of-the-day.controller";
import * as reviewsController from "@/lib/server/controllers/reviews.controller";
import { parsePriceNumber } from "@/lib/format-price";

interface DynamicProductPageProps {
  params: Promise<{ id: string }>;
}

export const revalidate = 60;

export default async function DynamicProductPage({ params }: DynamicProductPageProps) {
  const { id } = await params;
  const [dbProduct, activeDeal, dbReviews] = await Promise.all([
    productsController.getProduct(id).catch(() => null),
    dealOfTheDayController.getActiveDealOfTheDay().catch(() => null),
    reviewsController.getProductReviews(id).catch(() => []),
  ]);

  if (!dbProduct) notFound();

  const isDealActiveForProduct = activeDeal && dbProduct && (activeDeal.productId === dbProduct.id || activeDeal.product.slug === dbProduct.slug);
  let effectivePrice = isDealActiveForProduct && activeDeal.dealPrice ? activeDeal.dealPrice : dbProduct?.price;
  let effectiveOldPrice = isDealActiveForProduct
    ? (activeDeal.compareAtPrice || (dbProduct && dbProduct.price !== effectivePrice ? dbProduct.price : dbProduct?.oldPrice))
    : dbProduct?.oldPrice;

  const dashboardProducts = dbProduct ? await productsController.listProducts().catch(() => []) : [];
  const relatedProducts: SimilarProductCard[] = dbProduct
    ? [
        ...dashboardProducts.filter(
          (relatedProduct: any) =>
            relatedProduct.id !== dbProduct.id &&
            relatedProduct.category?.slug === dbProduct.category?.slug,
        ),
        ...dashboardProducts.filter(
          (relatedProduct: any) =>
            relatedProduct.id !== dbProduct.id &&
            relatedProduct.category?.slug !== dbProduct.category?.slug,
        ),
      ]
        .slice(0, 4)
        .map((relatedProduct: any) => ({
          id: relatedProduct.id,
          slug: relatedProduct.slug,
          name: relatedProduct.name,
          category: relatedProduct.category?.title || "XElectron",
          price: relatedProduct.price,
          oldPrice: relatedProduct.oldPrice,
          discount: relatedProduct.discount,
          image: relatedProduct.mainImage || relatedProduct.media[0]?.url || "/category-smartphone.png",
          alt: relatedProduct.name,
          swatches: relatedProduct.colors.map((color: any) => color.bgHex).slice(0, 3),
        }))
    : [];

  const product = {
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        category: dbProduct.category?.title || "Electronics",
        categorySlug: dbProduct.category?.slug || "general",
        price: effectivePrice || dbProduct.price,
        oldPrice: effectiveOldPrice || undefined,
        discount:
          isDealActiveForProduct && effectivePrice && effectiveOldPrice && parsePriceNumber(effectiveOldPrice) > parsePriceNumber(effectivePrice)
            ? `${Math.round((1 - parsePriceNumber(effectivePrice) / parsePriceNumber(effectiveOldPrice)) * 100)}% off`
            : (dbProduct.discount || undefined),
        rating: dbProduct.rating,
        reviewsCount: `${dbProduct.reviewsCount} Reviews`,
        description: dbProduct.description,
        colors: dbProduct.colors.map((color: any) => ({
          name: color.name,
          bg: color.bgHex,
          border: color.borderHex || undefined,
        })),
        features: dbProduct.features.map((feature: any) => feature.featureText),
        specs: dbProduct.specs.map((spec: any) => ({ label: spec.label, value: spec.value })),
        faqs: dbProduct.faqs?.map((faq: any) => ({ question: faq.question, answer: faq.answer })) || [],
        banners: dbProduct.banners?.map((banner: any) => ({
          id: banner.id,
          imageUrl: banner.imageUrl,
          mobileImageUrl: banner.mobileImageUrl,
          title: banner.title,
          sortOrder: banner.sortOrder,
        })) || [],
        shippingNotice: dbProduct.shippingNotice,
        quantity: dbProduct.quantity,
        mainImage: dbProduct.mainImage,
        images: [...new Set([dbProduct.mainImage, ...dbProduct.media.map((media: any) => media.url)])],
        creatorVideos: dbProduct.creatorVideos?.map((v: any) => ({
          id: v.id,
          title: v.title,
          thumbnailUrl: v.thumbnailUrl,
          videoUrl: v.videoUrl,
          sortOrder: v.sortOrder,
          isActive: v.isActive,
          isProductVideo: v.isProductVideo ?? v.is_product_video ?? true,
        })) || [],
      };

  const formattedReviews = Array.isArray(dbReviews) && dbReviews.length > 0
    ? dbReviews.map((r: any) => ({
        id: r.id,
        author: r.author,
        verified: r.verified,
        date: r.date || new Date(r.createdAt).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" }),
        rating: r.rating,
        content: r.content,
        image: r.image || undefined,
        imageCount: r.imageCount || undefined,
      }))
    : undefined;

  return (
    <div className="min-h-dvh bg-white">
      <Navbar />
      <main className="w-full">
        <Suspense fallback={<div className="min-h-screen bg-white flex items-center justify-center text-slate-400">Loading product...</div>}>
          <ProductDetail
            initialProduct={product}
            initialRelatedProducts={relatedProducts}
            productId={dbProduct?.id}
            initialReviews={formattedReviews}
          />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
