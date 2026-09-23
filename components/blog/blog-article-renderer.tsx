"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  ExternalLink,
  Headphones,
  ListOrdered,
  Mail,
  MessageCircle,
  Phone,
  Quote,
  Tag,
  Volume2,
} from "lucide-react";
import { Facebook, Instagram } from "@/components/ui/social-icons";
import { formatINR } from "@/lib/format-price";

export interface BlogPostData {
  id: string | number;
  title: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  category: string;
  image?: string | null;
  readTime?: string | null;
  accentColor?: string | null;
  publishedAt?: string | Date | null;
  date?: string;
}

export interface FeaturedProductItem {
  id: string;
  slug: string;
  name: string;
  price: string | number;
  oldPrice?: string | number | null;
  discount?: string | null;
  image?: string | null;
  images?: string[];
  description?: string | null;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function InlineFormattedText({ text }: { text: string }) {
  const parts: React.ReactNode[] = [];
  const regex = /(\*\*([^*]+)\*\*)|(\[([^\]]+)\]\((https?:\/\/[^\s)]+)\))/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let keyIdx = 0;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    if (match[1]) {
      parts.push(
        <strong key={`b-${keyIdx++}`} className="font-bold text-slate-900">
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      parts.push(
        <a
          key={`a-${keyIdx++}`}
          href={match[5]}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-[#0a7ae6] underline decoration-[#0a7ae6]/40 underline-offset-4 hover:text-[#025bb5] transition-colors"
        >
          {match[4]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <>{parts.length > 0 ? parts : text}</>;
}

function ArticleBodyContent({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const lines = content.split("\n");
    const result: Array<{
      type: "h1" | "h2" | "h3" | "list" | "quote" | "paragraph";
      text: string | string[];
      id?: string;
    }> = [];

    let currentList: string[] = [];
    const flushList = () => {
      if (currentList.length > 0) {
        result.push({ type: "list", text: [...currentList] });
        currentList = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();

      if (!line) {
        flushList();
        continue;
      }

      if (line.startsWith("- ") || line.startsWith("* ")) {
        currentList.push(line.slice(2));
        continue;
      }

      flushList();

      if (line.startsWith("### ")) {
        const text = line.slice(4);
        result.push({ type: "h3", text, id: slugify(text) });
      } else if (line.startsWith("## ")) {
        const text = line.slice(3);
        result.push({ type: "h2", text, id: slugify(text) });
      } else if (line.startsWith("# ")) {
        const text = line.slice(2);
        result.push({ type: "h1", text, id: slugify(text) });
      } else if (line.startsWith("> ")) {
        result.push({ type: "quote", text: line.slice(2) });
      } else {
        result.push({ type: "paragraph", text: line });
      }
    }

    flushList();
    return result;
  }, [content]);

  return (
    <div className="space-y-6 text-[16px] sm:text-[17px] leading-[1.9] text-slate-700">
      {blocks.map((block, idx) => {
        if (block.type === "h1") {
          return (
            <h1
              key={idx}
              id={block.id}
              className="scroll-mt-28 pt-8 pb-2 text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900 border-b border-slate-100"
            >
              <InlineFormattedText text={block.text as string} />
            </h1>
          );
        }

        if (block.type === "h2") {
          return (
            <div key={idx} id={block.id} className="scroll-mt-28 pt-10 pb-1">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#0a7ae6] mb-2">
                <span className="h-1.5 w-6 rounded-full bg-[#0a7ae6]" />
                <span>Section {idx + 1}</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                <InlineFormattedText text={block.text as string} />
              </h2>
            </div>
          );
        }

        if (block.type === "h3") {
          return (
            <h3
              key={idx}
              id={block.id}
              className="scroll-mt-28 pt-6 pb-1 text-lg sm:text-xl font-bold tracking-tight text-slate-900"
            >
              <InlineFormattedText text={block.text as string} />
            </h3>
          );
        }

        if (block.type === "list") {
          return (
            <ul key={idx} className="my-5 space-y-3 rounded-2xl bg-slate-50/70 p-5 sm:p-6 border border-slate-100">
              {(block.text as string[]).map((item, itemIdx) => (
                <li key={itemIdx} className="flex items-start gap-3 text-slate-700">
                  <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-[#0a7ae6]" />
                  <span className="leading-relaxed">
                    <InlineFormattedText text={item} />
                  </span>
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <div
              key={idx}
              className="my-8 relative overflow-hidden rounded-2xl border-l-4 border-[#0a7ae6] bg-gradient-to-r from-blue-50/60 to-transparent p-6 sm:p-8"
            >
              <Quote className="h-8 w-8 text-[#0a7ae6]/30 mb-2" />
              <p className="text-base sm:text-lg font-medium italic text-slate-800 leading-relaxed">
                <InlineFormattedText text={block.text as string} />
              </p>
            </div>
          );
        }

        return (
          <p key={idx} className="leading-[1.9] text-slate-700">
            <InlineFormattedText text={block.text as string} />
          </p>
        );
      })}
    </div>
  );
}

function BestSellerProductCard({ products }: { products: FeaturedProductItem[] }) {
  const [index, setIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const count = products.length;
  const current = products[index] || products[0];

  useEffect(() => {
    if (count <= 1 || isHovered) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % count);
    }, 4000);
    return () => clearInterval(timer);
  }, [count, isHovered]);

  if (!current) return null;

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev - 1 + count) % count);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIndex((prev) => (prev + 1) % count);
  };

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs hover:shadow-md transition-all duration-300"
    >
      {/* Top Header with Best Seller Badge & Next/Prev Controls */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 rounded-full bg-amber-50 border border-amber-200/80 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
          <span className="text-amber-500">★</span>
          <span>BEST SELLER</span>
        </div>

        {count > 1 && (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              aria-label="Previous best seller"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#0a7ae6] hover:text-white transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              aria-label="Next best seller"
              className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-[#0a7ae6] hover:text-white transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Product Image */}
      <Link
        href={`/product/${current.slug || current.id}`}
        className="group/img block relative aspect-square w-full overflow-hidden rounded-xl bg-slate-50 mb-3 border border-slate-100"
      >
        <Image
          key={current.id + "-img"}
          src={current.image || "/category-projector.png"}
          alt={current.name}
          fill
          sizes="300px"
          className="object-contain p-2 transition-transform duration-500 group-hover/img:scale-105"
        />
        {current.discount && (
          <span className="absolute top-2.5 right-2.5 rounded-md bg-emerald-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-xs">
            {current.discount}
          </span>
        )}
      </Link>

      {/* Title */}
      <Link href={`/product/${current.slug || current.id}`}>
        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug hover:text-[#0a7ae6] transition-colors">
          {current.name}
        </h4>
      </Link>

      {/* Price */}
      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-base font-black text-slate-900">
          {formatINR(current.price)}
        </span>
        {current.oldPrice && (
          <span className="text-xs text-slate-400 line-through">
            {formatINR(current.oldPrice)}
          </span>
        )}
      </div>

      {/* Trust reassurance */}
      <div className="mt-2.5 flex items-center justify-between border-t border-slate-100 pt-2.5 text-[11px] text-slate-500">
        <span className="flex items-center gap-1 font-medium text-emerald-600">
          <Check className="h-3 w-3" />
          Official Store
        </span>
        <span>•</span>
        <span>1-Year Warranty</span>
      </div>

      {/* Action button */}
      <Link
        href={`/product/${current.slug || current.id}`}
        className="mt-3.5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#025bb5] transition-colors"
      >
        <span>View Product</span>
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>

      {/* Pagination dots when multiple products exist */}
      {count > 1 && (
        <div className="mt-3 flex items-center justify-center gap-1.5">
          {products.map((_, dotIdx) => (
            <button
              key={`dot-${dotIdx}`}
              type="button"
              aria-label={`Show product ${dotIdx + 1}`}
              onClick={() => setIndex(dotIdx)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                dotIdx === index
                  ? "w-5 bg-[#0a7ae6]"
                  : "w-1.5 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function BlogArticleRenderer({
  post,
  relatedPosts = [],
  featuredProduct = null,
  bestSellerProducts = [],
}: {
  post: BlogPostData;
  relatedPosts?: BlogPostData[];
  featuredProduct?: FeaturedProductItem | null;
  bestSellerProducts?: FeaturedProductItem[];
}) {
  const [copied, setCopied] = useState(false);

  // Extract table of contents from headers (##)
  const toc = useMemo(() => {
    if (!post.content) return [];
    const lines = post.content.split("\n");
    const headings: Array<{ text: string; id: string }> = [];
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (line.startsWith("## ")) {
        const text = line.slice(3).trim();
        headings.push({ text, id: slugify(text) });
      }
    }
    return headings;
  }, [post.content]);

  // Key takeaways derived from excerpt or initial bullets
  const keyTakeaways = useMemo(() => {
    const list: string[] = [];
    if (post.excerpt) {
      list.push(post.excerpt);
    }
    if (post.content) {
      const lines = post.content.split("\n");
      for (const line of lines) {
        const trimmed = line.trim();
        if ((trimmed.startsWith("- ") || trimmed.startsWith("* ")) && list.length < 4) {
          list.push(trimmed.slice(2).replace(/\*\*/g, ""));
        }
      }
    }
    return list;
  }, [post.excerpt, post.content]);

  const formattedDate = useMemo(() => {
    if (post.publishedAt) {
      return new Intl.DateTimeFormat("en-IN", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).format(new Date(post.publishedAt));
    }
    return post.date || "Recent";
  }, [post.publishedAt, post.date]);

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleWhatsAppShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(
        `${post.title} - Read more on XElectron:\n${window.location.href}`
      )}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleFacebookShare = () => {
    if (typeof window !== "undefined") {
      const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
        window.location.href
      )}`;
      window.open(shareUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleInstagramShare = () => {
    if (typeof window !== "undefined") {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).catch(() => {});
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
      window.open("https://www.instagram.com/xelectron_india/", "_blank", "noopener,noreferrer");
    }
  };

  return (
    <article className="w-full bg-white">
      {/* Top Breadcrumb Bar - End to End across 1440px */}
      <div className="w-full border-b border-slate-100 bg-slate-50/50 py-3.5 sm:py-4">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
            <nav className="flex items-center gap-2 overflow-hidden">
              <Link href="/" className="hover:text-slate-900 transition-colors shrink-0">
                Home
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <Link href="/blog" className="hover:text-slate-900 transition-colors shrink-0">
                Blog
              </Link>
              <ChevronRight className="h-3 w-3 text-slate-400 shrink-0" />
              <span className="font-semibold text-[#0a7ae6] truncate max-w-[200px] sm:max-w-md">
                {post.category}
              </span>
            </nav>

            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 font-bold text-slate-700 hover:text-[#0a7ae6] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>All Articles</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main End-to-End Container (max-w-[1440px]) */}
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8 xl:px-12">
        {/* Editorial Header Section */}
        <header className="mb-10 lg:mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0a7ae6] px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-xs">
              <Tag className="h-3 w-3" />
              {post.category}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span>{formattedDate}</span>
            </div>
            <span className="text-slate-300">•</span>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{post.readTime || "4 min read"}</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-[1.15] max-w-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="mt-5 text-base sm:text-xl lg:text-2xl text-slate-600 leading-relaxed font-normal max-w-4xl">
              {post.excerpt}
            </p>
          )}

          {/* Author & Share Bar */}
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-y border-slate-100 py-4.5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0a7ae6] text-white font-black text-sm shadow-xs">
                XE
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">
                  The XElectron Journal
                </p>
                <p className="text-xs text-slate-500">
                  Ideas, Insights & Stories Behind Better Experiences
                </p>
              </div>
            </div>

            {/* Social Share Group */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCopyLink}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:border-slate-300"
                title="Copy article link"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5 text-slate-500" />
                    <span>Copy link</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-bold text-emerald-700 transition hover:bg-emerald-100 shadow-xs"
                title="Share on WhatsApp"
              >
                <MessageCircle className="h-3.5 w-3.5" />
                <span>WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleFacebookShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-2 text-xs font-bold text-[#1877f2] transition hover:bg-blue-100 shadow-xs"
                title="Share on Facebook"
              >
                <Facebook className="h-3.5 w-3.5" />
                <span>Facebook</span>
              </button>

              <button
                type="button"
                onClick={handleInstagramShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-pink-200 bg-pink-50 px-3.5 py-2 text-xs font-bold text-[#e1306c] transition hover:bg-pink-100 shadow-xs"
                title="Share on Instagram / Follow XElectron"
              >
                <Instagram className="h-3.5 w-3.5" />
                <span>Instagram</span>
              </button>
            </div>
          </div>
        </header>

        {/* Cinematic End-to-End Featured Image Banner */}
        <div className="relative mb-12 sm:mb-16 w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-slate-100 shadow-xl border border-slate-100 aspect-[16/9] lg:aspect-[21/9] max-h-[580px]">
          <Image
            src={post.image || "/blog-1.png"}
            alt={post.title}
            fill
            priority
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="object-cover"
          />
        </div>

        {/* 3-Column End-to-End Editorial Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">
          {/* LEFT RAIL: Table of Contents & Quick Actions (lg:col-span-3) */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-28 space-y-6">
            {/* Table of contents */}
            {toc.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-xs">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-200/60 text-xs font-bold uppercase tracking-wider text-slate-900">
                  <ListOrdered className="h-4 w-4 text-[#0a7ae6]" />
                  <span>In This Article</span>
                </div>
                <nav className="mt-3 space-y-2">
                  {toc.map((item, idx) => (
                    <a
                      key={idx}
                      href={`#${item.id}`}
                      className="block text-xs font-medium text-slate-600 hover:text-[#0a7ae6] hover:translate-x-1 transition-all leading-snug line-clamp-2"
                    >
                      {item.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Customer Care & Contact Section */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-5 shadow-xs space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-200/70 text-xs font-bold uppercase tracking-wider text-slate-900">
                <Headphones className="h-4 w-4 text-[#0a7ae6]" />
                <span>Customer Care & Contact</span>
              </div>

              <div className="space-y-3 text-xs">
                <a
                  href="tel:8527312304"
                  className="flex items-center gap-2.5 font-semibold text-slate-800 hover:text-[#0a7ae6] transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100/70 text-[#0a7ae6] group-hover:bg-[#0a7ae6] group-hover:text-white transition-colors">
                    <Phone className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Customer Care</p>
                    <p className="font-bold text-slate-900">+91 8527312304</p>
                  </div>
                </a>

                <a
                  href="https://wa.me/918527312304?text=Hi%20XElectron%20team,%20I%20have%20a%20query%20regarding%20products."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 font-semibold text-slate-800 hover:text-emerald-600 transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100/80 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <MessageCircle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-medium">WhatsApp Support</p>
                    <p className="font-bold text-slate-900">8527312304</p>
                  </div>
                </a>

                <a
                  href="mailto:customercare@xelectron.com"
                  className="flex items-center gap-2.5 font-semibold text-slate-800 hover:text-[#0a7ae6] transition-colors group"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-200/80 text-slate-700 group-hover:bg-slate-700 group-hover:text-white transition-colors">
                    <Mail className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-medium">Email Support</p>
                    <p className="font-bold text-slate-900 truncate">customercare@xelectron.com</p>
                  </div>
                </a>
              </div>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                <span>Mon – Sat: 10 AM – 6 PM</span>
                <Link href="/contact" className="font-bold text-[#0a7ae6] hover:underline">
                  Visit Contact Page →
                </Link>
              </div>
            </div>
          </aside>

          {/* CENTER RAIL: Main Editorial Content (lg:col-span-6) */}
          <div className="lg:col-span-6 space-y-8">
            {/* Key Takeaways Highlight Box */}
            {keyTakeaways.length > 0 && (
              <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-slate-50 to-white p-6 shadow-xs">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#0a7ae6] mb-3">
                  <BookOpen className="h-4 w-4" />
                  <span>Key Takeaways at a Glance</span>
                </div>
                <ul className="space-y-2.5 text-sm text-slate-700">
                  {keyTakeaways.slice(0, 3).map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2.5">
                      <span className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#0a7ae6] text-[10px] font-bold text-white">
                        ✓
                      </span>
                      <span className="leading-relaxed">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Full Body Markdown Content */}
            <ArticleBodyContent
              content={post.content || post.excerpt || "No content available for this story."}
            />
          </div>

          {/* RIGHT RAIL: Product Spotlight & Related Stories (lg:col-span-3) */}
          <aside className="lg:col-span-3 sticky top-28 space-y-6">
            {/* Best Seller Auto-Rotating Showcase Card */}
            {bestSellerProducts.length > 0 ? (
              <BestSellerProductCard products={bestSellerProducts} />
            ) : featuredProduct ? (
              <BestSellerProductCard products={[featuredProduct]} />
            ) : (
              <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs">
                <span className="rounded-full bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold uppercase text-[#0a7ae6]">
                  Sound Engineering
                </span>
                <h4 className="mt-3 text-sm font-bold text-slate-900">
                  Experience True Studio Clarity
                </h4>
                <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
                  Discover speakers and cinema projectors tuned with passive radiators and balanced DSP.
                </p>
                <Link
                  href="/shop"
                  className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-[#0a7ae6] hover:underline"
                >
                  <span>Explore XElectron Lineup</span>
                  <ArrowRight className="h-3 w-3" />
                </Link>
              </div>
            )}

            {/* Trending Articles Rail */}
            {relatedPosts.length > 0 && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 shadow-xs">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
                  Trending Stories
                </p>
                <div className="space-y-3.5">
                  {relatedPosts.slice(0, 3).map((rel) => {
                    const relSlug = rel.slug || String(rel.id);
                    return (
                      <Link
                        key={rel.id}
                        href={`/blog/${relSlug}`}
                        className="group flex items-start gap-3 transition-transform hover:-translate-y-0.5"
                      >
                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-slate-200 border border-slate-100">
                          <Image
                            src={rel.image || "/blog-1.png"}
                            alt={rel.title}
                            fill
                            sizes="56px"
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-slate-800 line-clamp-2 group-hover:text-[#0a7ae6] transition-colors leading-snug">
                            {rel.title}
                          </h5>
                          <span className="mt-1 block text-[11px] text-slate-400">
                            {rel.readTime || "4 min read"}
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Bottom Full-Width CTA Banner - Brand Blue Theme with Refined Font Weight */}
        <div className="mt-16 sm:mt-20 overflow-hidden rounded-3xl bg-gradient-to-r from-[#0a7ae6] via-[#0266c8] to-[#014d99] p-8 sm:p-12 text-white shadow-xl shadow-blue-500/15 border border-blue-400/20">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl">
              <span className="rounded-full bg-white/20 backdrop-blur-xs px-3.5 py-1 text-xs font-medium uppercase tracking-wider text-white">
                Acoustics & Home Cinema
              </span>
              <h3 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-normal tracking-tight text-white leading-snug">
                Ready to Upgrade Your Everyday Audio Experience?
              </h3>
              <p className="mt-2.5 text-sm sm:text-base text-blue-50/90 font-light leading-relaxed">
                Discover XElectron&apos;s full lineup of smart projectors, high-definition displays, and wireless speakers with nationwide 1-year warranty coverage.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-2.5 text-sm font-medium text-[#0a7ae6] shadow-md hover:bg-slate-50 transition active:scale-95"
              >
                <span>Explore Store</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur-xs px-6 py-2.5 text-sm font-medium text-white hover:bg-white/25 transition active:scale-95"
              >
                <span>All Stories</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Related Stories Grid - Across 1440px */}
        {relatedPosts.length > 0 && (
          <section className="mt-16 sm:mt-20 border-t border-slate-100 pt-12">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">
                  Keep Exploring
                </p>
                <h3 className="text-2xl sm:text-3xl font-normal sm:font-medium tracking-tight text-slate-900">
                  Recommended For You
                </h3>
              </div>
              <Link
                href="/blog"
                className="text-xs sm:text-sm font-bold text-[#0a7ae6] hover:text-[#025bb5] transition-colors"
              >
                View all stories →
              </Link>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {relatedPosts.slice(0, 3).map((rel) => {
                const relDate = rel.publishedAt
                  ? new Intl.DateTimeFormat("en-IN", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    }).format(new Date(rel.publishedAt))
                  : rel.date || "Recent";

                const relSlug = rel.slug || String(rel.id);

                return (
                  <Link
                    key={rel.id}
                    href={`/blog/${relSlug}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs transition-all duration-300 hover:shadow-xl hover:-translate-y-1 hover:border-slate-200"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                      <Image
                        src={rel.image || "/blog-1.png"}
                        alt={rel.title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <span className="absolute top-3 left-3 rounded-full bg-[#0a7ae6] px-3 py-1 text-[11px] font-bold uppercase text-white shadow-xs">
                        {rel.category}
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h4 className="text-base font-bold text-slate-900 line-clamp-2 group-hover:text-[#0a7ae6] transition-colors leading-snug">
                        {rel.title}
                      </h4>
                      <p className="mt-2 flex-1 text-sm text-slate-500 line-clamp-2 leading-relaxed">
                        {rel.excerpt}
                      </p>
                      <div className="mt-4 flex items-center justify-between border-t border-slate-50 pt-3 text-xs text-slate-400">
                        <span>{relDate}</span>
                        <span>{rel.readTime || "4 min read"}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
