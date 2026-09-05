"use client";

import { useEffect, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Eye,
  EyeOff,
  Link2,
  Loader2,
  Megaphone,
  Pause,
  Plus,
  Play,
  Save,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export type AnnouncementItem = {
  id: string;
  prefix: string | null;
  action: string;
  href: string;
  discountCode: string | null;
  sortOrder: number;
  isActive: boolean;
};

type AnnouncementDraft = {
  prefix: string;
  action: string;
  href: string;
  discountCode: string;
};

const emptyDraft: AnnouncementDraft = {
  prefix: "",
  action: "",
  href: "/",
  discountCode: "",
};

type DiscountOption = {
  code: string | null;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
};

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function AnnouncementManager({
  initialAnnouncements,
  initialTickerEnabled,
}: {
  initialAnnouncements: AnnouncementItem[];
  initialTickerEnabled: boolean;
}) {
  const [announcements, setAnnouncements] = useState(initialAnnouncements);
  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementDraft>(emptyDraft);
  const [discountCodes, setDiscountCodes] = useState<string[]>([]);
  const [tickerEnabled, setTickerEnabled] = useState(initialTickerEnabled);
  const [isSavingTicker, setIsSavingTicker] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);

  const activeAnnouncements = announcements.filter((announcement) => announcement.isActive);
  const tickerRepeatCount = activeAnnouncements.length ? Math.max(4, Math.ceil(8 / activeAnnouncements.length)) : 0;

  useEffect(() => {
    let mounted = true;

    async function loadAvailableDiscountCodes() {
      try {
        const response = await fetch("/api/discounts", { cache: "no-store" });
        const json = await response.json();
        const now = Date.now();
        if (!mounted || !response.ok || !json.success || !Array.isArray(json.data)) return;

        const codes = (json.data as DiscountOption[])
          .filter((discount) => {
            const startsInFuture = discount.startDate && new Date(discount.startDate).getTime() > now;
            const hasEnded = discount.endDate && new Date(discount.endDate).getTime() < now;
            return Boolean(discount.code && discount.isActive && !startsInFuture && !hasEnded);
          })
          .map((discount) => discount.code!.trim().toUpperCase());
        setDiscountCodes([...new Set(codes)]);
      } catch {
        // The server revalidates a selected code before publishing it.
      }
    }

    void loadAvailableDiscountCodes();
    return () => {
      mounted = false;
    };
  }, []);

  function updateAnnouncement(id: string, patch: Partial<AnnouncementItem>) {
    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === id ? { ...announcement, ...patch } : announcement
      )
    );
  }

  async function toggleTicker() {
    const previous = tickerEnabled;
    const next = !previous;
    setTickerEnabled(next);
    setIsSavingTicker(true);

    try {
      const response = await fetch("/api/admin/announcement-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tickerEnabled: next }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not change ticker motion.");
      setTickerEnabled(json.data.tickerEnabled);
      toast.success(next ? "Announcement motion turned on" : "Announcement motion stopped");
    } catch (error) {
      setTickerEnabled(previous);
      toast.error(errorMessage(error, "Could not change ticker motion."));
    } finally {
      setIsSavingTicker(false);
    }
  }

  async function saveAnnouncement(announcement: AnnouncementItem, notify = true) {
    setSavingId(announcement.id);
    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prefix: announcement.prefix || "",
          action: announcement.action,
          href: announcement.href,
          discountCode: announcement.discountCode || "",
          isActive: announcement.isActive,
          sortOrder: announcement.sortOrder,
        }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not save this announcement.");
      updateAnnouncement(announcement.id, json.data);
      if (notify) toast.success("Announcement saved");
    } catch (error) {
      toast.error(errorMessage(error, "Could not save this announcement."));
    } finally {
      setSavingId(null);
    }
  }

  async function addAnnouncement() {
    if (!newAnnouncement.action.trim()) {
      toast.error("Add the offer or action text first.");
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch("/api/admin/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAnnouncement),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not add this announcement.");
      setAnnouncements((current) => [...current, json.data]);
      setNewAnnouncement(emptyDraft);
      toast.success("Announcement published");
    } catch (error) {
      toast.error(errorMessage(error, "Could not add this announcement."));
    } finally {
      setIsAdding(false);
    }
  }

  async function toggleAnnouncement(announcement: AnnouncementItem) {
    const previous = announcement.isActive;
    const next = { ...announcement, isActive: !previous };
    updateAnnouncement(announcement.id, { isActive: !previous });
    setSavingId(announcement.id);

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !previous }),
      });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not change visibility.");
      updateAnnouncement(announcement.id, json.data);
      toast.success(next.isActive ? "Announcement is visible on the store" : "Announcement hidden from the store");
    } catch (error) {
      updateAnnouncement(announcement.id, { isActive: previous });
      toast.error(errorMessage(error, "Could not change visibility."));
    } finally {
      setSavingId(null);
    }
  }

  async function moveAnnouncement(id: string, direction: -1 | 1) {
    const currentIndex = announcements.findIndex((announcement) => announcement.id === id);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= announcements.length) return;

    const previous = announcements;
    const next = [...announcements];
    [next[currentIndex], next[nextIndex]] = [next[nextIndex], next[currentIndex]];
    const reordered = next.map((announcement, sortOrder) => ({ ...announcement, sortOrder }));
    setAnnouncements(reordered);

    try {
      const responses = await Promise.all(
        reordered.map((announcement) =>
          fetch(`/api/admin/announcements/${announcement.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sortOrder: announcement.sortOrder }),
          })
        )
      );
      if (responses.some((response) => !response.ok)) throw new Error("Could not save the new position.");
    } catch (error) {
      setAnnouncements(previous);
      toast.error(errorMessage(error, "Could not save the new position."));
    }
  }

  async function removeAnnouncement(announcement: AnnouncementItem) {
    if (!window.confirm(`Delete “${announcement.action}”?`)) return;
    setSavingId(announcement.id);

    try {
      const response = await fetch(`/api/admin/announcements/${announcement.id}`, { method: "DELETE" });
      const json = await response.json();
      if (!response.ok || !json.success) throw new Error(json.error || "Could not delete this announcement.");
      setAnnouncements((current) => current.filter((item) => item.id !== announcement.id));
      toast.success("Announcement deleted");
    } catch (error) {
      toast.error(errorMessage(error, "Could not delete this announcement."));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="min-h-svh bg-[#f5f6f8] p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="flex flex-col gap-4 border-b border-black/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#0a7ae6]">
              <Megaphone className="size-4" />
              <span className="text-[11px] font-bold uppercase tracking-[0.16em]">Storefront messages</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#111827]">Announcement bar</h1>
            <p className="mt-1 max-w-2xl text-sm text-slate-600">
              Publish short offers, service updates, and helpful links in the blue bar at the top of your storefront.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-medium text-[#0a7ae6]">
              {activeAnnouncements.length} visible on the store
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={tickerEnabled}
              onClick={toggleTicker}
              disabled={isSavingTicker}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-bold transition disabled:cursor-not-allowed disabled:opacity-60 ${tickerEnabled ? "border-blue-200 bg-blue-50 text-[#0a7ae6]" : "border-slate-200 bg-white text-slate-600"}`}
            >
              {isSavingTicker ? <Loader2 className="size-3.5 animate-spin" /> : tickerEnabled ? <Play className="size-3.5 fill-current" /> : <Pause className="size-3.5" />}
              Ticker: {tickerEnabled ? "On" : "Off"}
              <span className={`relative h-4 w-7 rounded-full transition ${tickerEnabled ? "bg-[#0a7ae6]" : "bg-slate-300"}`}>
                <span className={`absolute top-0.5 size-3 rounded-full bg-white shadow-sm transition-transform ${tickerEnabled ? "translate-x-3.5" : "translate-x-0.5"}`} />
              </span>
            </button>
          </div>
        </header>

        <section className="overflow-hidden rounded-2xl border border-[#0872d2] bg-[#0a7ae6] shadow-sm">
          {activeAnnouncements.length > 0 && tickerEnabled ? (
            <div className="announcement-ticker">
              <div className="announcement-ticker-track py-2 text-center text-xs text-white sm:text-sm">
                {[false, true].map((clone) => (
                  <div key={String(clone)} className="announcement-ticker-group" aria-hidden={clone || undefined}>
                    {Array.from({ length: tickerRepeatCount }, (_, repeatIndex) => (
                      <div key={`${clone ? "clone-" : ""}repeat-${repeatIndex}`} className="announcement-ticker-sequence" aria-hidden={clone || repeatIndex > 0 || undefined}>
                        {activeAnnouncements.map((announcement, index) => (
                          <div key={announcement.id} className="inline-flex items-center gap-1.5">
                            {announcement.prefix && <span className="text-white/90">{announcement.prefix}</span>}
                            <strong className="font-semibold underline decoration-white/50 underline-offset-2">{announcement.action}</strong>
                            {announcement.discountCode && <span className="rounded border border-white/35 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide">CODE: {announcement.discountCode}</span>}
                            {index < activeAnnouncements.length - 1 && <span className="ml-5 text-white/40">|</span>}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ) : activeAnnouncements.length > 0 ? (
            <div className="flex min-h-12 flex-wrap items-center justify-center gap-x-6 gap-y-1.5 px-4 py-2 text-center text-xs text-white sm:text-sm">
              {activeAnnouncements.map((announcement, index) => (
                <div key={announcement.id} className="inline-flex items-center gap-2.5">
                  <div className="inline-flex items-center gap-1.5">
                    {announcement.prefix && <span className="text-white/90">{announcement.prefix}</span>}
                    <strong className="font-semibold underline decoration-white/50 underline-offset-2">{announcement.action}</strong>
                    {announcement.discountCode && <span className="rounded border border-white/35 bg-white/10 px-1.5 py-0.5 font-mono text-[10px] font-bold tracking-wide">CODE: {announcement.discountCode}</span>}
                  </div>
                  {index < activeAnnouncements.length - 1 && <span className="text-white/40">|</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex min-h-12 items-center justify-center px-4 py-2 text-center text-xs text-white sm:text-sm"><span className="font-medium text-white/90">No messages are currently visible. Enable or add one below.</span></div>
          )}
        </section>

        <section className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex items-center gap-2 border-b border-black/10 pb-3">
            <Plus className="size-4 text-[#0a7ae6]" />
            <h2 className="text-sm font-bold text-slate-900">Add a message</h2>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-[minmax(0,0.75fr)_minmax(0,1.15fr)_minmax(0,0.85fr)_minmax(0,1fr)_auto]">
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Lead text <span className="font-normal text-slate-400">(optional)</span></span>
              <input value={newAnnouncement.prefix} onChange={(event) => setNewAnnouncement((current) => ({ ...current, prefix: event.target.value }))} placeholder="e.g. Weekend offer:" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Offer or action text</span>
              <input value={newAnnouncement.action} onChange={(event) => setNewAnnouncement((current) => ({ ...current, action: event.target.value }))} placeholder="e.g. Save ₹500 on smart projectors →" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Discount code <span className="font-normal text-slate-400">(optional)</span></span>
              <select value={newAnnouncement.discountCode} onChange={(event) => setNewAnnouncement((current) => ({ ...current, discountCode: event.target.value }))} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100">
                <option value="">No code</option>
                {discountCodes.map((code) => <option key={code} value={code}>{code}</option>)}
              </select>
            </label>
            <label className="space-y-1.5">
              <span className="text-xs font-semibold text-slate-700">Destination link</span>
              <input value={newAnnouncement.href} onChange={(event) => setNewAnnouncement((current) => ({ ...current, href: event.target.value }))} placeholder="/shop?offer=weekend" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
            </label>
            <button type="button" onClick={addAnnouncement} disabled={isAdding} className="mt-auto inline-flex h-10 items-center justify-center gap-1.5 rounded-lg bg-[#0a7ae6] px-4 text-xs font-bold text-white transition hover:bg-[#086ac9] disabled:cursor-not-allowed disabled:opacity-60">
              {isAdding ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />} Publish
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-black/10 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-black/10 px-4 py-4 sm:px-5">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Published messages</h2>
              <p className="mt-0.5 text-xs text-slate-500">Choose an active discount code, then use Move controls to set storefront order. Hidden messages are saved but not shown.</p>
            </div>
            <span className="text-xs font-semibold text-slate-500">{announcements.length} total</span>
          </div>

          <div className="divide-y divide-slate-100">
            {announcements.map((announcement, index) => (
              <article key={announcement.id} className={`p-4 sm:p-5 ${announcement.isActive ? "" : "bg-slate-50/80"}`}>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                  <div className="flex items-center gap-2 lg:mb-1">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">{index + 1}</div>
                    <div className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${announcement.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {announcement.isActive ? "VISIBLE" : "HIDDEN"}
                    </div>
                  </div>
                  <label className="min-w-0 flex-1 space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700">Lead text</span>
                    <input value={announcement.prefix || ""} onChange={(event) => updateAnnouncement(announcement.id, { prefix: event.target.value })} placeholder="Optional lead text" className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="min-w-0 flex-[1.35] space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700">Offer or action text</span>
                    <input value={announcement.action} onChange={(event) => updateAnnouncement(announcement.id, { action: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <label className="min-w-0 flex-[0.8] space-y-1.5">
                    <span className="text-xs font-semibold text-slate-700">Discount code</span>
                    <select value={announcement.discountCode || ""} onChange={(event) => updateAnnouncement(announcement.id, { discountCode: event.target.value || null })} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100">
                      <option value="">No code</option>
                      {announcement.discountCode && !discountCodes.includes(announcement.discountCode) && <option value={announcement.discountCode}>{announcement.discountCode}</option>}
                      {discountCodes.map((code) => <option key={code} value={code}>{code}</option>)}
                    </select>
                  </label>
                  <label className="min-w-0 flex-[1.2] space-y-1.5">
                    <span className="flex items-center gap-1 text-xs font-semibold text-slate-700"><Link2 className="size-3" /> Destination link</span>
                    <input value={announcement.href} onChange={(event) => updateAnnouncement(announcement.id, { href: event.target.value })} className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[#0a7ae6] focus:ring-2 focus:ring-blue-100" />
                  </label>
                  <div className="flex items-center gap-2 lg:mb-0.5">
                    <span className="mr-0.5 text-[11px] font-bold uppercase tracking-wide text-slate-500">Move</span>
                    <button type="button" onClick={() => moveAnnouncement(announcement.id, -1)} disabled={index === 0} title="Move up" aria-label="Move message up" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ArrowUp className="size-4" /></button>
                    <button type="button" onClick={() => moveAnnouncement(announcement.id, 1)} disabled={index === announcements.length - 1} title="Move down" aria-label="Move message down" className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35"><ArrowDown className="size-4" /></button>
                    <button type="button" onClick={() => toggleAnnouncement(announcement)} disabled={savingId === announcement.id} title={announcement.isActive ? "Hide message" : "Show message"} className="inline-flex size-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-35">{announcement.isActive ? <Eye className="size-4" /> : <EyeOff className="size-4" />}</button>
                    <button type="button" onClick={() => saveAnnouncement(announcement)} disabled={savingId === announcement.id} title="Save announcement" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-[#0a7ae6] px-3 text-xs font-bold text-white transition hover:bg-[#086ac9] disabled:cursor-not-allowed disabled:opacity-60">{savingId === announcement.id ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />} Save</button>
                    <button type="button" onClick={() => removeAnnouncement(announcement)} disabled={savingId === announcement.id} title="Delete announcement" className="inline-flex size-9 items-center justify-center rounded-lg border border-red-100 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-35"><Trash2 className="size-4" /></button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {announcements.length === 0 && (
            <div className="flex flex-col items-center px-6 py-16 text-center">
              <Megaphone className="size-9 text-slate-300" />
              <h3 className="mt-3 text-sm font-bold text-slate-900">No announcements yet</h3>
              <p className="mt-1 max-w-sm text-xs leading-5 text-slate-500">Add a message above to give visitors a timely offer or useful next step.</p>
            </div>
          )}

          <div className="flex items-center gap-2 border-t border-slate-100 bg-slate-50 px-4 py-3 text-xs text-slate-500 sm:px-5">
            <CheckCircle2 className="size-4 text-emerald-600" /> Changes are live for new page loads. Keep messages short so the bar stays readable.
          </div>
        </section>
      </div>
    </div>
  );
}
