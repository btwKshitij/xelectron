import type { Metadata } from "next";

import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as blogController from "@/lib/server/controllers/blog.controller";
import { BlogManager, type BlogPostItem } from "@/components/admin/blog/blog-manager";

export const metadata: Metadata = {
  title: "From Our Blog | Xelectron Admin",
  description: "Manage homepage blog stories and articles.",
};

export default async function BlogAdminPage() {
  const posts = await blogController.listBlogPosts(false);

  const formattedPosts: BlogPostItem[] = posts.map((p: any) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    content: p.content,
    category: p.category,
    image: p.image,
    readTime: p.readTime,
    accentColor: p.accentColor,
    isActive: p.isActive,
    sortOrder: p.sortOrder,
    publishedAt: p.publishedAt.toISOString(),
    createdAt: p.createdAt.toISOString(),
  }));

  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh">
        <AppSidebar />
        <SidebarInset>
          <main className="min-h-full flex-1 bg-[#f5f5f5] p-4 text-black sm:p-6">
            <BlogManager initialPosts={formattedPosts} />
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
