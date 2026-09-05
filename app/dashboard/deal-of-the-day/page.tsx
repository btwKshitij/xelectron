import type { Metadata } from "next";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { DealOfTheDayEditor } from "@/components/admin/deals/deal-of-the-day-editor";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as dealOfTheDayController from "@/lib/server/controllers/deal-of-the-day.controller";
import * as productsController from "@/lib/server/controllers/products.controller";
import { defaultDealOfTheDay } from "@/lib/shared/default-deal-of-the-day";

export const metadata: Metadata = { title: "Deal of the day | Xelectron Admin" };

export default async function DealOfTheDayPage() {
  const [deal, products] = await Promise.all([dealOfTheDayController.getDealOfTheDay(), productsController.listCatalogProducts()]);
  const defaultProduct = products.find((product: any) => product.slug === defaultDealOfTheDay.productSlug);
  const editableDeal = deal
    ? { productId: deal.productId, title: deal.title, description: deal.description, image: deal.image, dealPrice: deal.dealPrice, compareAtPrice: deal.compareAtPrice, badge: deal.badge, features: deal.features, unitsLeft: deal.unitsLeft, totalUnits: deal.totalUnits, endsAt: deal.endsAt.toISOString(), isActive: deal.isActive }
    : defaultProduct
      ? { productId: defaultProduct.id, title: defaultDealOfTheDay.title, description: defaultDealOfTheDay.description, image: defaultDealOfTheDay.image, dealPrice: defaultDealOfTheDay.dealPrice, compareAtPrice: defaultDealOfTheDay.compareAtPrice, badge: defaultDealOfTheDay.badge, features: [...defaultDealOfTheDay.features], unitsLeft: defaultDealOfTheDay.unitsLeft, totalUnits: defaultDealOfTheDay.totalUnits, endsAt: "", isActive: true }
      : null;

  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><DealOfTheDayEditor key={deal ? "saved-deal-pricing" : "default-deal-pricing"} deal={editableDeal} products={products.map((product: any) => ({ id: product.id, name: product.name, slug: product.slug, price: product.price, oldPrice: product.oldPrice, description: product.description, image: product.mainImage }))} /></SidebarInset></SidebarProvider></TooltipProvider>;
}
