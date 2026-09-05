"use client";

import { type FormEvent, type ReactNode, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, BookOpen, CheckCircle2, ChevronRight, Clock3, Eye, FileText, ImagePlus, Link2, List, LoaderCircle, Quote, Tag, Upload, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

const inputClass = "h-10 w-full rounded-lg border border-black/15 bg-white px-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#0a7ae6] focus:ring-3 focus:ring-[#0a7ae6]/10";

function SectionCard({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="overflow-hidden rounded-2xl border border-black/[0.08] bg-white shadow-[0_2px_10px_rgba(15,23,42,0.04)]">
      <div className="flex items-center gap-2 border-b border-black/[0.06] px-5 py-4">
        <span className="text-[#0a7ae6]">{icon}</span>
        <h2 className="text-sm font-semibold tracking-tight text-black/85">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}

function readingTime(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} min read`;
}

function insertAtCursor(textarea: HTMLTextAreaElement | null, value: string, setValue: (next: string) => void, prefix: string) {
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

function insertLinkAtCursor(textarea: HTMLTextAreaElement | null, value: string, setValue: (next: string) => void) {
  if (!textarea) return;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = value.slice(start, end) || "Link text";
  const providedUrl = window.prompt("Paste the link URL", "https://");
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
  const parts: ReactNode[] = [];
  const pattern = /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  let index = 0;
  while ((match = pattern.exec(text))) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(<a key={`${match.index}-${index++}`} href={match[2]} target="_blank" rel="noreferrer" className="font-medium text-[#0a7ae6] underline decoration-[#0a7ae6]/35 underline-offset-4 hover:text-[#075faf]">{match[1]}</a>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <>{parts}</>;
}

function ArticleBody({ content }: { content: string }) {
  const blocks = useMemo(() => {
    const result: Array<{ type: "h1" | "h2" | "h3" | "list" | "quote" | "paragraph"; text: string | string[] }> = [];
    const lines = content.split("\n");
    let listItems: string[] = [];
    const flushList = () => {
      if (listItems.length) result.push({ type: "list", text: listItems });
      listItems = [];
    };

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) { flushList(); continue; }
      if (line.startsWith("- ") || line.startsWith("* ")) { listItems.push(line.slice(2)); continue; }
      flushList();
      if (line.startsWith("### ")) result.push({ type: "h3", text: line.slice(4) });
      else if (line.startsWith("## ")) result.push({ type: "h2", text: line.slice(3) });
      else if (line.startsWith("# ")) result.push({ type: "h1", text: line.slice(2) });
      else if (line.startsWith("> ")) result.push({ type: "quote", text: line.slice(2) });
      else result.push({ type: "paragraph", text: line });
    }
    flushList();
    return result;
  }, [content]);

  if (!blocks.length) return <p className="py-12 text-center text-base text-slate-400">Start writing to see your article preview.</p>;

  return <div className="space-y-5 text-[17px] leading-8 text-slate-700">{blocks.map((block, index) => {
    if (block.type === "h1") return <h1 key={index} className="pt-6 font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-4xl"><InlineContent text={block.text as string} /></h1>;
    if (block.type === "h2") return <h2 key={index} className="pt-6 font-serif text-2xl font-semibold leading-tight tracking-tight text-slate-950 sm:text-3xl"><InlineContent text={block.text as string} /></h2>;
    if (block.type === "h3") return <h3 key={index} className="pt-3 text-lg font-bold leading-tight text-slate-900 sm:text-xl"><InlineContent text={block.text as string} /></h3>;
    if (block.type === "list") return <ul key={index} className="space-y-2.5 border-l-2 border-[#0a7ae6]/25 pl-5">{(block.text as string[]).map((item, itemIndex) => <li key={itemIndex} className="pl-1 marker:text-[#0a7ae6]"><InlineContent text={item} /></li>)}</ul>;
    if (block.type === "quote") return <blockquote key={index} className="border-l-4 border-[#0a7ae6] py-1 pl-5 font-serif text-xl italic leading-8 text-slate-800"><InlineContent text={block.text as string} /></blockquote>;
    return <p key={index}><InlineContent text={block.text as string} /></p>;
  })}</div>;
}

export function BlogPostEditor({ post }: { post?: BlogPostItem }) {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const isNew = !post;
  const [title, setTitle] = useState(post?.title ?? "");
  const [category, setCategory] = useState(post?.category ?? "Insights");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [image, setImage] = useState(post?.image ?? "");
  const [isActive, setIsActive] = useState(post?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [error, setError] = useState("");
  const previewImage = image.trim();
  const calculatedReadTime = readingTime(content || excerpt);
  const displayDate = post?.publishedAt ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "long", year: "numeric" }).format(new Date(post.publishedAt)) : "Today";

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
      setError(uploadError instanceof Error ? uploadError.message : "Unable to upload the cover image.");
    } finally {
      setIsUploading(false);
    }
  }

  async function savePost(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Add an article title before saving.");
      return;
    }
    if (!previewImage) {
      setError("Upload a cover image or paste an image URL before publishing.");
      return;
    }

    setIsSaving(true);
    setError("");
    const payload = {
      title: title.trim(),
      category: category.trim() || "Insights",
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
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to save the blog post.");
      router.push("/dashboard/blog");
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save the blog post.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-[#f5f6f8] p-4 text-black sm:p-6">
      <form onSubmit={savePost} className="mx-auto max-w-[1600px]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <Link prefetch={false} href="/dashboard/blog" className="mt-0.5 inline-flex size-9 items-center justify-center rounded-xl border border-black/10 bg-white text-black/65 shadow-sm hover:bg-slate-50" aria-label="Back to blog posts"><ArrowLeft className="size-4" /></Link>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0a7ae6]">Editorial studio</p>
              <h1 className="mt-1 text-xl font-semibold tracking-tight text-slate-950">{isNew ? "Write a new story" : "Edit your story"}</h1>
              <p className="mt-1 text-xs text-slate-500">Format the article with simple headings, lists, and quotes, then preview it as readers will see it.</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => setPreviewOpen(true)} className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#0a7ae6]/25 bg-white px-3 text-sm font-semibold text-[#075faf] shadow-sm hover:bg-[#0a7ae6]/5"><Eye className="size-4" />Preview page</button>
            <Link prefetch={false} href="/dashboard/blog" className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-medium text-black/60 hover:bg-black/[0.04]">Discard</Link>
            <button type="submit" disabled={isSaving || isUploading} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-4 text-sm font-semibold text-white shadow-sm hover:bg-[#0869c4] disabled:cursor-wait disabled:bg-[#0a7ae6]/40">{isSaving ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}{isSaving ? "Saving…" : isNew ? "Publish story" : "Save changes"}</button>
          </div>
        </header>

        {error ? <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p> : null}

        <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
          <div className="space-y-5">
            <SectionCard title="Story details" icon={<FileText className="size-4" />}>
              <div className="space-y-5">
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  <span>Article title <span className="text-red-600">*</span></span>
                  <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Why XElectron speakers are dominating the market" className={inputClass} required />
                </label>
                <label className="grid gap-1.5 text-sm font-medium text-slate-700">
                  <span>Short excerpt</span>
                  <textarea value={excerpt} onChange={(event) => setExcerpt(event.target.value)} rows={3} placeholder="Give readers a clear reason to open the story." className="w-full resize-y rounded-lg border border-black/15 bg-white p-3 text-sm font-normal leading-6 outline-none placeholder:text-black/35 focus:border-[#0a7ae6] focus:ring-3 focus:ring-[#0a7ae6]/10" />
                  <span className="text-xs font-normal text-slate-400">This appears on the homepage blog card.</span>
                </label>
              </div>
            </SectionCard>

            <SectionCard title="Article" icon={<BookOpen className="size-4" />}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-slate-500">Use simple formatting to give the story a clear reading rhythm.</p>
                <div className="flex flex-wrap gap-1.5">
                  <button type="button" onClick={() => insertAtCursor(contentRef.current, content, setContent, "# ")} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><span className="font-serif text-base">H1</span>Title</button>
                  <button type="button" onClick={() => insertAtCursor(contentRef.current, content, setContent, "## ")} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><span className="font-serif text-sm">H2</span>Heading</button>
                  <button type="button" onClick={() => insertAtCursor(contentRef.current, content, setContent, "### ")} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><span className="font-serif text-sm">H3</span>Subheading</button>
                  <button type="button" onClick={() => insertAtCursor(contentRef.current, content, setContent, "- ")} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><List className="size-3" />List</button>
                  <button type="button" onClick={() => insertAtCursor(contentRef.current, content, setContent, "> ")} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><Quote className="size-3" />Quote</button>
                  <button type="button" onClick={() => insertLinkAtCursor(contentRef.current, content, setContent)} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-600 hover:border-[#0a7ae6]/30 hover:bg-[#0a7ae6]/5"><Link2 className="size-3" />Link</button>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="min-w-0">
                  <div className="mb-2 flex items-center justify-between"><span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">Writing</span><span className="text-xs text-slate-400">Markdown-style text</span></div>
                  <textarea ref={contentRef} value={content} onChange={(event) => setContent(event.target.value)} rows={20} placeholder={"Start with an introduction.\n\n## A clear section heading\nExplain the key idea in a short paragraph.\n\n- Add a useful point\n- Add another useful point"} className="min-h-[430px] w-full resize-y rounded-xl border border-black/15 bg-[#fcfcfc] p-4 font-mono text-sm leading-7 text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#0a7ae6] focus:ring-3 focus:ring-[#0a7ae6]/10" />
                </div>
                <div className="flex min-h-[430px] min-w-0 flex-col overflow-hidden rounded-xl border border-[#0a7ae6]/15 bg-[#fbfdff] shadow-inner">
                  <div className="flex items-center justify-between border-b border-[#0a7ae6]/10 bg-white px-4 py-3"><span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-[#075faf]"><Eye className="size-3.5" />Live preview</span><span className="text-[11px] text-slate-400">Updates as you write</span></div>
                  <div className="min-h-0 flex-1 overflow-y-auto p-5"><ArticleBody content={content} /></div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400"><span><code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">#</code> H1 &nbsp; <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">##</code> H2 &nbsp; <code className="rounded bg-slate-100 px-1 py-0.5 text-slate-600">[text](url)</code> Link</span><span className="inline-flex items-center gap-1"><Clock3 className="size-3.5" />{calculatedReadTime}, calculated automatically</span></div>
            </SectionCard>
          </div>

          <aside className="space-y-5">
            <SectionCard title="Cover image" icon={<ImagePlus className="size-4" />}>
              <input ref={imageInputRef} type="file" accept="image/avif,image/gif,image/jpeg,image/png,image/webp" onChange={(event) => void handleImageUpload(event)} className="sr-only" />
              <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isUploading} className="relative flex aspect-[16/10] w-full overflow-hidden rounded-xl border border-dashed border-black/20 bg-slate-50 text-sm text-slate-600 transition hover:border-[#0a7ae6]/40 hover:bg-[#0a7ae6]/5 disabled:cursor-wait">{image ? <Image src={previewImage} alt="Blog cover preview" fill sizes="340px" className="object-cover" /> : null}<span className="relative m-auto flex flex-col items-center gap-2 rounded-lg bg-white/90 px-3 py-2 text-xs font-semibold shadow-sm">{isUploading ? <LoaderCircle className="size-4 animate-spin" /> : <Upload className="size-4" />}{isUploading ? "Uploading cover…" : image ? "Replace cover" : "Upload cover image"}</span></button>
              <div className="mt-3 flex gap-2"><input value={image} onChange={(event) => setImage(event.target.value)} placeholder="Or paste an image URL" className={`${inputClass} min-w-0 flex-1`} aria-label="Cover image URL" />{image ? <button type="button" onClick={() => setImage("")} className="inline-flex size-10 shrink-0 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50" aria-label="Remove cover image"><X className="size-4" /></button> : null}</div>
              <p className="mt-2 text-xs leading-5 text-slate-400">JPG, PNG, WebP, GIF, or AVIF. Landscape 16:10 works best.</p>
            </SectionCard>

            <SectionCard title="Story settings" icon={<Tag className="size-4" />}>
              <div className="space-y-5">
                <label className="grid gap-1.5 text-sm font-medium text-slate-700"><span>Category / tag</span><input value={category} onChange={(event) => setCategory(event.target.value)} placeholder="Insights" className={inputClass} /></label>
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-3"><p className="text-xs font-semibold text-slate-700">Reading time</p><p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-[#0a7ae6]"><Clock3 className="size-3.5" />{calculatedReadTime}</p><p className="mt-1 text-xs leading-5 text-slate-400">Updated automatically from the article length.</p></div>
                <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 px-3.5 py-3.5"><span><span className="block text-sm font-semibold text-slate-800">Show on homepage</span><span className="mt-1 block text-xs leading-4 text-slate-400">Published stories appear in From our blog.</span></span><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} className="mt-0.5 size-4 accent-[#0a7ae6]" /></label>
              </div>
            </SectionCard>

            <button type="button" onClick={() => setPreviewOpen(true)} className="group flex w-full items-center justify-between rounded-2xl bg-[#0d1b2a] p-4 text-left text-white shadow-sm transition hover:bg-[#132943]"><span><span className="block text-sm font-semibold">Open page preview</span><span className="mt-1 block text-xs text-white/60">Check the full reading experience before publishing.</span></span><ChevronRight className="size-5 text-[#62b0f4] transition group-hover:translate-x-0.5" /></button>
          </aside>
        </div>
      </form>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="flex h-[calc(100dvh-2rem)] max-w-6xl flex-col gap-0 overflow-hidden rounded-2xl border-0 p-0 sm:!w-[min(1120px,calc(100vw-2rem))] sm:!max-w-[min(1120px,calc(100vw-2rem))]" overlayClassName="bg-slate-950/55 supports-backdrop-filter:backdrop-blur-sm">
          <DialogHeader className="flex-row items-center justify-between border-b border-slate-200 px-5 py-3.5"><DialogTitle className="flex items-center gap-2 text-sm font-semibold text-slate-800"><Eye className="size-4 text-[#0a7ae6]" />Live blog page preview</DialogTitle><span className="mr-7 text-xs text-slate-400">Unsaved changes are included</span></DialogHeader>
          <div className="min-h-0 overflow-y-auto bg-white">
            <article className="pb-20">
              <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-10 sm:pt-16"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0a7ae6]">{category.trim() || "Insights"}</p><h1 className="mt-4 font-serif text-4xl font-semibold leading-[1.08] tracking-tight text-slate-950 sm:text-6xl">{title.trim() || "Your story title will appear here"}</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">{excerpt.trim() || "A concise introduction will help readers understand why this story matters."}</p><div className="mt-7 flex items-center gap-3 text-sm text-slate-400"><span>{displayDate}</span><span aria-hidden>•</span><span>{calculatedReadTime}</span></div></div>
              <div className="relative mx-auto mt-9 flex aspect-[16/8] max-w-5xl items-center justify-center overflow-hidden bg-slate-100 sm:rounded-2xl">{previewImage ? <Image src={previewImage} alt="Article cover" fill sizes="1120px" className="object-cover" /> : <div className="flex flex-col items-center gap-2 text-center text-slate-400"><ImagePlus className="size-7" /><span className="text-sm font-medium">Upload a cover image to preview it here</span></div>}</div>
              <div className="mx-auto max-w-3xl px-5 pt-10 sm:px-10 sm:pt-14"><ArticleBody content={content} /></div>
            </article>
          </div>
        </DialogContent>
      </Dialog>
    </main>
  );
}
