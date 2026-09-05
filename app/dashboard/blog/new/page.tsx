import type { Metadata } from "next";
import { BlogPostEditor } from "@/components/admin/blog/blog-post-editor";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";

export const metadata: Metadata = { title: "Create blog post | Xelectron Admin" };

export default function NewBlogPostPage() {
  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><BlogPostEditor /></SidebarInset></SidebarProvider></TooltipProvider>;
}
