import type { Metadata } from "next";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { listReviews } from "@/lib/server/controllers/reviews.controller";
import { listProducts } from "@/lib/server/controllers/products.controller";
import { ReviewsManager } from "@/components/admin/reviews/reviews-manager";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Product Reviews | XElectron Admin",
};

export default async function ReviewsPage() {
  const [reviews, rawProducts] = await Promise.all([
    listReviews().catch(() => []),
    listProducts().catch(() => []),
  ]);

  const sanitizedProducts = rawProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    mainImage: p.mainImage || (p.media && p.media[0]?.url) || "/category-projector.png",
  }));

  const sanitizedReviews = reviews.map((r: any) => ({
    id: r.id,
    author: r.author,
    rating: r.rating,
    date: r.date,
    title: r.title,
    content: r.content,
    image: r.image,
    imageCount: r.imageCount,
    verified: r.verified,
    isApproved: r.isApproved,
    productId: r.productId,
    createdAt: r.createdAt ? r.createdAt.toISOString() : new Date().toISOString(),
    product: r.product
      ? {
          id: r.product.id,
          name: r.product.name,
          slug: r.product.slug,
          mainImage: r.product.mainImage,
        }
      : null,
  }));

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <ReviewsManager
            initialReviews={sanitizedReviews}
            products={sanitizedProducts}
          />
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
