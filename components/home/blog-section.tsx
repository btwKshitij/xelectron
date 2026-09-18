"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";
import { defaultBlogPosts } from "@/lib/shared/default-blog-posts";

type BlogPost = {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string | null;
  category: string;
  publishedAt?: string;
  date?: string;
  readTime?: string | null;
  image?: string | null;
  accentColor?: string | null;
  accent?: string;
};

export default function BlogSection() {
  const [posts, setPosts] = useState<BlogPost[]>(defaultBlogPosts);
  const [carouselRef, carouselApi] = useEmblaCarousel({ align: "start", loop: true });
  const [isHovered, setIsHovered] = useState(false);
  const [hasFocus, setHasFocus] = useState(false);

  useEffect(() => {
    if (!carouselApi || isHovered || hasFocus) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let isDragging = false;
    const onPointerDown = () => { isDragging = true; };
    const onPointerUp = () => { isDragging = false; };
    carouselApi.on("pointerDown", onPointerDown);
    carouselApi.on("pointerUp", onPointerUp);
    const timer = window.setInterval(() => {
      if (document.hidden || reducedMotion.matches || isDragging) return;
      if (carouselApi.canScrollNext()) carouselApi.scrollNext();
      else carouselApi.scrollTo(0);
    }, 4000);
    return () => {
      window.clearInterval(timer);
      carouselApi.off("pointerDown", onPointerDown);
      carouselApi.off("pointerUp", onPointerUp);
    };
  }, [carouselApi, isHovered, hasFocus]);

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
          <Link prefetch={false}
            href="/blog"
            className="group flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-bold text-[#0a7ae6] transition-colors hover:text-[#025bb5] shrink-0"
          >
            <span>View all</span>
            <ArrowRight className="h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div
          role="region"
          aria-roledescription="carousel"
          aria-label="Latest blog stories"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onFocusCapture={() => setHasFocus(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setHasFocus(false);
          }}
        >
        <div ref={carouselRef} className="overflow-hidden py-2">
        <div className="-ml-6 flex touch-pan-y">
          {posts.map((post) => {
            const formattedDate = post.publishedAt
              ? new Intl.DateTimeFormat("en-IN", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                }).format(new Date(post.publishedAt))
              : post.date || "Recent";

            const postSlug = post.slug || String(post.id);

            return (
              <div key={post.id} className="flex min-w-0 shrink-0 grow-0 basis-full pl-6 sm:basis-1/2 lg:basis-1/3">
              <article
                className="group relative flex w-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
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
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>{formattedDate}</span>
                      <span>•</span>
                      <span>{post.readTime || "4 min read"}</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs font-semibold text-[#0a7ae6] group-hover:text-[#025bb5] transition-colors">
                      Read story
                      <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </div>

                {/* Full-card clickable overlay */}
                <Link
                  prefetch={false}
                  href={`/blog/${postSlug}`}
                  className="absolute inset-0 z-10"
                  aria-label={`Read: ${post.title}`}
                />
              </article>
              </div>
            );
          })}
        </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button type="button" onClick={() => carouselApi?.scrollPrev()} aria-label="Previous blogs" className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <button type="button" onClick={() => carouselApi?.scrollNext()} aria-label="Next blogs" className="rounded-full border border-slate-200 p-2 text-slate-700 hover:bg-slate-100">
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        </div>
      </div>
    </section>
  );
}
