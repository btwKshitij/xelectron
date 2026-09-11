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
    <main className="min-h-screen w-full overflow-x-hidden bg-white text-slate-900 pt-[96px] sm:pt-[120px]">
      <Navbar />
      
      {/* HERO & SEARCH SECTION */}
      <section className="relative overflow-hidden border-b border-blue-100 bg-[#f0f6fd]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-52 size-[500px] rounded-full border-[80px] border-white/50 hidden sm:block" />
        <div className="relative mx-auto max-w-[1200px] px-4 py-6 sm:px-8 sm:py-12">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-4 sm:mb-6 flex items-center gap-2 text-xs text-slate-500">
            <Link href="/" className="hover:text-blue-600">Home</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-slate-700 font-medium">Support</span>
          </nav>

          <div className="grid items-end gap-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
            <div>
              <div className="mb-2.5 sm:mb-3 inline-flex items-center gap-1.5 rounded-full bg-blue-100/70 border border-blue-200/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#0876d5]">
                <Wrench className="size-3.5" aria-hidden="true" />
                {content.badge}
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-[42px] font-bold leading-tight tracking-tight text-slate-950">
                {content.title}
              </h1>
              <p className="mt-2.5 sm:mt-4 text-xs sm:text-sm leading-relaxed text-slate-600 max-w-xl">
                {content.description}
              </p>
            </div>

            <div className="w-full min-w-0 pt-1 sm:pt-0">
              <label htmlFor="guide-search" className="mb-2 block text-xs sm:text-sm font-semibold text-slate-800">
                What can we help you with?
              </label>
              <div className="relative w-full">
                <Search aria-hidden="true" className="pointer-events-none absolute left-3.5 sm:left-4 top-1/2 size-4 sm:size-5 -translate-y-1/2 text-[#0a7ae6]" />
                <input
                  id="guide-search"
                  type="search"
                  placeholder={content.searchPlaceholder}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="h-11 sm:h-14 w-full rounded-xl border border-slate-200 bg-white pl-10 sm:pl-12 pr-10 text-xs sm:text-sm text-slate-900 shadow-xs outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 [&::-webkit-search-cancel-button]:appearance-none"
                />
                {search && (
                  <button
                    type="button"
                    aria-label="Clear search"
                    onClick={() => setSearch("")}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                  >
                    <X className="size-4" />
                  </button>
                )}
              </div>
              <p className="mt-2 text-[11px] sm:text-xs text-slate-500">
                Search a device, connection, or issue to get started.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TOPICS & GUIDES SECTION */}
      <section className="mx-auto max-w-[1200px] px-4 py-8 sm:px-8 sm:py-14 w-full">
        <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 w-full">
          {/* Aside Topics: Horizontal scroll chips on phone, vertical list on desktop */}
          <aside className="w-full min-w-0">
            <h2 className="mb-2.5 sm:mb-4 text-xs font-bold uppercase tracking-wider text-slate-500">
              Browse by topic
            </h2>
            <nav
              aria-label="Guide topics"
              className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 lg:flex-col lg:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {topics.map(topic => {
                const Icon = topic.icon;
                const count = topic.id === "all" ? content.guides.length : content.guides.filter(g => g.category === topic.id).length;
                const isSelected = selectedCat === topic.id;

                return (
                  <button
                    type="button"
                    key={topic.id}
                    aria-pressed={isSelected}
                    onClick={() => setSelectedCat(topic.id)}
                    className={`flex shrink-0 items-center gap-2 rounded-full lg:rounded-xl px-3.5 py-2 lg:px-3.5 lg:py-3 text-left text-xs sm:text-sm font-medium transition-all focus-visible:outline-2 focus-visible:outline-blue-500 ${
                      isSelected
                        ? "bg-[#0a7ae6] text-white shadow-xs"
                        : "bg-slate-100/90 lg:bg-transparent text-slate-700 hover:bg-slate-200/70"
                    }`}
                  >
                    <Icon aria-hidden="true" className="size-3.5 sm:size-4 shrink-0" />
                    <span className="whitespace-nowrap flex-1">{topic.name}</span>
                    <span
                      className={`ml-1 text-[10px] sm:text-xs tabular-nums px-1.5 py-0.5 rounded-full ${
                        isSelected
                          ? "bg-white/25 text-white"
                          : "bg-slate-200/80 text-slate-600"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </nav>
          </aside>

          {/* Guides Accordion */}
          <div className="min-w-0 w-full">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg sm:text-xl font-bold tracking-tight text-slate-900">
                {query ? "Search results" : activeTopic}
              </h2>
              <p role="status" className="text-xs text-slate-500">
                {filteredGuides.length} {filteredGuides.length === 1 ? "guide" : "guides"}
              </p>
            </div>

            <div className="space-y-3">
              {filteredGuides.map(guide => {
                const isOpen = openGuide === guide.id;
                const categoryName = content.categories.find(cat => cat.id === guide.category)?.name;

                return (
                  <article
                    key={guide.id}
                    className={`overflow-hidden rounded-xl border transition-all ${
                      isOpen
                        ? "border-blue-200 bg-white shadow-sm"
                        : "border-slate-200/90 bg-white hover:border-slate-300"
                    }`}
                  >
                    <h3>
                      <button
                        type="button"
                        id={`guide-${guide.id}`}
                        aria-expanded={isOpen}
                        aria-controls={`steps-${guide.id}`}
                        onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                        className="flex w-full items-center gap-3 p-4 text-left focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-blue-500 sm:p-5 cursor-pointer"
                      >
                        <span className="min-w-0 flex-1">
                          {categoryName && (
                            <span className="mb-1 block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#0876d5]">
                              {categoryName}
                            </span>
                          )}
                          <span className={`block text-xs sm:text-[15px] font-semibold leading-snug ${isOpen ? "text-[#0876d5]" : "text-slate-800"}`}>
                            {guide.title}
                          </span>
                        </span>
                        <span className={`flex size-7 sm:size-8 shrink-0 items-center justify-center rounded-full transition-colors ${isOpen ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-500"}`}>
                          <ChevronDown aria-hidden="true" className={`size-3.5 sm:size-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                        </span>
                      </button>
                    </h3>

                    {isOpen && (
                      <div id={`steps-${guide.id}`} role="region" aria-labelledby={`guide-${guide.id}`} className="px-4 pb-5 sm:px-5 sm:pb-6">
                        <ol className="space-y-3 sm:space-y-4 border-t border-slate-100 pt-4">
                          {guide.steps.map((step, index) => (
                            <li key={index} className="flex items-start gap-2.5 sm:gap-3 text-xs sm:text-sm leading-relaxed text-slate-600">
                              <span aria-hidden="true" className="mt-0.5 flex size-5 sm:size-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[10px] sm:text-[11px] font-bold text-blue-600">
                                {index + 1}
                              </span>
                              <span className="min-w-0 break-words flex-1">
                                {step}
                              </span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </article>
                );
              })}

              {filteredGuides.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-12 text-center bg-slate-50/50">
                  <HelpCircle aria-hidden="true" className="mx-auto mb-3 size-7 text-slate-400" />
                  <h3 className="text-sm font-semibold text-slate-800">No guides found</h3>
                  <p className="mt-1 text-xs text-slate-500">Try another topic or a different search term.</p>
                  <button
                    type="button"
                    onClick={() => { setSearch(""); setSelectedCat("all"); }}
                    className="mt-4 text-xs font-semibold text-blue-600 underline underline-offset-4 cursor-pointer"
                  >
                    View all guides
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HELP & REPAIR CARD */}
        <div className="mt-10 sm:mt-14 flex flex-col gap-4 sm:gap-6 rounded-2xl border border-blue-100 bg-[#f0f6fd] p-5 sm:p-8 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3.5">
            <span aria-hidden="true" className="flex size-11 sm:size-12 shrink-0 items-center justify-center rounded-xl bg-white text-[#0a7ae6] shadow-2xs">
              <Headphones className="size-5 sm:size-6" />
            </span>
            <div className="lg:hidden">
              <h2 className="text-sm font-bold tracking-tight text-slate-900">{content.helpTitle}</h2>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="hidden lg:block text-lg font-semibold tracking-tight text-slate-900">{content.helpTitle}</h2>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              {content.helpDescription}
            </p>
          </div>

          <Link
            prefetch={false}
            href={content.helpHref}
            className="inline-flex min-h-11 sm:min-h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-[#0a7ae6] px-5 py-2.5 text-xs sm:text-sm font-semibold text-white transition-all hover:bg-[#0868c4] shadow-xs active:scale-95"
          >
            {content.helpButton}
            <ArrowRight aria-hidden="true" className="size-4 shrink-0" />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
