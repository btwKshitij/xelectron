import Navbar from "@/components/navbar/navbar";
import { Suspense } from "react";
import type { Metadata } from "next";
import HeroShowcase from "@/components/home/hero-showcase";
import CategorySection from "@/components/home/category-section";
import ProductShowcaseSection from "@/components/home/product-showcase-section";
import BestSellersSection from "@/components/home/best-sellers-section";
import DealOfTheDaySection from "@/components/home/deal-of-the-day-section";
import WhatsAppSupportBanner from "@/components/home/whatsapp-support-banner";
import Footer from "@/components/footer/footer";
import dynamic from "next/dynamic";
import CreatorVideosSection from "@/components/home/lazy-creator-videos";
import type { BestSellerItem } from "@/components/home/best-sellers-data";
import type { StorefrontProduct } from "@/components/home/product-showcase-section";
import * as productsController from "@/lib/server/controllers/products.controller";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import * as dealOfTheDayController from "@/lib/server/controllers/deal-of-the-day.controller";
import * as brandShowcaseController from "@/lib/server/controllers/brand-showcase.controller";
import * as brandMarqueeController from "@/lib/server/controllers/brand-marquee.controller";
import * as bannersController from "@/lib/server/controllers/banners.controller";
import * as verifiedReviewsController from "@/lib/server/controllers/verified-reviews.controller";
import { resolveCategoryImage } from "@/lib/shared/category-utils";
import { getLatestLaunchIds } from "@/lib/server/dal/latest-launch.dal";
import { selectLatestLaunchProducts } from "@/lib/latest-launch";

// Dynamic import for below-the-fold sections to speed up initial page load
const BrandSetupSection = dynamic(() => import("@/components/home/brand-setup-section"));
const BrandMarqueeSection = dynamic(() => import("@/components/home/brand-marquee-section"));
const VerifiedReviewsSection = dynamic(() => import("@/components/home/verified-reviews-section"));
const FaqSection = dynamic(() => import("@/components/home/faq-section"));
const BlogSection = dynamic(() => import("@/components/home/blog-section"));

// Read current offers on every visit, including after an admin changes the deal.
export const revalidate = 0;

export const metadata: Metadata = {
  title: "XElectron | Smart Projectors, TVs & Digital Photo Frames",
  description: "Shop XElectron smart projectors, LED TVs, digital photo frames and portable monitors. Explore home entertainment, current offers and official product support.",
  alternates: { canonical: "https://www.xelectron.com/" },
  openGraph: {
    title: "XElectron | Smart Projectors, TVs & Digital Photo Frames",
    description: "Explore XElectron home entertainment: smart projectors, LED TVs, digital photo frames and portable monitors.",
    url: "https://www.xelectron.com/",
    type: "website",
    siteName: "XElectron",
  },
};

async function HomeHero() {
  const banners = await bannersController.listActiveBanners().catch(() => []);
  return <HeroShowcase initialBanners={banners} />;
}

export default async function Home() {
  // Resolve the catalog before rendering so links and products are in the
  // visible HTML, not a hidden Suspense segment waiting for JavaScript.
  const sections = await HomeSections();
  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f]">
      <Navbar />
      <main className="w-full">
        <Suspense fallback={<div className="w-full aspect-[9/16] sm:aspect-[1672/941] bg-slate-50" aria-hidden="true" />}>
          <HomeHero />
        </Suspense>
        {sections}
      </main>
      <Footer />
    </div>
  );
}

async function HomeSections() {
  // Resolve independent storefront queries together for server-rendered content.
  const [
    bestSellerProductsResult,
    allProductsResult,
    latestLaunchIdsResult,
    activeDealResult,
    categoriesResult,
    brandShowcaseItemsResult,
    brandMarqueeItemsResult,
    verifiedReviewsResult,
  ] = await Promise.all([
    productsController.listBestSellerProducts().catch(() => []),
    productsController.listProducts(),
    getLatestLaunchIds().catch(() => null),
    dealOfTheDayController.getActiveDealOfTheDay().catch(() => null),
    categoriesController.listCategories().catch(() => []),
    brandShowcaseController.listBrandShowcaseItems(true).catch(() => []),
    brandMarqueeController.listBrandMarqueeItems(true).catch(() => []),
    verifiedReviewsController.listActiveVerifiedReviews().catch(() => []),
  ]);

  const reviewProductImages = new Map<string, string>();
  for (const product of allProductsResult) {
    if (product.mainImage) {
      reviewProductImages.set(product.name.trim().toLowerCase(), product.mainImage);
    }
  }

  const selectedBestSellers: BestSellerItem[] = (bestSellerProductsResult || []).map((product: any) => ({
    id: product.id,
    category: product.category?.title || "Uncategorized",
    slug: product.slug,
    name: product.name,
    price: product.price,
    oldPrice: product.oldPrice || undefined,
    discount: product.discount || undefined,
    description: product.description,
    image: (product.media && product.media.length > 0 && product.media[0]?.url)
      ? product.media[0].url
      : (product.mainImage?.startsWith("http") || product.mainImage?.startsWith("/")
          ? product.mainImage
          : (product.media?.[0]?.url || "/category-tv.png")),
    imageAlt: product.name,
    specs: product.specs && product.specs.length > 0
      ? product.specs.slice(0, 3).map((spec: any) => ({ label: spec.label, value: spec.value }))
      : [
          { label: "Category", value: product.category?.title || "Electronics" },
          { label: "Customer rating", value: `${(product.rating || 5).toFixed(1)} / 5` },
          { label: "Availability", value: (product.quantity || 0) > 0 ? "In stock" : "Out of stock" },
        ],
  }));

  const latestProducts = selectLatestLaunchProducts(
    allProductsResult || [],
    latestLaunchIdsResult
  );
  const featuredProducts: StorefrontProduct[] = (latestProducts.length > 0
    ? latestProducts : allProductsResult.slice(0, 4)).map((product: any) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    image: (product.media && product.media.length > 0 && product.media[0]?.url)
      ? product.media[0].url
      : (product.mainImage?.startsWith("http") || product.mainImage?.startsWith("/")
          ? product.mainImage
          : (product.media?.[0]?.url || "/category-tv.png")),
    hoverImage:
      product.media?.find((media: any) => media.url !== product.mainImage)?.url ?? null,
    price: product.price,
    oldPrice: product.oldPrice,
    rating: product.rating,
    reviews: product.reviewsCount,
    category: product.category?.title || "XElectron",
    discount: product.discount,
    quantity: typeof product.quantity === "number" ? product.quantity : null,
  }));

  let dealOfTheDay: React.ComponentProps<typeof DealOfTheDaySection>["deal"] | null = null;

  if (activeDealResult) {
    const dealPrice = activeDealResult.dealPrice || activeDealResult.product.price;
    const compareAtPrice =
      activeDealResult.compareAtPrice ||
      (activeDealResult.product.price !== dealPrice ? activeDealResult.product.price : activeDealResult.product.oldPrice);

    dealOfTheDay = {
      title: activeDealResult.title,
      description: activeDealResult.description,
      image: activeDealResult.image || activeDealResult.product.mainImage,
      badge: activeDealResult.badge,
      features: activeDealResult.features,
      unitsLeft: activeDealResult.unitsLeft,
      totalUnits: activeDealResult.totalUnits,
      endsAt: activeDealResult.endsAt.toISOString(),
      product: {
        slug: activeDealResult.product.slug,
        name: activeDealResult.product.name,
        price: dealPrice,
        catalogPrice: activeDealResult.product.price,
        mrp: activeDealResult.product.oldPrice,
        oldPrice: compareAtPrice && compareAtPrice !== dealPrice ? compareAtPrice : null,
        description: activeDealResult.product.description || null,
        shippingNotice: activeDealResult.product.shippingNotice || null,
      },
    };
  }

  const storefrontCategories = (categoriesResult || [])
    .filter((category: any) => category.visible)
    .map((category: any) => ({
      id: category.id,
      title: category.title,
      slug: category.slug,
      sortOrder: category.sortOrder ?? 0,
      image: resolveCategoryImage(
        category.image || category.products?.[0]?.mainImage,
        category.slug,
        category.title
      ),
    }));

  const verifiedReviews = (verifiedReviewsResult || []).map((review: any) => ({
    ...review,
    productImage: reviewProductImages.get(review.product?.trim().toLowerCase()),
  }));

  return (
    <>
        <CategorySection categories={storefrontCategories} />
        <ProductShowcaseSection products={featuredProducts} />
        <BestSellersSection additionalItems={selectedBestSellers} />
        {dealOfTheDay ? <DealOfTheDaySection deal={dealOfTheDay} /> : null}
        <BrandSetupSection items={brandShowcaseItemsResult || []} />
        <CreatorVideosSection />
        <BrandMarqueeSection items={brandMarqueeItemsResult || []} />
        <VerifiedReviewsSection initialReviews={verifiedReviews} />
        <FaqSection />
        <BlogSection />
        <WhatsAppSupportBanner />
    </>
  );
}
