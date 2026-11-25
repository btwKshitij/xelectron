import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { canonicalUrl, PUBLIC_PATHS as staticPaths } from "@/lib/canonical";

export const dynamic = "force-dynamic";

// Actual editorial updates, not request/build time. Add or update a date only
// when that page's content or metadata changes; omit unknown modification dates.
const staticLastModified: Record<string, string> = {
  "/shop": "2026-11-25",
  "/find-a-store": "2026-11-25",
  "/troubleshooting": "2026-11-25",
  "/contact": "2026-11-25",
  "/bulk-order": "2026-11-25",
  "/careers": "2026-11-25",
  "/warranty-registration": "2026-11-25",
  "/repair-replacement": "2026-11-25",
  "/privacy-choices": "2026-11-25",
  "/privacy-policy": "2026-11-25",
  "/terms-of-use": "2026-11-25",
  "/terms-policy": "2026-11-25",
};

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Query only published/current URLs; a database failure must not publish an
  // empty or stale product sitemap with a successful status.
  const [products, posts] = await Promise.all([
    db.product.findMany({ select: { slug: true, updatedAt: true } }),
    db.blogPost.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } }),
  ]);
  return [
    ...staticPaths.map((path) => ({
      url: canonicalUrl(path),
      ...(staticLastModified[path] ? { lastModified: staticLastModified[path] } : {}),
    })),
    ...products.map((product: { slug: string; updatedAt: Date }) => ({ url: canonicalUrl(`/product/${product.slug}`), lastModified: product.updatedAt })),
    ...posts.map((post: { slug: string; updatedAt: Date }) => ({ url: canonicalUrl(`/blog/${post.slug}`), lastModified: post.updatedAt })),
  ];
}
