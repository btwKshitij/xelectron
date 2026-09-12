import { db } from "@/lib/db";
import { defaultBlogPosts } from "@/lib/shared/default-blog-posts";

export type CreateBlogPostInput = {
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  category?: string;
  image?: string | null;
  readTime?: string | null;
  accentColor?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type UpdateBlogPostInput = Partial<CreateBlogPostInput>;

export function getAllBlogPosts(activeOnly: boolean = false) {
  return db.blogPost.findMany({
    where: activeOnly ? { isActive: true } : {},
    orderBy: { publishedAt: "desc" },
  });
}

export function getBlogPostById(id: string) {
  return db.blogPost.findUnique({ where: { id } });
}

export function getBlogPostBySlug(slug: string) {
  return db.blogPost.findUnique({ where: { slug } });
}

export function createBlogPost(data: CreateBlogPostInput) {
  const slug = data.slug?.trim() || data.title.toLowerCase().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
  return db.blogPost.create({
    data: {
      title: data.title.trim(),
      slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
      excerpt: data.excerpt?.trim() || null,
      content: data.content?.trim() || data.excerpt?.trim() || "Discover the latest tech updates and engineering insights from XElectron.",
      category: data.category?.trim() || "Insights",
      image: data.image?.trim() || "/blog-1.png",
      readTime: data.readTime?.trim() || "4 min read",
      accentColor: data.accentColor?.trim() || "#0a7ae6",
      isActive: data.isActive ?? true,
      sortOrder: data.sortOrder ?? 0,
    },
  });
}

export function updateBlogPost(id: string, data: UpdateBlogPostInput) {
  return db.blogPost.update({
    where: { id },
    data: {
      ...(data.title !== undefined ? { title: data.title.trim() } : {}),
      ...(data.slug !== undefined ? { slug: data.slug.trim() } : {}),
      ...(data.excerpt !== undefined ? { excerpt: data.excerpt?.trim() || null } : {}),
      ...(data.content !== undefined ? { content: data.content?.trim() || "" } : {}),
      ...(data.category !== undefined ? { category: data.category?.trim() || "Insights" } : {}),
      ...(data.image !== undefined ? { image: data.image?.trim() || "/blog-1.png" } : {}),
      ...(data.readTime !== undefined ? { readTime: data.readTime?.trim() || "4 min read" } : {}),
      ...(data.accentColor !== undefined ? { accentColor: data.accentColor?.trim() || "#0a7ae6" } : {}),
      ...(data.isActive !== undefined ? { isActive: data.isActive } : {}),
      ...(data.sortOrder !== undefined ? { sortOrder: data.sortOrder } : {}),
    },
  });
}

export function deleteBlogPost(id: string) {
  return db.blogPost.delete({ where: { id } });
}

export async function seedDefaultBlogPostsIfEmpty() {
  const count = await db.blogPost.count();
  if (count === 0) {
    for (const post of defaultBlogPosts) {
      await db.blogPost.create({
        data: {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          category: post.category,
          image: post.image,
          readTime: post.readTime,
          accentColor: post.accentColor,
          sortOrder: post.sortOrder,
          publishedAt: new Date(post.publishedAt),
          isActive: post.isActive,
        },
      });
    }
  }
}

