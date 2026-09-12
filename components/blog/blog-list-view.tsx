"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Calendar, Clock, Search, X } from "lucide-react";
import type { BlogPostData } from "./blog-article-renderer";

interface BlogListViewProps {
  initialPosts: BlogPostData[];
}

export default function BlogListView({ initialPosts }: BlogListViewProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = useMemo(() => {
    const set = new Set<string>();
    initialPosts.forEach((post) => {
      if (post.category?.trim()) set.add(post.category.trim());
    });
    return ["All", ...Array.from(set)];
  }, [initialPosts]);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      const matchesCat =
        selectedCategory === "All" ||
        post.category?.toLowerCase() === selectedCategory.toLowerCase();

      if (!matchesCat) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      const inTitle = post.title?.toLowerCase().includes(query);
      const inExcerpt = post.excerpt?.toLowerCase().includes(query);
      const inCategory = post.category?.toLowerCase().includes(query);

      return inTitle || inExcerpt || inCategory;
    });
  }, [initialPosts, selectedCategory, searchQuery]);

  const featuredPost = useMemo(() => {
    if (selectedCategory !== "All" || searchQuery.trim()) {
      return null;
    }
    return filteredPosts.length > 0 ? filteredPosts[0] : null;
  }, [filteredPosts, selectedCategory, searchQuery]);

  const remainingPosts = useMemo(() => {
    if (featuredPost) {
      return filteredPosts.slice(1);
    }
    return filteredPosts;
  }, [filteredPosts, featuredPost]);

  return (
    <div className="w-full bg-white">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden border-b border-slate-100 bg-gradient-to-b from-blue-50/50 via-white to-white py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a7ae6]/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-[#0a7ae6]">
            <BookOpen className="h-3.5 w-3.5" />
            The XElectron Journal
          </span>
          <h1 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900">
            Stories, Engineering & Sound Insights
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm sm:text-base lg:text-lg text-slate-600 leading-relaxed">
            Discover in-depth buyer guides, behind-the-scenes engineering breakthroughs, and tips
            to maximize your home cinema and audio experience.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-md">
            <div className="relative flex items-center">
              <Search className="absolute left-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search articles, guides, or tech..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3 pl-10 pr-10 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-[#0a7ae6] focus:ring-4 focus:ring-[#0a7ae6]/10"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 rounded-full p-1 text-slate-400 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full px-4 py-1.5 text-xs sm:text-sm font-semibold transition-all ${
                    active
                      ? "bg-[#0a7ae6] text-white shadow-sm scale-105"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 sm:py-16 lg:px-8 xl:px-12">
        {/* Featured Hero Article */}
        {featuredPost && (
          <div className="mb-12">
            <div className="group relative overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:shadow-xl lg:grid lg:grid-cols-12">
              <div className="relative aspect-[16/10] overflow-hidden bg-slate-100 lg:col-span-7 lg:aspect-auto min-h-[280px] sm:min-h-[360px]">
                <Image
                  src={featuredPost.image || "/blog-1.png"}
                  alt={featuredPost.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-[#0a7ae6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md">
                  Featured: {featuredPost.category}
                </span>
              </div>

              <div className="flex flex-col justify-center p-6 sm:p-10 lg:col-span-5">
                <div className="flex items-center gap-3 text-xs text-slate-400 mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    {featuredPost.publishedAt
                      ? new Intl.DateTimeFormat("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        }).format(new Date(featuredPost.publishedAt))
                      : featuredPost.date || "Recent"}
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {featuredPost.readTime || "4 min read"}
                  </span>
                </div>

                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-[#0a7ae6] transition-colors">
                  {featuredPost.title}
                </h2>

                <p className="mt-3 text-sm sm:text-base text-slate-500 leading-relaxed line-clamp-3">
                  {featuredPost.excerpt}
                </p>

                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-[#0a7ae6]">
                  <span>Read full story</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

              {/* Full Card Link */}
              <Link
                prefetch={false}
                href={`/blog/${featuredPost.slug || featuredPost.id}`}
                className="absolute inset-0 z-10"
                aria-label={`Read ${featuredPost.title}`}
              />
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        {remainingPosts.length > 0 ? (
          <div>
            {featuredPost && (
              <h3 className="mb-6 text-lg sm:text-xl font-bold text-slate-900">
                More Articles & Guides
              </h3>
            )}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {remainingPosts.map((post) => {
                const formattedDate = post.publishedAt
                  ? new Intl.DateTimeFormat("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(post.publishedAt))
                  : post.date || "Recent";

                const postSlug = post.slug || String(post.id);

                return (
                  <article
                    key={post.id}
                    className="group relative flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
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

                    {/* Card Link */}
                    <Link
                      prefetch={false}
                      href={`/blog/${postSlug}`}
                      className="absolute inset-0 z-10"
                      aria-label={`Read: ${post.title}`}
                    />
                  </article>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="py-16 text-center">
            <p className="text-base font-semibold text-slate-700">No articles found matching your filter.</p>
            <p className="mt-1 text-sm text-slate-400">Try searching for a different keyword or reset your filters.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
              className="mt-4 rounded-xl bg-[#0a7ae6] px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-[#025bb5]"
            >
              Reset Filters
            </button>
          </div>
        )}
      </section>
    </div>
  );
}
