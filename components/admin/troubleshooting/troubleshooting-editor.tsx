"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ChevronDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { troubleshootingSchema, type TroubleshootingContent } from "@/lib/shared/troubleshooting";

const pageFields = [
  ["badge", "Support badge"], ["title", "Page title"], ["description", "Introduction"],
  ["searchPlaceholder", "Search placeholder"], ["helpTitle", "Repair callout title"],
  ["helpDescription", "Repair callout description"], ["helpButton", "Repair button text"],
  ["helpHref", "Repair button link"],
] as const;

export function TroubleshootingEditor({ initialContent }: { initialContent: TroubleshootingContent }) {
  const [content, setContent] = useState(initialContent);
  const [tab, setTab] = useState<"guides" | "topics" | "settings">("guides");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [saved, setSaved] = useState(JSON.stringify(initialContent));
  const dirty = JSON.stringify(content) !== saved;

  function updateGuide(id: string, patch: Partial<TroubleshootingContent["guides"][number]>) {
    setContent(c => ({ ...c, guides: c.guides.map(g => g.id === id ? { ...g, ...patch } : g) }));
  }
  function moveGuide(index: number, direction: number) {
    setContent(c => {
      const guides = [...c.guides];
      [guides[index], guides[index + direction]] = [guides[index + direction], guides[index]];
      return { ...c, guides };
    });
  }
  async function save(event: FormEvent) {
    event.preventDefault();
    const parsed = troubleshootingSchema.safeParse(content);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setTab(issue?.path[0] === "guides" ? "guides" : issue?.path[0] === "categories" ? "topics" : "settings");
      setMessage(`${issue?.path[0] === "guides" && typeof issue.path[1] === "number" ? `Guide ${issue.path[1] + 1}: ` : ""}${issue?.message ?? "Check your content."}`);
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/troubleshooting", {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Unable to save changes.");
      setContent(parsed.data);
      setSaved(JSON.stringify(parsed.data));
      setMessage("Saved. Your changes are live on the troubleshooting page.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save changes.");
    } finally { setSaving(false); }
  }

  return (
    <div className="mx-auto w-full max-w-4xl p-4 sm:px-8 sm:py-7">
      <div className="mb-2 flex items-center gap-2"><SidebarTrigger /><h1 className="text-xl font-semibold tracking-tight">Troubleshooting</h1></div>
      <p className="mb-6 text-sm text-muted-foreground">Manage your technical guides and support page.</p>
      <form onSubmit={save} noValidate>
        <div className="mb-6 flex gap-6 border-b" role="tablist" aria-label="Editor sections">
          {([['guides', 'Guides'], ['topics', 'Topics'], ['settings', 'Page settings']] as const).map(([value, label]) => (
            <button key={value} id={`tab-${value}`} type="button" role="tab" aria-selected={tab === value} tabIndex={tab === value ? 0 : -1} onKeyDown={event => {
              const tabs = ["guides", "topics", "settings"] as const;
              const index = tabs.indexOf(value);
              const next = event.key === "ArrowRight" ? tabs[(index + 1) % 3] : event.key === "ArrowLeft" ? tabs[(index + 2) % 3] : event.key === "Home" ? tabs[0] : event.key === "End" ? tabs[2] : null;
              if (next) { event.preventDefault(); setTab(next); document.getElementById(`tab-${next}`)?.focus(); }
            }} aria-controls={`panel-${value}`} onClick={() => setTab(value)} className={`border-b-2 px-1 pb-3 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-4 ${tab === value ? 'border-black font-medium text-black' : 'border-transparent text-muted-foreground hover:text-black'}`}>{label}</button>
          ))}
        </div>
        <fieldset disabled={saving} className="space-y-6 disabled:opacity-60">
          <section id="panel-settings" role="tabpanel" aria-labelledby="tab-settings" hidden={tab !== "settings"} className="space-y-5">
            <h2 className="text-sm font-semibold">Page text & repair link</h2>
            <div className="grid gap-4 sm:grid-cols-2">
            {pageFields.map(([key, label]) => (
              <label key={key} className="block space-y-2 text-sm font-medium">
                <span>{label}</span>
                <Input required value={content[key]} onChange={e => setContent(c => ({ ...c, [key]: e.target.value }))} />
              </label>
            ))}
            </div>
          </section>
          <section id="panel-topics" role="tabpanel" aria-labelledby="tab-topics" hidden={tab !== "topics"} className="space-y-4">
            <h2 className="text-sm font-semibold">Topics</h2>
            {content.categories.map((category, i) => (
              <div key={category.id} className="flex flex-wrap items-end gap-3">
                <label className="flex-1 space-y-2 text-sm"><span>Topic name</span><Input required value={category.name} onChange={e => setContent(c => ({ ...c, categories: c.categories.map((cat, index) => index === i ? { ...cat, name: e.target.value } : cat) }))} /></label>
                <label className="space-y-2 text-sm"><span className="block">Icon</span><select className="h-9 rounded-md border px-3" value={category.icon} onChange={e => setContent(c => ({ ...c, categories: c.categories.map((cat, index) => index === i ? { ...cat, icon: e.target.value as typeof category.icon } : cat) }))}><option value="tv">TV / Projector</option><option value="audio">Audio</option><option value="wifi">WiFi</option></select></label>
                <Button type="button" variant="outline" disabled={content.categories.length === 1 || content.guides.some(g => g.category === category.id)} onClick={() => setContent(c => ({ ...c, categories: c.categories.filter(cat => cat.id !== category.id) }))}>Remove topic</Button>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Move or remove a topic&apos;s guides before removing the topic.</p>
            <Button type="button" variant="outline" onClick={() => setContent(c => ({ ...c, categories: [...c.categories, { id: crypto.randomUUID(), name: "New topic", icon: "tv" }] }))}>Add topic</Button>
          </section>
          <section id="panel-guides" role="tabpanel" aria-labelledby="tab-guides" hidden={tab !== "guides"} className="space-y-3">
            <p className="pb-1 text-sm text-muted-foreground">{content.guides.length} guides. Select a guide to edit it.</p>
            {content.guides.map((guide, index) => (
              <details key={guide.id} open={!guide.title || undefined} className="group rounded-lg border bg-white">
                <summary className="flex cursor-pointer list-none items-center gap-3 px-4 py-4 text-sm [&::-webkit-details-marker]:hidden">
                  <span className="min-w-0 flex-1"><span className="block font-medium">{guide.title || "New guide"}</span><span className="mt-1 block text-xs text-muted-foreground">{content.categories.find(cat => cat.id === guide.category)?.name} &middot; {guide.steps.length} steps</span></span>
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground group-open:rotate-180" />
                </summary>
                <div className="space-y-4 border-t px-4 py-4">
                <div className="flex flex-wrap items-center gap-2"><h3 className="mr-auto font-medium">Guide {index + 1}</h3><Button type="button" variant="outline" disabled={index === 0} onClick={() => moveGuide(index, -1)}>Move up</Button><Button type="button" variant="outline" disabled={index === content.guides.length - 1} onClick={() => moveGuide(index, 1)}>Move down</Button><Button type="button" variant="outline" onClick={() => setContent(c => ({ ...c, guides: c.guides.filter(g => g.id !== guide.id) }))}>Remove guide</Button></div>
                <label className="block space-y-2 text-sm"><span>Title</span><Input required value={guide.title} onChange={e => updateGuide(guide.id, { title: e.target.value })} /></label>
                <label className="block space-y-2 text-sm"><span className="block">Topic</span><select className="h-9 w-full rounded-md border px-3" value={guide.category} onChange={e => updateGuide(guide.id, { category: e.target.value })}>{content.categories.map(cat => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</select></label>
                <label className="block space-y-2 text-sm"><span>Steps (one step per line)</span><Textarea required rows={6} value={guide.steps.join("\n")} onChange={e => updateGuide(guide.id, { steps: e.target.value.split("\n") })} /></label>
                </div>
              </details>
            ))}
            <Button type="button" variant="outline" onClick={() => setContent(c => ({ ...c, guides: [...c.guides, { id: crypto.randomUUID(), category: c.categories[0].id, title: "", steps: [""] }] }))}><Plus className="size-4" /> Add guide</Button>
          </section>
          <div className="sticky bottom-0 flex flex-wrap items-center gap-3 border-t bg-white py-4">
            <Button type="submit" disabled={saving || !dirty}>{saving ? "Saving..." : "Save changes"}</Button>
            <Button type="button" variant="ghost" disabled={!dirty} onClick={() => { setContent(JSON.parse(saved)); setMessage(""); }}>Discard changes</Button>
            <Link href="/troubleshooting" target="_blank" className="ml-auto text-sm text-muted-foreground underline underline-offset-4">View live page</Link>
            <span className="text-xs text-muted-foreground">{dirty ? "Unsaved changes" : "All changes saved"}</span>
          </div>
        </fieldset>
        <p role="status" className="mt-3 text-sm">{message}</p>
      </form>
    </div>
  );
}
