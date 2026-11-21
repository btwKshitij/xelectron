import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { canonicalUrl, PUBLIC_PATHS as staticPaths } from "@/lib/canonical";

export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Query only published/current URLs; a database failure must not publish an
  // empty or stale product sitemap with a successful status.
  const [products, posts] = await Promise.all([
    db.product.findMany({ select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    ...staticPaths.map((path) => ({ url: canonicalUrl(path) })),
    ...products.map((product: { slug: string; updatedAt: Date }) => ({ url: canonicalUrl(`/product/${product.slug}`), lastModified: product.updatedAt })),
    ...posts.map((post: { slug: string; updatedAt: Date }) => ({ url: canonicalUrl(`/blog/${post.slug}`), lastModified: post.updatedAt })),
  ];
}
