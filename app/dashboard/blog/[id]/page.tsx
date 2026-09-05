import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostEditor, type BlogPostItem } from "@/components/admin/blog/blog-post-editor";
import { AppSidebar } from "@/components/admin/navigation/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import * as blogController from "@/lib/server/controllers/blog.controller";

export const metadata: Metadata = { title: "Edit blog post | Xelectron Admin" };

export default async function EditBlogPostPage({ params }: PageProps<"/dashboard/blog/[id]">) {
  const { id } = await params;
  const post = await blogController.getBlogPost(id);
  if (!post) notFound();
  const editorPost: BlogPostItem = { ...post, publishedAt: post.publishedAt.toISOString(), createdAt: post.createdAt.toISOString() };
  return <TooltipProvider><SidebarProvider className="min-h-svh"><AppSidebar /><SidebarInset><BlogPostEditor post={editorPost} /></SidebarInset></SidebarProvider></TooltipProvider>;
}
