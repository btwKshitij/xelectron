import type { MetadataRoute } from "next";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

const siteUrl = "https://www.xelectron.com";
const staticPaths = ["/", "/shop", "/about-us", "/contact", "/blog", "/bulk-order", "/careers", "/find-a-store", "/service-centers", "/pickup-drop-service", "/repair-replacement", "/downloads", "/firmware-updates", "/troubleshooting", "/warranty-registration", "/warranty-terms", "/privacy-policy", "/privacy-choices", "/terms-of-use", "/terms-policy"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Query only published/current URLs; a database failure must not publish an
  // empty or stale product sitemap with a successful status.
  const [products, categories, posts] = await Promise.all([
    db.product.findMany({ select: { slug: true, updatedAt: true } }),
    db.category.findMany({ where: { visible: true }, select: { slug: true } }),
    db.blogPost.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    ...staticPaths.map((path) => ({ url: `${siteUrl}${path}` })),
    ...categories.map((category: { slug: string }) => ({ url: `${siteUrl}/shop?filter=${encodeURIComponent(category.slug)}` })),
    ...products.map((product: { slug: string; updatedAt: Date }) => ({ url: `${siteUrl}/product/${product.slug}`, lastModified: product.updatedAt })),
    ...posts.map((post: { slug: string; updatedAt: Date }) => ({ url: `${siteUrl}/blog/${post.slug}`, lastModified: post.updatedAt })),
  ];
}
