"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookOpen, Clock, Pencil, Plus, Trash2 } from "lucide-react";

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
      if (!response.ok || !result.success) throw new Error(result.error || "Unable to delete this blog post.");
      setPosts((current) => current.filter((post) => post.id !== id));
      router.refresh();
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to delete this blog post.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold text-slate-900"><BookOpen className="size-5 text-[#0a7ae6]" />From our blog</h1>
          <p className="mt-1 text-xs text-slate-500">Create, publish, and organize the stories featured on your homepage.</p>
        </div>
        <Link href="/dashboard/blog/new" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-3.5 text-xs font-semibold text-white transition hover:bg-black/80"><Plus className="size-3.5" />Add new blog post</Link>
      </header>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs transition hover:shadow-md">
            <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100"><Image src={post.image || "/blog-1.png"} alt={post.title} fill sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" className="object-cover" /><span className="absolute left-3 top-3 rounded-full bg-[#0a7ae6] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white shadow-sm">{post.category}</span><span className={`absolute right-3 top-3 rounded-full px-2 py-0.5 text-[10px] font-semibold ${post.isActive ? "bg-emerald-100 text-emerald-800" : "bg-black/60 text-white"}`}>{post.isActive ? "Published" : "Draft / Hidden"}</span></div>
            <div className="flex flex-1 flex-col justify-between p-4"><div><h2 className="line-clamp-2 text-sm font-bold leading-snug text-slate-900">{post.title}</h2><p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-slate-500">{post.excerpt || "No excerpt provided."}</p></div><div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs"><div className="flex items-center gap-1.5 text-slate-400"><Clock className="size-3" /><span>{post.readTime || "4 min read"}</span></div><div className="flex items-center gap-1"><Link href={`/dashboard/blog/${post.id}`} className="inline-flex h-7 items-center gap-1 rounded-md border border-slate-200 px-2 text-xs font-medium text-slate-700 hover:bg-slate-50"><Pencil className="size-3" />Edit</Link><button type="button" onClick={() => void handleDelete(post.id)} disabled={deletingId === post.id} className="inline-flex size-7 items-center justify-center rounded-md border border-red-200 text-red-600 hover:bg-red-50 disabled:opacity-50" aria-label={`Delete ${post.title}`}><Trash2 className="size-3" /></button></div></div></div>
          </article>
        ))}
        {posts.length === 0 ? <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center"><BookOpen className="mx-auto size-8 text-slate-300" /><p className="mt-2 text-sm font-semibold text-slate-700">No blog posts yet</p><p className="mt-1 text-xs text-slate-400">Create the first story for your homepage blog section.</p><Link href="/dashboard/blog/new" className="mt-4 inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white hover:bg-black/80"><Plus className="size-3.5" />Add post</Link></div> : null}
      </div>
    </div>
  );
}
