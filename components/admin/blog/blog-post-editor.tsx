"use client";

import { type FormEvent, type ReactNode, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Bold,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Columns2,
  ExternalLink,
  Eye,
  FileEdit,
  FileText,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  LoaderCircle,
  Minus,
  Quote,
  Sparkles,
  Tag,
  Upload,
  X,
} from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { uploadProductImage } from "@/lib/client/upload-product-image";

export type BlogPostItem = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string;
  image: string | null;
  readTime: string | null;
  accentColor: string | null;
  isActive: boolean;
  sortOrder: number;
  publishedAt: string;
  createdAt: string;
};

const inputClass =
  "h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-[#0a7ae6] focus:ring-3 focus:ring-[#0a7ae6]/10";

const QUICK_CATEGORIES = [
  "Technology",
  "Acoustics & Sound",
  "Smart Living",
  "Projectors",
  "Guides",
  "Product News",
];

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function wordCount(content: string) {
  return content.trim().split(/\s+/).filter(Boolean).length;
}

function insertAtCursor(
  textarea: HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void,
  prefix: string
) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const separator = start > 0 && value[start - 1] !== "\n" ? "\n\n" : "";
  const insertion = `${separator}${prefix}`;
  const nextValue = `${value.slice(0, start)}${insertion}${value.slice(start, end)}${value.slice(end)}`;
  setValue(nextValue);
  requestAnimationFrame(() => {
    textarea.focus();
    const cursor = start + insertion.length;
    textarea.setSelectionRange(cursor, cursor);
  });
}

function wrapSelection(
  textarea: HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void,
  wrapper: string
) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end) || "text";
  const insertion = `${wrapper}${selectedText}${wrapper}`;
  const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
  setValue(nextValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + wrapper.length, start + wrapper.length + selectedText.length);
  });
}

function insertLinkAtCursor(
  textarea: HTMLTextAreaElement | null,
  value: string,
  setValue: (next: string) => void
) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end) || "link text";
  const providedUrl = window.prompt("Enter or paste URL", "https://");
  if (!providedUrl?.trim() || providedUrl === "https://") return;
  const url = /^https?:\/\//i.test(providedUrl.trim()) ? providedUrl.trim() : `https://${providedUrl.trim()}`;
  const insertion = `[${selectedText}](${url})`;
  const nextValue = `${value.slice(0, start)}${insertion}${value.slice(end)}`;
  setValue(nextValue);
  requestAnimationFrame(() => {
    textarea.focus();
    textarea.setSelectionRange(start + 1, start + 1 + selectedText.length);
  });
}

function InlineContent({ text }: { text: string }) {
  // Parse links [text](url) and bold **text** and italic *text*
  const parts: ReactNode[] = [];
  const regex = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let idx = 0;

  while ((match = regex.exec(text))) {
    if (match.index > cursor) {
      parts.push(text.slice(cursor, match.index));
    }
    if (match[1] && match[2]) {
      // Link
      parts.push(
        <a
          key={`link-${idx++}`}
          href={match[2]}
          target="_blank"
          rel="noreferrer"
          className="font-medium text-[#0a7ae6] underline decoration-[#0a7ae6]/35 underline-offset-4 hover:text-[#075faf]"
        >
          {match[1]}
        </a>
      );
    } else if (match[3]) {
      // Bold
      parts.push(
        <strong key={`bold-${idx++}`} className="font-semibold text-slate-900">
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Italic
      parts.push(
        <em key={`italic-${idx++}`} className="italic text-slate-700">
          {match[4]}
        </em>
      );
    }
    cursor = match.index + match[0].length;
  }

  if (cursor < text.length) {
    parts.push(text.slice(cursor));
  }

  return <>{parts}</>;
}

function ArticleBody({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const result: Array<{
      type: "h1" | "h2" | "h3" | "list" | "ordered-list" | "quote" | "divider" | "paragraph";
      text: string | string[];
    }> = [];
    const lines = content.split("\n");
    let bulletList: string[] = [];
    let orderedList: string[] = [];

    const flushLists = () => {
      if (bulletList.length) {
        result.push({ type: "list", text: bulletList });
        bulletList = [];
      }
      if (orderedList.length) {
        result.push({ type: "ordered-list", text: orderedList });
        orderedList = [];
      }
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) {
        flushLists();
        continue;
      }
      if (line === "---" || line === "***") {
        flushLists();
        result.push({ type: "divider", text: "" });
        continue;
      }
      if (line.startsWith("- ") || line.startsWith("* ")) {
        if (orderedList.length) flushLists();
        bulletList.push(line.slice(2));
        continue;
      }
      if (/^\d+\.\s/.test(line)) {
        if (bulletList.length) flushLists();
        orderedList.push(line.replace(/^\d+\.\s/, ""));
        continue;
      }
      flushLists();
      if (line.startsWith("### ")) result.push({ type: "h3", text: line.slice(4) });
      else if (line.startsWith("## ")) result.push({ type: "h2", text: line.slice(3) });
      else if (line.startsWith("# ")) result.push({ type: "h1", text: line.slice(2) });
      else if (line.startsWith("> ")) result.push({ type: "quote", text: line.slice(2) });
      else result.push({ type: "paragraph", text: line });
    }
    flushLists();
    return result;
  }, [content]);

  if (!blocks.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
        <FileText className="size-10 stroke-[1.5] text-slate-300 mb-3" />
        <p className="text-sm font-medium text-slate-500">Live preview will render here</p>
        <p className="mt-1 text-xs text-slate-400 max-w-xs">
          Start typing in the writing editor or use formatting buttons to build your article.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-[16px] sm:text-[17px] leading-8 text-slate-700">
      {blocks.map((block, index) => {
        if (block.type === "h1") {
          return (
            <h1
              key={index}
              className="pt-6 font-serif text-2xl sm:text-3xl font-semibold leading-tight tracking-tight text-slate-900 border-b border-slate-100 pb-2"
            >
              <InlineContent text={block.text as string} />
            </h1>
          );
        }
        if (block.type === "h2") {
          return (
            <h2
              key={index}
              className="pt-5 font-serif text-xl sm:text-2xl font-semibold leading-tight tracking-tight text-slate-900"
            >
              <InlineContent text={block.text as string} />
            </h2>
          );
        }
        if (block.type === "h3") {
          return (
            <h3
              key={index}
              className="pt-3 text-base sm:text-lg font-semibold leading-tight text-slate-900"
            >
              <InlineContent text={block.text as string} />
            </h3>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={index} className="space-y-2 border-l-2 border-[#0a7ae6]/30 pl-4 sm:pl-5 my-3">
              {(block.text as string[]).map((item, itemIndex) => (
                <li key={itemIndex} className="text-slate-700">
                  <span className="text-[#0a7ae6] mr-2">•</span>
                  <InlineContent text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ordered-list") {
          return (
            <ol key={index} className="space-y-2 pl-6 list-decimal marker:font-semibold marker:text-[#0a7ae6] my-3">
              {(block.text as string[]).map((item, itemIndex) => (
                <li key={itemIndex} className="text-slate-700 pl-1">
                  <InlineContent text={item} />
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === "quote") {
          return (
            <blockquote
              key={index}
              className="border-l-4 border-[#0a7ae6] bg-blue-50/40 rounded-r-xl py-3 px-5 font-serif text-lg italic leading-relaxed text-slate-800 my-4"
            >
              <InlineContent text={block.text as string} />
            </blockquote>
          );
        }
        if (block.type === "divider") {
          return <hr key={index} className="my-6 border-slate-200" />;
        }
        return (
          <p key={index} className="leading-relaxed">
            <InlineContent text={block.text as string} />
          </p>
        );
      })}
    </div>
  );
}

export function BlogPostEditor({ post }: { post?: BlogPostItem }) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isNew = !post;

  const [title, setTitle] = useState(post?.title ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [category, setCategory] = useState(post?.category ?? "Technology");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [isActive, setIsActive] = useState(post?.isActive ?? true);
  const [viewMode, setViewMode] = useState<"split" | "write" | "preview">("split");
  const [showUrlInput, setShowUrlInput] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");

  const previewImage = image.trim();
  const calculatedReadTime = readingTime(content || excerpt);
  const words = wordCount(content || "");
  const displayDate = post?.publishedAt
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(post.publishedAt))
    : "Today";

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsUploading(true);
    setError("");
    try {
      const uploadedImage = await uploadProductImage(file);
      setImage(uploadedImage.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload cover image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Please add an article title before saving.");
      return;
    }
    if (!previewImage) {
      setError("Please upload a cover image or provide an image URL before publishing.");
      return;
    }

    setIsSaving(true);
    setError("");
    const payload = {
      title: title.trim(),
      slug: slug.trim() || undefined,
      category: category.trim() || "Technology",
      excerpt: excerpt.trim() || null,
      content: content.trim() || null,
      image: previewImage,
      readTime: calculatedReadTime,
      isActive,
    };

    try {
      const response = await fetch(post ? `/api/blog/${post.id}` : "/api/blog", {
        method: post ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to save the blog post.");
      }
      router.push("/dashboard/blog");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the blog post.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 pb-16">
      <form onSubmit={savePost} className="relative">
        {/* Sticky Top Header Bar */}
        <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 px-4 py-3 sm:px-8 backdrop-blur-md shadow-xs">
          <div className="mx-auto flex max-w-[1600px] flex-wrap items-center justify-between gap-3">
            {/* Left: Back Link & Post Title */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                prefetch={false}
                href="/dashboard/blog"
                className="inline-flex size-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-xs hover:border-slate-300 hover:bg-slate-50 transition-colors shrink-0"
                aria-label="Back to all stories"
              >
                <ArrowLeft className="size-4" />
              </Link>
              <div className="min-w-0">
                <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                  <Link href="/dashboard/blog" className="hover:text-[#0a7ae6] transition-colors">
                    From Our Blog
                  </Link>
                  <span>/</span>
                  <span className="text-slate-800 font-normal">
                    {isNew ? "Create Story" : "Edit Story"}
                  </span>
                  <span
                    className={`ml-1.5 inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`size-1.5 rounded-full ${
                        isActive ? "bg-emerald-500" : "bg-slate-400"
                      }`}
                    />
                    {isActive ? "Published" : "Draft"}
                  </span>
                </div>
                <h1 className="text-sm sm:text-base font-medium tracking-tight text-slate-900 truncate max-w-[320px] sm:max-w-[500px]">
                  {title.trim() || (isNew ? "Untitled Story" : "Edit Story")}
                </h1>
              </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
              {!isNew && (
                <Link
                  href={`/blog/${post.slug || post.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:inline-flex h-9 items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 text-xs font-medium text-slate-700 shadow-xs hover:bg-slate-50 hover:text-[#0a7ae6] transition-colors"
                >
                  <ExternalLink className="size-3.5" />
                  <span>View live post</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => setPreviewOpen(true)}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#0a7ae6]/25 bg-blue-50/50 px-3.5 text-xs font-medium text-[#0a7ae6] shadow-xs hover:bg-[#0a7ae6]/10 transition-colors"
              >
                <Eye className="size-3.5" />
                <span>Preview</span>
              </button>

              <Link
                prefetch={false}
                href="/dashboard/blog"
                className="inline-flex h-9 items-center rounded-xl px-3 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              >
                Discard
              </Link>

              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#0a7ae6] px-4.5 text-xs font-medium text-white shadow-sm hover:bg-[#0869c4] transition-colors disabled:cursor-wait disabled:bg-[#0a7ae6]/40 active:scale-98"
              >
                {isSaving ? (
                  <LoaderCircle className="size-3.5 animate-spin" />
                ) : (
                  <CheckCircle2 className="size-3.5" />
                )}
                <span>{isSaving ? "Saving…" : isNew ? "Publish story" : "Save changes"}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <div className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">
          {error ? (
            <div
              role="alert"
              className="mb-6 flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-xs"
            >
              <span>{error}</span>
              <button
                type="button"
                onClick={() => setError("")}
                className="text-red-600 hover:text-red-900"
              >
                <X className="size-4" />
              </button>
            </div>
          ) : null}

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px] items-start">
            {/* Left Column: Story Essentials & Article Editor */}
            <div className="space-y-6 min-w-0">
              {/* Card 1: Story Details */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]">
                    <FileText className="size-4" />
                  </span>
                  <div>
                    <h2 className="text-sm font-semibold text-slate-900">Story essentials</h2>
                    <p className="text-[11px] text-slate-500">Core headline and card excerpt</p>
                  </div>
                </div>

                <div className="p-6 space-y-5">
                  {/* Title */}
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>
                        Article title <span className="text-red-500">*</span>
                      </span>
                      <span className="text-[11px] font-normal text-slate-400">
                        {title.length} characters
                      </span>
                    </label>
                    <input
                      value={title}
                      onChange={(event) => {
                        setTitle(event.target.value);
                        if (isNew && !slug) {
                          setSlug(
                            event.target.value
                              .toLowerCase()
                              .replace(/[^\w\s-]/g, "")
                              .replace(/\s+/g, "-")
                          );
                        }
                      }}
                      placeholder="e.g. Behind the Sound: How We Engineer Deep Bass in Compact Bodies"
                      className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-base sm:text-lg font-medium text-slate-900 outline-none transition-all placeholder:text-slate-300 focus:border-[#0a7ae6] focus:ring-4 focus:ring-[#0a7ae6]/10"
                      required
                    />
                  </div>

                  {/* Excerpt */}
                  <div className="space-y-1.5">
                    <label className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Short excerpt</span>
                      <span className="text-[11px] font-normal text-slate-400">
                        Appears on blog card & search previews
                      </span>
                    </label>
                    <textarea
                      value={excerpt}
                      onChange={(event) => setExcerpt(event.target.value)}
                      rows={3}
                      placeholder="A short, compelling summary of the article that hooks readers."
                      className="w-full resize-y rounded-xl border border-slate-200 bg-white p-3.5 text-sm leading-relaxed text-slate-700 outline-none transition-all placeholder:text-slate-300 focus:border-[#0a7ae6] focus:ring-4 focus:ring-[#0a7ae6]/10"
                    />
                  </div>

                  {/* URL Slug Preview */}
                  <div className="flex flex-wrap items-center gap-2 rounded-xl bg-slate-50 border border-slate-200/80 px-3.5 py-2.5 text-xs text-slate-600">
                    <span className="font-semibold text-slate-500">Public URL:</span>
                    <span className="text-slate-400">/blog/</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="custom-slug"
                      className="bg-transparent font-mono text-slate-800 outline-none border-b border-dashed border-slate-300 focus:border-[#0a7ae6] px-1 py-0.5"
                    />
                  </div>
                </div>
              </section>

              {/* Card 2: Article Editor */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                {/* Header with Title & View Mode Switcher */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4 bg-slate-50/50">
                  <div className="flex items-center gap-2.5">
                    <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]">
                      <BookOpen className="size-4" />
                    </span>
                    <div>
                      <h2 className="text-sm font-semibold text-slate-900">Article content</h2>
                      <p className="text-[11px] text-slate-500">
                        Markdown enabled with real-time preview
                      </p>
                    </div>
                  </div>

                  {/* View Mode Segmented Control */}
                  <div className="flex items-center rounded-xl bg-slate-200/70 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewMode("split")}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                        viewMode === "split"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Columns2 className="size-3.5" />
                      <span>Split view</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("write")}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                        viewMode === "write"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <FileEdit className="size-3.5" />
                      <span>Write</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode("preview")}
                      className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 font-medium transition-all ${
                        viewMode === "preview"
                          ? "bg-white text-slate-900 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      <Eye className="size-3.5" />
                      <span>Preview</span>
                    </button>
                  </div>
                </div>

                {/* Rich Formatting Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 bg-white px-6 py-2.5">
                  <div className="flex flex-wrap items-center gap-1">
                    {/* Headings */}
                    <button
                      type="button"
                      title="Heading 1"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "# ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Heading1 className="size-3.5 text-[#0a7ae6]" />
                      <span>H1</span>
                    </button>
                    <button
                      type="button"
                      title="Heading 2"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "## ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Heading2 className="size-3.5 text-[#0a7ae6]" />
                      <span>H2</span>
                    </button>
                    <button
                      type="button"
                      title="Heading 3"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "### ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Heading3 className="size-3.5 text-[#0a7ae6]" />
                      <span>H3</span>
                    </button>

                    <div className="mx-1 h-5 w-px bg-slate-200" />

                    {/* Inline formatting */}
                    <button
                      type="button"
                      title="Bold text"
                      onClick={() => wrapSelection(contentRef.current, content, setContent, "**")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Bold className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Italic text"
                      onClick={() => wrapSelection(contentRef.current, content, setContent, "*")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Italic className="size-3.5" />
                    </button>

                    <div className="mx-1 h-5 w-px bg-slate-200" />

                    {/* Elements */}
                    <button
                      type="button"
                      title="Bullet list"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "- ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <List className="size-3.5" />
                      <span className="hidden sm:inline">Bullets</span>
                    </button>
                    <button
                      type="button"
                      title="Numbered list"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "1. ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <ListOrdered className="size-3.5" />
                      <span className="hidden sm:inline">Numbers</span>
                    </button>
                    <button
                      type="button"
                      title="Quote callout"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "> ")}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Quote className="size-3.5" />
                      <span className="hidden sm:inline">Quote</span>
                    </button>
                    <button
                      type="button"
                      title="Divider line"
                      onClick={() => insertAtCursor(contentRef.current, content, setContent, "---\n")}
                      className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Minus className="size-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Insert web link"
                      onClick={() => insertLinkAtCursor(contentRef.current, content, setContent)}
                      className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:border-[#0a7ae6]/40 hover:bg-blue-50/50 transition-colors"
                    >
                      <Link2 className="size-3.5 text-[#0a7ae6]" />
                      <span>Link</span>
                    </button>
                  </div>

                  <span className="hidden lg:inline-flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock3 className="size-3.5" />
                    <span>{calculatedReadTime}</span>
                  </span>
                </div>

                {/* Editor Surfaces: Split View, Write Only, or Preview Only */}
                <div className="p-6">
                  <div
                    className={`grid gap-6 ${
                      viewMode === "split"
                        ? "lg:grid-cols-2"
                        : viewMode === "write"
                        ? "grid-cols-1"
                        : "grid-cols-1"
                    }`}
                  >
                    {/* Writing Column */}
                    {viewMode !== "preview" && (
                      <div className="flex flex-col">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                          <span className="uppercase tracking-wider">Markdown Editor</span>
                          <span>Ctrl + B / Ctrl + I shortcuts</span>
                        </div>
                        <textarea
                          ref={contentRef}
                          value={content}
                          onChange={(event) => setContent(event.target.value)}
                          rows={24}
                          placeholder={
                            "Start with an introduction paragraph.\n\n## Section Headline\nExplain the design rationale, technology, and benefits.\n\n- Key feature point\n- Acoustic performance detail\n\n> Quote or engineering insight\n\n---"
                          }
                          className="min-h-[500px] w-full resize-y rounded-xl border border-slate-200 bg-slate-50/50 p-4 font-mono text-sm leading-relaxed text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-[#0a7ae6] focus:bg-white focus:ring-4 focus:ring-[#0a7ae6]/10"
                        />
                      </div>
                    )}

                    {/* Live Preview Column */}
                    {viewMode !== "write" && (
                      <div className="flex flex-col">
                        <div className="mb-2 flex items-center justify-between text-xs font-medium text-slate-400">
                          <span className="uppercase tracking-wider text-[#0a7ae6]">
                            Live Reading Preview
                          </span>
                          <span>Syncs instantly</span>
                        </div>
                        <div className="min-h-[500px] flex-1 overflow-y-auto rounded-xl border border-blue-100 bg-white p-6 shadow-xs">
                          <ArticleBody content={content} />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Footer Hint Bar */}
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-3 text-xs text-slate-400">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        # H1
                      </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        ## H2
                      </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        **bold**
                      </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        *italic*
                      </span>
                      <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                        [title](url)
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      <span>{words} words</span>
                      <span>•</span>
                      <span>{content.length} characters</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Column: Sticky Settings & Cover Rail */}
            <aside className="space-y-6 sticky top-20">
              {/* Cover Image Card */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]">
                    <ImagePlus className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Cover Image
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-3.5">
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/avif,image/gif,image/jpeg,image/png,image/webp"
                    onChange={(event) => void handleImageUpload(event)}
                    className="sr-only"
                  />

                  {previewImage ? (
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 group">
                      <Image
                        src={previewImage}
                        alt="Article cover"
                        fill
                        sizes="320px"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-900/60 opacity-0 transition-opacity group-hover:opacity-100">
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          disabled={isUploading}
                          className="inline-flex items-center gap-1 rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm hover:bg-slate-50 transition"
                        >
                          <Upload className="size-3.5" />
                          <span>Replace</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setImage("")}
                          className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-red-700 transition"
                        >
                          <X className="size-3.5" />
                          <span>Remove</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      disabled={isUploading}
                      className="relative flex aspect-[16/10] w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/60 p-4 text-center text-slate-500 transition hover:border-[#0a7ae6]/50 hover:bg-blue-50/20 disabled:cursor-wait"
                    >
                      <div className="flex size-10 items-center justify-center rounded-full bg-blue-50 text-[#0a7ae6]">
                        {isUploading ? (
                          <LoaderCircle className="size-5 animate-spin" />
                        ) : (
                          <Upload className="size-5" />
                        )}
                      </div>
                      <span className="text-xs font-semibold text-slate-700">
                        {isUploading ? "Uploading image…" : "Upload cover photo"}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Landscape 16:10 format works best
                      </span>
                    </button>
                  )}

                  {/* Toggle URL input */}
                  <div className="pt-1">
                    {!showUrlInput && !previewImage ? (
                      <button
                        type="button"
                        onClick={() => setShowUrlInput(true)}
                        className="text-[11px] font-medium text-[#0a7ae6] hover:underline"
                      >
                        Or paste image URL →
                      </button>
                    ) : (
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-medium text-slate-500">
                          Direct image URL
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            placeholder="https://... or /blog-1.png"
                            className={`${inputClass} text-xs`}
                          />
                          {image && (
                            <button
                              type="button"
                              onClick={() => setImage("")}
                              className="inline-flex size-10 items-center justify-center rounded-xl border border-red-200 text-red-600 hover:bg-red-50 shrink-0"
                            >
                              <X className="size-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </section>

              {/* Story Settings Card */}
              <section className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs">
                <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-3.5 bg-slate-50/50">
                  <span className="flex size-7 items-center justify-center rounded-lg bg-blue-50 text-[#0a7ae6]">
                    <Tag className="size-4" />
                  </span>
                  <div>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                      Story Settings
                    </h3>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-slate-700">
                      Category / Topic
                    </label>
                    <input
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="e.g. Technology"
                      className={inputClass}
                    />

                    {/* Quick topic pills */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {QUICK_CATEGORIES.map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium transition-colors ${
                            category.toLowerCase() === cat.toLowerCase()
                              ? "bg-[#0a7ae6] text-white"
                              : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Published & Active Switch */}
                  <div className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
                    <div>
                      <span className="block text-xs font-semibold text-slate-800">
                        Published & Active
                      </span>
                      <span className="mt-0.5 block text-[11px] text-slate-500">
                        Visible on website and in &quot;From Our Blog&quot;
                      </span>
                    </div>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                  </div>

                  {/* Article Stats info */}
                  <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5 text-xs text-slate-600 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Reading time:</span>
                      <span className="font-semibold text-slate-800 flex items-center gap-1">
                        <Clock3 className="size-3 text-[#0a7ae6]" />
                        {calculatedReadTime}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Total words:</span>
                      <span className="font-semibold text-slate-800">{words}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-400">Published date:</span>
                      <span className="font-semibold text-slate-800">{displayDate}</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Full Article Preview Card - Brand Blue Gradient (No Black Box) */}
              <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[#0a7ae6] via-[#0268ce] to-[#014d99] p-5 text-white shadow-lg shadow-blue-500/15">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-xs text-white">
                    <Eye className="size-4" />
                  </span>
                  <div>
                    <h4 className="text-sm font-medium text-white leading-snug">
                      Full Reading Preview
                    </h4>
                    <p className="mt-1 text-xs text-blue-100/85 font-light leading-relaxed">
                      Check how readers experience the headline, cover photo, and formatted layout.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setPreviewOpen(true)}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-white py-2.5 text-xs font-medium text-[#0a7ae6] shadow-sm hover:bg-blue-50 transition active:scale-98"
                >
                  <span>Open Full Screen Preview</span>
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </form>

      {/* Public Page Simulation Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent
          className="flex h-[calc(100dvh-2rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:!w-[min(1120px,calc(100vw-2rem))] sm:!max-w-[min(1120px,calc(100vw-2rem))]"
          overlayClassName="bg-slate-950/60 supports-backdrop-filter:backdrop-blur-sm"
        >
          <DialogHeader className="flex-row items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
            <DialogTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800">
              <Eye className="size-4 text-[#0a7ae6]" />
              <span>Live Article Reader Preview</span>
            </DialogTitle>
            <span className="text-xs text-slate-400">Includes current unsaved changes</span>
          </DialogHeader>

          <div className="min-h-0 overflow-y-auto bg-white">
            <article className="pb-24">
              <div className="mx-auto max-w-3xl px-6 pt-10 sm:pt-14">
                <span className="inline-flex rounded-full bg-[#0a7ae6]/10 px-3 py-1 text-xs font-semibold text-[#0a7ae6]">
                  {category.trim() || "Technology"}
                </span>

                <h1 className="mt-4 font-serif text-3xl sm:text-5xl font-semibold leading-[1.15] tracking-tight text-slate-950">
                  {title.trim() || "Your story title will appear here"}
                </h1>

                <p className="mt-4 text-base sm:text-lg leading-relaxed text-slate-500">
                  {excerpt.trim() ||
                    "A concise summary will help readers understand why this story matters."}
                </p>

                <div className="mt-6 flex items-center gap-3 text-xs text-slate-400 border-b border-slate-100 pb-6">
                  <span>Published {displayDate}</span>
                  <span>•</span>
                  <span>{calculatedReadTime}</span>
                </div>
              </div>

              {previewImage && (
                <div className="relative mx-auto mt-8 aspect-[16/9] max-w-4xl overflow-hidden rounded-2xl bg-slate-100">
                  <Image
                    src={previewImage}
                    alt="Article cover"
                    fill
                    sizes="1000px"
                    className="object-cover"
                  />
                </div>
              )}

              <div className="mx-auto max-w-3xl px-6 pt-10">
                <ArticleBody content={content} />
              </div>
            </article>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
