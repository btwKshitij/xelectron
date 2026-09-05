"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type BlogPost = {
  id: string | number;
  title: string;
  excerpt?: string | null;
  category: string;
  publishedAt?: string;
  date?: string;
  readTime?: string | null;
  image?: string | null;
  accentColor?: string | null;
  accent?: string;
};

const defaultBlogPosts: BlogPost[] = [
  {
    id: 1,
    title: "Why XElectron Speakers Are Dominating the Market in 2026",
    excerpt:
      "Discover what makes XElectron the fastest-growing audio brand in India and why audiophiles are making the switch.",
    category: "Insights",
    date: "Jul 22, 2026",
    readTime: "4 min read",
    image: "/blog-1.png",
    accentColor: "#0a7ae6",
  },
  {
    id: 2,
    title: "The Ultimate Guide to Choosing Your First Bluetooth Speaker",
    excerpt:
      "Battery life, bass response, waterproofing — we break down every spec that matters so you buy smart.",
    category: "Guide",
    date: "Jul 18, 2026",
    readTime: "6 min read",
    image: "/blog-2.png",
    accentColor: "#025bb5",
  },
  {
    id: 3,
    title: "Behind the Sound: How We Engineer Deep Bass in Compact Bodies",
    excerpt:
      "A peek inside our R&D lab — from driver design to acoustic chambers, the science behind XElectron's signature sound.",
    category: "Technology",
    date: "Jul 12, 2026",
    readTime: "5 min read",
    image: "/blog-3.png",
    accentColor: "#0284c7",
  },
];

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(defaultBlogPosts);

  useEffect(() => {
    fetch("/api/blog")
      .then((res) => res.json())
      .then((json) => {
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setPosts(json.data);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative w-full bg-white px-4 py-10 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="mb-6 sm:mb-10 flex items-end justify-between gap-3">
          <div>
            <p className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-slate-400 mb-1 sm:mb-2">
              From our blog
            </p>
            <h2 className="text-lg xs:text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-slate-900 whitespace-nowrap">
              Latest Stories & Updates
            </h2>
          </div>
          <Link
            href="/dashboard/blog"
            className="group flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-[#0a7ae6] transition-colors hover:text-[#025bb5] shrink-0"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Blog Cards Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Intl.DateTimeFormat("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(post.publishedAt))
              : post.date || "Recent";

            return (
              <article
                key={post.id}
                className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
              >
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                  <Image
                    src={post.image || "/blog-1.png"}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  {/* Category badge */}
                  <span className="absolute top-3 left-3 rounded-full bg-[#0a7ae6] px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-md">
                    {post.category}
                  </span>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug line-clamp-2 group-hover:text-[#0a7ae6] transition-colors duration-200">
                    {post.title}
                  </h3>
                  <p className="mt-2 flex-1 text-sm text-slate-500 leading-relaxed line-clamp-2">
                    {post.excerpt}
                  </p>

                  {/* Meta */}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3">
                    <span className="text-xs text-slate-400">{formattedDate}</span>
                    <span className="text-xs font-medium text-slate-500">
                      {post.readTime || "4 min read"}
                    </span>
                  </div>
                </div>

                {/* Full-card clickable overlay */}
                <a href="#" className="absolute inset-0 z-10" aria-label={`Read: ${post.title}`} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
