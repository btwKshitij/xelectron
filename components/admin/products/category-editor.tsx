"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CirclePlus, FolderTree, ImagePlus, Search } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { uploadProductImage } from "@/lib/client/upload-product-image";

const inputClass = "h-9 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-black/50";

export type CategoryProduct = {
  id: string;
  title: string;
  slug: string;
  price: string;
  image: string;
};

export type EditableCategory = {
  id: string;
  title: string;
  slug: string;
  parentId: string | null;
  visible: boolean;
  description: string | null;
  image: string | null;
  productIds: string[];
};

export type CategoryOption = { id: string; title: string };

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm"><div className="flex items-center justify-between gap-3 px-4 py-4"><h2 className="text-sm font-semibold text-black/75">{title}</h2>{action}</div>{children}</section>;
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CategoryEditor({
  category,
  products,
  categories,
}: {
  category?: EditableCategory;
  products: CategoryProduct[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const isNew = !category;
  const [title, setTitle] = useState(category?.title ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [image, setImage] = useState(category?.image ?? "");
  const [parentId, setParentId] = useState(category?.parentId ?? "");
  const [visible, setVisible] = useState(category?.visible ?? true);
  const [status, setStatus] = useState(category?.visible === false ? "draft" : "active");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [productQuery, setProductQuery] = useState("");
  const [assignedProductIds, setAssignedProductIds] = useState(category?.productIds ?? []);
  const [draftProductIds, setDraftProductIds] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isImageUploading, setIsImageUploading] = useState(false);
  const [error, setError] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const assignedProducts = useMemo(() => products.filter((product) => assignedProductIds.includes(product.id)), [assignedProductIds, products]);
  const pickerProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();
    return !query ? products : products.filter((product) => product.title.toLowerCase().includes(query));
  }, [productQuery, products]);

  function openPicker() {
    setDraftProductIds(assignedProductIds);
    setProductQuery("");
    setPickerOpen(true);
  }

  function toggleDraftProduct(productId: string) {
    setDraftProductIds((current) => current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]);
  }

  async function uploadCategoryImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    setIsImageUploading(true);
    setError("");
    try {
      const uploadedImage = await uploadProductImage(file);
      setImage(uploadedImage.url);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Could not upload the category image");
    } finally {
      setIsImageUploading(false);
    }
  }

  async function saveCategory() {
    if (!title.trim() || isSaving) return;
    setIsSaving(true);
    setError("");

    try {
      const requestBody = {
        title: title.trim(),
        slug: slug.trim() || slugify(title),
        description: description.trim() || null,
        image: image || null,
        parentId: parentId || null,
        visible: status === "active" && visible,
      };
      const response = await fetch(isNew ? "/api/categories" : `/api/categories/${category.id}`, {
        method: isNew ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Could not save the category");

      const savedCategoryId = payload.data.id as string;
      const initialIds = new Set(category?.productIds ?? []);
      const productsToAdd = assignedProductIds.filter((productId) => !initialIds.has(productId));
      const assignments = await Promise.all(productsToAdd.map((productId) => fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ categoryId: savedCategoryId }),
      })));
      if (assignments.some((assignment) => !assignment.ok)) throw new Error("The category was saved, but one or more products could not be assigned");

      router.push(`/dashboard/products/categories/${payload.data.slug}`);
      router.refresh();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Could not save the category");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="min-h-full bg-[#f5f5f5] p-4 text-black sm:p-5">
      <div className="mx-auto max-w-[968px]">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <h1 className="flex items-center gap-1.5 text-lg font-semibold"><FolderTree className="size-4" /><ChevronRight className="size-4 text-black/45" />{isNew ? "Add category" : "Edit category"}</h1>
          <div className="flex items-center gap-2"><Link href="/dashboard/products/categories" className="inline-flex h-8 items-center rounded-lg bg-black/[0.06] px-3 text-xs font-medium transition hover:bg-black/10">Discard</Link><button type="button" disabled={!title.trim() || isSaving || isImageUploading} onClick={saveCategory} className="inline-flex h-8 items-center rounded-lg bg-black px-3 text-xs font-semibold text-white transition hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15">{isSaving ? "Saving…" : isNew ? "Create category" : "Save changes"}</button></div>
        </header>

        <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
          <div className="space-y-4">
            <SectionCard title="Category information"><div className="space-y-4 px-4 pb-4"><label className="grid gap-1.5 text-sm text-black/75"><span>Title</span><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Projectors" className={inputClass} /></label><label className="grid gap-1.5 text-sm text-black/75"><span>Description</span><textarea rows={6} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Describe this category for customers and search engines" className="w-full resize-none rounded-lg border border-black/25 bg-white p-3 text-sm outline-none focus:border-black/50" /></label><div className="grid gap-1.5 text-sm text-black/75"><span>Category image</span><input ref={imageInputRef} type="file" accept="image/avif,image/gif,image/jpeg,image/png,image/webp" onChange={(event) => void uploadCategoryImage(event)} className="sr-only" /><button type="button" onClick={() => imageInputRef.current?.click()} disabled={isImageUploading} className="relative flex h-28 overflow-hidden flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-black/35 text-sm text-black/65 transition hover:bg-black/[0.02] disabled:cursor-wait">{image ? <><Image src={image} alt="Category preview" fill sizes="400px" className="object-contain p-2" /><span className="relative rounded bg-white/90 px-2 py-1 text-xs font-medium text-black">Replace image</span></> : <><ImagePlus className="size-4" /><span>{isImageUploading ? "Uploading…" : "Upload image"}</span></>}</button>{image ? <button type="button" onClick={() => setImage("")} className="justify-self-start text-xs font-medium text-red-600 hover:underline">Remove image</button> : null}<span className="text-xs text-black/55">Shown in category cards and storefront navigation.</span></div></div></SectionCard>

            <SectionCard title="Products" action={<button type="button" onClick={openPicker} className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-black px-3 text-xs font-medium text-white transition hover:bg-black/80"><CirclePlus className="size-3.5" />Add products</button>}><div className="border-t border-black/10"><div className="flex items-center justify-between px-4 py-3 text-xs text-black/60"><span>{assignedProducts.length} products in this category</span><span>{products.length} products available</span></div>{assignedProducts.length ? <div className="divide-y divide-black/10">{assignedProducts.map((product) => <Link key={product.id} href={`/dashboard/products/${product.slug || product.id}`} className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-black transition hover:bg-black/[0.02] hover:text-[#005BD3]"><Image src={product.image || "/category-smartphone.png"} alt="" width={40} height={40} className="size-10 shrink-0 rounded-lg border border-black/10 object-contain p-1" /><span className="min-w-0 truncate">{product.title}</span></Link>)}</div> : <div className="px-4 py-10 text-center"><p className="text-sm font-medium">No products in this category</p><p className="mt-1 text-xs text-black/55">Use Add products to assign products to this category.</p></div>}</div></SectionCard>

            <SectionCard title="Search engine listing"><div className="space-y-4 px-4 pb-4"><label className="grid gap-1.5 text-sm text-black/75"><span>URL handle</span><span className="flex h-9 items-center overflow-hidden rounded-lg border border-black/25 bg-white focus-within:border-black/50"><span className="border-r border-black/10 px-3 text-sm text-black/45">/categories/</span><input value={slug} onChange={(event) => setSlug(event.target.value)} placeholder={slugify(title) || "projectors"} className="min-w-0 flex-1 bg-transparent px-3 text-sm outline-none" /></span></label><p className="text-xs text-black/55">A clear handle makes the category easier to find and share.</p></div></SectionCard>
            {error ? <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{error}</p> : null}
          </div>

          <aside className="space-y-4">
            <SectionCard title="Status"><div className="px-4 pb-4"><Select value={status} onValueChange={(value) => { if (value) setStatus(value); }}><SelectTrigger className="w-full rounded-lg border-black/25 !bg-white text-black shadow-none"><SelectValue /></SelectTrigger><SelectContent className="bg-white text-black"><SelectItem value="active">Active</SelectItem><SelectItem value="draft">Draft</SelectItem></SelectContent></Select></div></SectionCard>
            <SectionCard title="Category organization"><div className="space-y-4 px-4 pb-4"><div className="grid gap-1.5 text-sm text-black/75"><span>Parent category</span><Select value={parentId || "root"} onValueChange={(value) => setParentId(value === "root" ? "" : value || "")}><SelectTrigger className="w-full rounded-lg border-black/25 !bg-white text-black shadow-none"><SelectValue /></SelectTrigger><SelectContent className="bg-white text-black"><SelectItem value="root">No parent category</SelectItem>{categories.filter((option) => option.id !== category?.id).map((option) => <SelectItem key={option.id} value={option.id}>{option.title}</SelectItem>)}</SelectContent></Select></div><label className="flex items-center justify-between gap-3 rounded-lg border border-black/10 px-3 py-2.5 text-sm"><span><span className="block font-medium">Store visibility</span><span className="mt-0.5 block text-xs text-black/55">Customers can browse this category.</span></span><Switch checked={visible} onCheckedChange={setVisible} aria-label="Toggle store visibility" /></label></div></SectionCard>
            <SectionCard title="Category summary"><div className="space-y-3 px-4 pb-4 text-sm"><div className="flex items-center justify-between"><span className="text-black/60">Products added</span><span className="font-semibold">{assignedProducts.length}</span></div><div className="flex items-center justify-between"><span className="text-black/60">Storefront</span><span className="font-medium">{visible ? "Visible" : "Hidden"}</span></div><div className="flex items-center justify-between"><span className="text-black/60">Status</span><span className="font-medium capitalize">{status}</span></div></div></SectionCard>
          </aside>
        </div>
      </div>

      <Dialog open={pickerOpen} onOpenChange={setPickerOpen}><DialogContent showCloseButton={false} className="gap-0 overflow-hidden p-0 sm:!w-[620px] sm:!max-w-[620px]" overlayClassName="bg-black/45 supports-backdrop-filter:backdrop-blur-[1px]"><DialogHeader className="border-b border-black/10 px-5 py-4"><DialogTitle className="text-base font-semibold">Add products</DialogTitle><DialogDescription>Select the products that belong to this category.</DialogDescription></DialogHeader><div className="border-b border-black/10 p-4"><label className="flex h-9 items-center gap-2 rounded-lg border border-black/20 bg-white px-3 text-sm text-black/55 focus-within:border-black/50"><Search className="size-4" /><input autoFocus value={productQuery} onChange={(event) => setProductQuery(event.target.value)} placeholder="Search products" className="min-w-0 flex-1 bg-transparent outline-none placeholder:text-black/40" /></label></div><div className="max-h-[380px] overflow-y-auto">{pickerProducts.map((product) => <label key={product.id} className="flex cursor-pointer items-center gap-3 border-b border-black/[0.08] px-4 py-2.5 transition hover:bg-black/[0.025]"><input type="checkbox" checked={draftProductIds.includes(product.id)} onChange={() => toggleDraftProduct(product.id)} className="size-4 rounded accent-black" /><Image src={product.image || "/category-smartphone.png"} alt="" width={40} height={40} className="size-10 rounded-lg border border-black/10 object-contain p-1" /><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{product.title}</span><span className="mt-0.5 block text-xs text-black/55">{product.slug} · {product.price}</span></span></label>)}{pickerProducts.length === 0 ? <p className="px-4 py-10 text-center text-sm text-black/55">No products match your search.</p> : null}</div><DialogFooter className="flex-row items-center justify-between border-t border-black/10 px-4 py-3 sm:justify-between"><span className="text-xs text-black/55">{draftProductIds.length} selected</span><div className="flex gap-2"><button type="button" onClick={() => setPickerOpen(false)} className="h-8 rounded-lg border border-black/15 px-3 text-sm font-medium hover:bg-black/[0.03]">Cancel</button><button type="button" onClick={() => { setAssignedProductIds(draftProductIds); setPickerOpen(false); }} className="h-8 rounded-lg bg-black px-3 text-sm font-medium text-white hover:bg-black/80">Add products</button></div></DialogFooter></DialogContent></Dialog>
    </main>
  );
}
