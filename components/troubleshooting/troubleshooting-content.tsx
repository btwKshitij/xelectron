"use client";

import type { TroubleshootingContent } from "@/lib/shared/troubleshooting";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/navbar/navbar";
import Footer from "@/components/footer/footer";
import { Wrench, Search, Tv, Wifi, Volume2, ChevronDown, HelpCircle, ArrowRight, BookOpen, X, Headphones } from "lucide-react";

export default function TroubleshootingContentView({ content }: { content: TroubleshootingContent }) {
  const [selectedCat, setSelectedCat] = useState("all");
  const [search, setSearch] = useState("");
  const [openGuide, setOpenGuide] = useState<string | null>(content.guides[0]?.id ?? null);
  const query = search.trim().toLowerCase();
  const filteredGuides = content.guides.filter(guide =>
    (selectedCat === "all" || guide.category === selectedCat) &&
    (!query || guide.title.toLowerCase().includes(query) || guide.steps.some(step => step.toLowerCase().includes(query)))
  );
  const topics = [{ id: "all", name: "All topics", icon: BookOpen }, ...content.categories.map(cat => ({ ...cat, icon: { tv: Tv, audio: Volume2, wifi: Wifi }[cat.icon] }))];
  const activeTopic = topics.find(topic => topic.id === selectedCat)?.name ?? "All topics";

  return (
    <main className="min-h-screen bg-white text-slate-900">
      <Navbar />
      <section className="relative overflow-hidden border-b border-blue-100 bg-[#f0f6fd]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-52 size-[600px] rounded-full border-[80px] border-white/50" />
        <div className="relative mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
          <nav aria-label="Breadcrumb" className="mb-8 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600">Home</Link><span aria-hidden="true">/</span><span aria-current="page">Support</span>
          </nav>
          <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <div className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#0876d5]"><Wrench className="size-4" aria-hidden="true" />{content.badge}</div>
              <h1 className="max-w-2xl text-3xl font-semibold leading-[1.12] tracking-tight text-slate-950 sm:text-[42px]">{content.title}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-slate-600">{content.description}</p>
            </div>
            <div className="pb-1">
              <label htmlFor="guide-search" className="mb-3 block text-sm font-semibold text-slate-800">What can we help you with?</label>
              <div className="relative">
                <Search aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[#0a7ae6]" />
                <input id="guide-search" type="search" placeholder={content.searchPlaceholder} value={search} onChange={e => setSearch(e.target.value)} className="h-14 w-full rounded-xl border border-slate-200 bg-white pl-12 pr-12 text-sm text-slate-900 shadow-[0_4px_20px_#16487808] outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-3 focus:ring-blue-100 [&::-webkit-search-cancel-button]:appearance-none" />
                {search && <button type="button" aria-label="Clear search" onClick={() => setSearch("")} className="absolute right-2 top-2 rounded-lg p-3 text-slate-500 hover:bg-slate-100"><X className="size-4" /></button>}
              </div>
              <p className="mt-3 text-xs text-slate-500">Search a device, connection, or issue to get started.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-5 py-10 sm:px-8 sm:py-14">
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12">
          <aside>
            <h2 className="mb-4 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Browse by topic</h2>
            <nav aria-label="Guide topics" className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
              {topics.map(topic => {
                const Icon = topic.icon;
                const count = topic.id === "all" ? content.guides.length : content.guides.filter(g => g.category === topic.id).length;
                return <button type="button" key={topic.id} aria-pressed={selectedCat === topic.id} onClick={() => setSelectedCat(topic.id)} className={`flex shrink-0 items-center gap-3 rounded-lg px-3 py-3.5 text-left text-sm transition-colors focus-visible:outline-2 focus-visible:outline-blue-500 ${selectedCat === topic.id ? "bg-blue-50 font-semibold text-[#0876d5]" : "text-slate-600 hover:bg-slate-50"}`}><Icon aria-hidden="true" className="size-4 shrink-0" /><span className="flex-1 whitespace-nowrap">{topic.name}</span><span className="ml-2 text-xs tabular-nums opacity-65">{count}</span></button>;
              })}
            </nav>
          </aside>

          <div className="min-w-0">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-xl font-semibold tracking-tight">{query ? "Search results" : activeTopic}</h2>
              <p role="status" className="text-xs text-slate-500">{filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"}</p>
            </div>
            <div className="space-y-3">
              {filteredGuides.map(guide => {
                const isOpen = openGuide === guide.id;
                return (
                  <article key={guide.id} className={`overflow-hidden rounded-xl border transition-colors ${isOpen ? "border-blue-200 bg-white shadow-[0_4px_20px_#16487806]" : "border-slate-200 bg-white hover:border-slate-300"}`}>
                    <h3><button type="button" id={`guide-${guide.id}`} aria-expanded={isOpen} aria-controls={`steps-${guide.id}`} onClick={() => setOpenGuide(isOpen ? null : guide.id)} className="flex w-full items-center gap-4 p-5 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 sm:p-6">
                      <span className="min-w-0 flex-1"><span className="mb-2 block text-[11px] font-medium text-slate-500">{content.categories.find(cat => cat.id === guide.category)?.name}</span><span className={`block text-sm font-semibold leading-6 sm:text-base ${isOpen ? "text-[#0876d5]" : "text-slate-800"}`}>{guide.title}</span></span>
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-full ${isOpen ? "bg-blue-50 text-blue-600" : "bg-slate-50 text-slate-500"}`}><ChevronDown aria-hidden="true" className={`size-4 ${isOpen ? "rotate-180" : ""}`} /></span>
                    </button></h3>
                    <div id={`steps-${guide.id}`} role="region" aria-labelledby={`guide-${guide.id}`} hidden={!isOpen} className="px-5 pb-6 sm:px-6">
                      <ol className="space-y-5 border-t border-slate-100 pt-5">
                        {guide.steps.map((step, index) => <li key={index} className="flex gap-3 text-sm leading-6 text-slate-600"><span aria-hidden="true" className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-600">{index + 1}</span><span className="min-w-0 break-words">{step}</span></li>)}
                      </ol>
                    </div>
                  </article>
                );
              })}
              {filteredGuides.length === 0 && <div className="rounded-xl border border-dashed border-slate-200 px-5 py-14 text-center"><HelpCircle aria-hidden="true" className="mx-auto mb-4 size-8 text-slate-400" /><h3 className="font-semibold">No guides found</h3><p className="mt-2 text-sm text-slate-500">Try another topic or a different search term.</p><button type="button" onClick={() => { setSearch(""); setSelectedCat("all"); }} className="mt-5 text-sm font-semibold text-blue-600 underline underline-offset-4">View all guides</button></div>}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-6 rounded-2xl border border-blue-100 bg-[#f0f6fd] p-6 sm:p-8 lg:flex-row lg:items-center">
          <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0a7ae6]"><Headphones className="size-6" /></span>
          <div className="flex-1"><h2 className="text-lg font-semibold tracking-tight">{content.helpTitle}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-slate-600">{content.helpDescription}</p></div>
          <Link prefetch={false} href={content.helpHref} className="inline-flex min-h-12 items-center justify-center gap-3 self-start rounded-lg bg-[#0a7ae6] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0868c4] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-500 lg:self-center">{content.helpButton}<ArrowRight aria-hidden="true" className="size-4 shrink-0" /></Link>
        </div>
      </section>
      <Footer />
    </main>
  );
}
