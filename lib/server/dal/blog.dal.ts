import { db } from "@/lib/db";

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
    const defaults = [
      {
        title: "Why XElectron Speakers Are Dominating the Market in 2026",
        slug: "why-xelectron-speakers-are-dominating-the-market-in-2026",
        excerpt: "Discover what makes XElectron the fastest-growing audio brand in India and why audiophiles are making the switch.",
        content: "Discover what makes XElectron the fastest-growing audio brand in India and why audiophiles are making the switch.\n\nFrom high fidelity acoustics to durable engineering, XElectron brings studio-grade sound directly to your living space.",
        category: "Insights",
        image: "/blog-1.png",
        readTime: "4 min read",
        accentColor: "#0a7ae6",
        sortOrder: 0,
      },
      {
        title: "The Ultimate Guide to Choosing Your First Bluetooth Speaker",
        slug: "the-ultimate-guide-to-choosing-your-first-bluetooth-speaker",
        excerpt: "Battery life, bass response, waterproofing — we break down every spec that matters so you buy smart.",
        content: "Battery life, bass response, waterproofing — we break down every spec that matters so you buy smart.\n\nLearn how to evaluate drivers, connectivity standards, and battery capacity before purchasing your next audio device.",
        category: "Guide",
        image: "/blog-2.png",
        readTime: "6 min read",
        accentColor: "#025bb5",
        sortOrder: 1,
      },
      {
        title: "Behind the Sound: How We Engineer Deep Bass in Compact Bodies",
        slug: "behind-the-sound-how-we-engineer-deep-bass-in-compact-bodies",
        excerpt: "A peek inside our R&D lab — from driver design to acoustic chambers, the science behind XElectron's signature sound.",
        content: "A peek inside our R&D lab — from driver design to acoustic chambers, the science behind XElectron's signature sound.\n\nExplore how passive radiators and DSP tuning allow compact speakers to deliver rich, room-filling low frequencies.",
        category: "Technology",
        image: "/blog-3.png",
        readTime: "5 min read",
        accentColor: "#0284c7",
        sortOrder: 2,
      },
    ];

    for (const post of defaults) {
      await db.blogPost.create({ data: post });
    }
  }
}
