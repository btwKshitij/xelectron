import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import BlogArticleRenderer, { type BlogPostData } from "@/components/blog/blog-article-renderer";
import * as blogController from "@/lib/server/controllers/blog.controller";
import * as productsController from "@/lib/server/controllers/products.controller";

interface DynamicBlogPageProps {
  params: Promise<{ slug: string }>;
}

export const revalidate = 60;

export async function generateMetadata({
  params,
}: DynamicBlogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await blogController.getBlogPost(slug).catch(() => null);

  if (!post) {
    return {
      title: "Blog Post Not Found | XElectron",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | XElectron Blog`,
    description: post.excerpt || `Read ${post.title} on the official XElectron Journal.`,
    openGraph: {
      title: post.title,
      description: post.excerpt || `Read ${post.title} on the official XElectron Journal.`,
      images: post.image ? [{ url: post.image }] : undefined,
    },
  };
}

export default async function DynamicBlogPostPage({ params }: DynamicBlogPageProps) {
  const { slug } = await params;
  const [post, allPosts, bestSellers, catalogProducts] = await Promise.all([
    blogController.getBlogPost(slug).catch(() => null),
    blogController.listBlogPosts(true).catch(() => []),
    productsController.listBestSellerProducts().catch(() => []),
    productsController.listProducts().catch(() => []),
  ]);

  if (!post) {
    notFound();
  }

  const serializedPost: BlogPostData = {
    id: String(post.id),
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || null,
    content: post.content || null,
    category: post.category || "Insights",
    image: post.image || "/blog-1.png",
    readTime: post.readTime || "4 min read",
    accentColor: post.accentColor || "#0a7ae6",
    publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString() : null,
  };

  const relatedPosts: BlogPostData[] = allPosts
    .filter((p: any) => p.slug !== post.slug && String(p.id) !== String(post.id))
    .slice(0, 3)
    .map((p: any) => ({
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

  const rawPool = [
    ...(bestSellers && bestSellers.length > 0 ? bestSellers : []),
    ...(catalogProducts && catalogProducts.length > 0 ? catalogProducts : []),
  ];

  const seen = new Set<string>();
  const bestSellerProducts: any[] = [];

  for (const p of rawPool) {
    const key = p.slug || String(p.id);
    if (seen.has(key)) continue;
    seen.add(key);

    const img =
      p.mainImage ||
      p.image ||
      (Array.isArray(p.images) ? p.images[0] : null) ||
      "/category-projector.png";

    bestSellerProducts.push({
      id: String(p.id),
      slug: p.slug,
      name: p.name,
      price: p.price,
      oldPrice: p.oldPrice || null,
      discount: p.discount || null,
      image: img,
      images: p.images || [],
      description: p.description || null,
    });

    if (bestSellerProducts.length >= 6) break;
  }

  const featuredProduct = bestSellerProducts[0] || null;

  return (
    <div className="min-h-screen w-full bg-white text-[#1d1d1f]">
      <Navbar />
      <main className="w-full">
        <BlogArticleRenderer
          post={serializedPost}
          relatedPosts={relatedPosts}
          featuredProduct={featuredProduct}
          bestSellerProducts={bestSellerProducts}
        />
      </main>
      <Footer />
    </div>
  );
}
