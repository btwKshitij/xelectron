import type { Metadata } from "next";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import BlogListView from "@/components/blog/blog-list-view";
import * as blogController from "@/lib/server/controllers/blog.controller";
import type { BlogPostData } from "@/components/blog/blog-article-renderer";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Blog & Stories | XElectron Official",
  description:
    "Explore the latest insights, buyer guides, acoustic engineering breakdowns, and technology updates from the team at XElectron.",
};

export default async function BlogPage() {
  let posts: BlogPostData[] = [];

  try {
    const rawPosts = await blogController.listBlogPosts(true);
    posts = rawPosts.map((p: any) => ({
      id: String(p.id),
      title: p.title,
      slug: p.slug,
      excerpt: p.excerpt || null,
      content: p.content || null,
      category: p.category || "Insights",
      image: p.image || "/blog-1.png",
      readTime: p.readTime || "4 min read",
      accentColor: p.accentColor || "#0a7ae6",
      publishedAt: p.publishedAt ? new Date(p.publishedAt).toISOString() : null,
    }));
  } catch (error) {
    console.error("Error fetching blog posts for blog page:", error);
  }

  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f]">
      <Navbar />
      <main className="w-full">
        <BlogListView initialPosts={posts} />
      </main>
      <Footer />
    </div>
  );
}
