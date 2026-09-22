import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LatestLaunchManager } from "@/components/admin/products/latest-launch-manager";
import { listProducts } from "@/lib/server/controllers/products.controller";
import { getLatestLaunchIds } from "@/lib/server/dal/latest-launch.dal";
import { selectLatestLaunchProducts } from "@/lib/latest-launch";

export const dynamic = "force-dynamic";
export const metadata = { title: "Latest Launch | XElectron Admin" };

export default async function LatestLaunchPage() {
  const [products, ids] = await Promise.all([listProducts(), getLatestLaunchIds()]);
  return (
    <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset>
      <LatestLaunchManager products={products.map((product: { id: string; name: string; mainImage: string; category?: { title: string } | null }) => ({ id: product.id, name: product.name, image: product.mainImage, category: product.category?.title || "" }))} initialIds={selectLatestLaunchProducts(products, ids).map((product) => product.id)} />
    </SidebarInset></SidebarProvider></TooltipProvider>
  );
}
