import Navbar from "@/components/navbar/navbar";
import HeroShowcase from "@/components/home/hero-showcase";
import CategorySection from "@/components/home/category-section";
import ProductShowcaseSection from "@/components/home/product-showcase-section";
import BestSellersSection from "@/components/home/best-sellers-section";
import DealOfTheDaySection from "@/components/home/deal-of-the-day-section";
import BrandSetupSection from "@/components/home/brand-setup-section";
import FaqSection from "@/components/home/faq-section";
import CreatorVideosSection from "@/components/home/creator-videos-section";
import VerifiedReviewsSection from "@/components/home/verified-reviews-section";
import BrandMarqueeSection from "@/components/home/brand-marquee-section";
import BlogSection from "@/components/home/blog-section";
import WhatsAppSupportBanner from "@/components/home/whatsapp-support-banner";
import Footer from "@/components/footer/footer";
import type { BestSellerItem } from "@/components/home/best-sellers-data";
import type { StorefrontProduct } from "@/components/home/product-showcase-section";
import * as productsController from "@/lib/server/controllers/products.controller";
import * as categoriesController from "@/lib/server/controllers/categories.controller";
import * as dealOfTheDayController from "@/lib/server/controllers/deal-of-the-day.controller";
import * as brandShowcaseController from "@/lib/server/controllers/brand-showcase.controller";
import * as brandMarqueeController from "@/lib/server/controllers/brand-marquee.controller";
import * as bannersController from "@/lib/server/controllers/banners.controller";
import { defaultDealOfTheDay } from "@/lib/shared/default-deal-of-the-day";
import { resolveCategoryImage } from "@/lib/shared/category-utils";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Home() {
  let selectedBestSellers: BestSellerItem[] = [];
  let storefrontCategories: Array<{ id: string; title: string; slug: string; image: string }> = [];
  let featuredProducts: StorefrontProduct[] = [];
  let dealOfTheDay: React.ComponentProps<typeof DealOfTheDaySection>["deal"] | null = {
    title: defaultDealOfTheDay.title,
    description: defaultDealOfTheDay.description,
    image: defaultDealOfTheDay.image,
    badge: defaultDealOfTheDay.badge,
    features: [...defaultDealOfTheDay.features],
    unitsLeft: defaultDealOfTheDay.unitsLeft,
    totalUnits: defaultDealOfTheDay.totalUnits,
    endsAt: null,
    product: {
      slug: defaultDealOfTheDay.productSlug,
      name: defaultDealOfTheDay.title,
      price: defaultDealOfTheDay.dealPrice,
      oldPrice: defaultDealOfTheDay.compareAtPrice,
    },
  };

  try {
    const products = await productsController.listBestSellerProducts();
    selectedBestSellers = products.map((product: any) => ({
      // The carousel uses the product slug for its link and stable slide key.

      id: product.slug,
      slug: product.slug,
      name: product.name,
      price: product.price,
      oldPrice: product.oldPrice || undefined,
      discount: product.discount || undefined,
      description: product.description,
      image: product.mainImage || "/category-smartphone.png",
      imageAlt: product.name,
      specs: product.specs.length > 0
        ? product.specs.slice(0, 3).map((spec: any) => ({ label: spec.label, value: spec.value }))
        : [
            { label: "Category", value: product.category?.title || "Electronics" },
            { label: "Customer rating", value: `${product.rating.toFixed(1)} / 5` },
            { label: "Availability", value: product.quantity > 0 ? "In stock" : "Out of stock" },
          ],
    }));
  } catch {

    // The existing Best Sellers content stays visible if the catalog is unavailable.
  }

  try {
    const products = await productsController.listProducts();
    // Best Seller products have their own home-page section, so do not repeat
    // them in either of the regular catalogue sections below.
    featuredProducts = products.filter((product: any) => !product.showInBestSellers).map((product: any) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      image: product.mainImage,
      hoverImage:
        product.media.find((media: any) => media.url !== product.mainImage)?.url ?? null,
      price: product.price,
      oldPrice: product.oldPrice,
      rating: product.rating,
      reviews: product.reviewsCount,
      category: product.category?.title || "XElectron",
      discount: product.discount,
    }));
  } catch {
    // Do not show the static sample products when the dashboard catalog is unavailable.
  }

  try {
    const [savedDeal, activeDeal] = await Promise.all([
      dealOfTheDayController.getDealOfTheDay(),
      dealOfTheDayController.getActiveDealOfTheDay(),
    ]);

    // Keep the default offer only until the first dashboard deal is saved.
    // Once a deal exists, an inactive or expired deal must hide the section.
    if (savedDeal && !activeDeal) {
      dealOfTheDay = null;
    } else if (activeDeal) {
      const dealPrice = activeDeal.dealPrice || activeDeal.product.price;
      const compareAtPrice =
        activeDeal.compareAtPrice ||
        (activeDeal.product.price !== dealPrice ? activeDeal.product.price : activeDeal.product.oldPrice);

      dealOfTheDay = {
        title: activeDeal.title,
        description: activeDeal.description,
        image: activeDeal.image || activeDeal.product.mainImage,
        badge: activeDeal.badge,
        features: activeDeal.features,
        unitsLeft: activeDeal.unitsLeft,
        totalUnits: activeDeal.totalUnits,
        endsAt: activeDeal.endsAt.toISOString(),
        product: {
          slug: activeDeal.product.slug,
          name: activeDeal.product.name,
          price: dealPrice,
          oldPrice: compareAtPrice && compareAtPrice !== dealPrice ? compareAtPrice : null,
          description: activeDeal.product.description || null,
          shippingNotice: activeDeal.product.shippingNotice || null,
        },
      };
    }
  } catch {
    // The home page remains available while the deal is not configured.
  }

  try {
    const categories = await categoriesController.listCategories();
    storefrontCategories = categories
      .filter((category: any) => category.visible)
      .map((category: any) => ({
        id: category.id,
        title: category.title,
        slug: category.slug,
        image: resolveCategoryImage(
          category.image || category.products[0]?.mainImage,
          category.slug,
          category.title
        ),
      }));
  } catch {
    // Keep the rest of the home page available if the category catalog is unavailable.
  }

  let brandShowcaseItems: any[] = [];
  let brandMarqueeItems: any[] = [];
  let heroBanners: any[] = [];

  try {
    heroBanners = await bannersController.listActiveBanners();
  } catch {
    // Falls back to default items
  }

  try {
    brandShowcaseItems = await brandShowcaseController.listBrandShowcaseItems(true);
  } catch {
    // Falls back to default items
  }

  try {
    brandMarqueeItems = await brandMarqueeController.listBrandMarqueeItems(true);
  } catch {
    // Falls back to default items
  }

  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f]">
      <Navbar />
      <main className="w-full">
        <HeroShowcase initialBanners={heroBanners} />
        <CategorySection categories={storefrontCategories} />
        <ProductShowcaseSection products={featuredProducts} />
        <BestSellersSection additionalItems={selectedBestSellers} />
        {dealOfTheDay ? <DealOfTheDaySection deal={dealOfTheDay} /> : null}
        <BrandSetupSection items={brandShowcaseItems} />
        <CreatorVideosSection />
        <BrandMarqueeSection items={brandMarqueeItems} />
        <VerifiedReviewsSection />
        <FaqSection />
        <BlogSection />
        <WhatsAppSupportBanner />
      </main>
      <Footer />
    </div>
  );
}
