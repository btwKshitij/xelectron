"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, ExternalLink, Pencil, Plus, Trash2 } from "lucide-react";

import type { BlogPostItem } from "@/components/admin/blog/blog-post-editor";

export type { BlogPostItem } from "@/components/admin/blog/blog-post-editor";

export function BlogManager({ initialPosts }: { initialPosts: BlogPostItem[] }) {
  const router = useRouter();
  const [posts, setPosts] = useState(initialPosts);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this blog post? This cannot be undone.")) return;
    setDeletingId(id);
    try {
      const response = await fetch(`/api/blog/${id}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to delete this blog post.");
      }
      setPosts((current) => current.filter((post) => post.id !== id));
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete this blog post.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1440px] space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-blue-50 text-[#0a7ae6]">
              <BookOpen className="size-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900">
              From Our Blog
            </h1>
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
              {posts.length} stories
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Publish, edit, and curate editorial guides and tech stories featured on your website.
          </p>
        </div>
        <Link
          prefetch={false}
          href="/dashboard/blog/new"
          className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0a7ae6] px-4 text-xs font-medium text-white shadow-sm transition hover:bg-[#0869c4] active:scale-98"
        >
          <Plus className="size-4" />
          <span>Add New Story</span>
        </Link>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article
            key={post.id}
            className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-xs transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
              <Image
                src={post.image || "/blog-1.png"}
                alt={post.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <span className="absolute left-3 top-3 rounded-full bg-[#0a7ae6] px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white shadow-xs">
                {post.category}
              </span>
              <span
                className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[10px] font-medium backdrop-blur-xs ${
                  post.isActive
                    ? "bg-emerald-500/90 text-white shadow-xs"
                    : "bg-slate-900/70 text-white shadow-xs"
                }`}
              >
                {post.isActive ? "Published" : "Draft"}
              </span>
            </div>

            <div className="flex flex-1 flex-col justify-between p-5">
              <div>
                <h2 className="line-clamp-2 text-sm sm:text-base font-semibold leading-snug text-slate-900 group-hover:text-[#0a7ae6] transition-colors">
                  {post.title}
                </h2>
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-slate-500 font-normal">
                  {post.excerpt || "No excerpt provided."}
                </p>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                <div className="flex items-center gap-1.5 text-slate-400 font-normal">
                  <Clock className="size-3 text-slate-400" />
                  <span>{post.readTime || "4 min read"}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/blog/${post.slug || post.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-[#0a7ae6] transition-colors"
                    title="View live post"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>

                  <Link
                    prefetch={false}
                    href={`/dashboard/blog/${post.id}`}
                    className="inline-flex h-8 items-center gap-1 rounded-lg border border-slate-200 px-2.5 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-[#0a7ae6] transition-colors"
                  >
                    <Pencil className="size-3" />
                    <span>Edit</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => void handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
                    aria-label={`Delete ${post.title}`}
                    title="Delete story"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}

        {posts.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <BookOpen className="mx-auto size-9 text-slate-300" />
            <p className="mt-3 text-sm font-semibold text-slate-700">No blog stories yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Create the first story for your website and homepage blog showcase.
            </p>
            <Link
              prefetch={false}
              href="/dashboard/blog/new"
              className="mt-5 inline-flex h-9 items-center gap-2 rounded-xl bg-[#0a7ae6] px-4 text-xs font-medium text-white hover:bg-[#0869c4] transition-colors"
            >
              <Plus className="size-3.5" />
              <span>Add Your First Story</span>
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
