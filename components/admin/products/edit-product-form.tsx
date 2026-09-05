"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ExternalLink, GripVertical, Save, Tag, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { ProductDescriptionEditor } from "@/components/admin/products/product-description-editor";
import { HomeShowcaseToggle } from "@/components/admin/products/home-showcase-toggle";
import { NavbarShowcaseToggle } from "@/components/admin/products/navbar-showcase-toggle";
import { ProductMediaUploader } from "@/components/admin/products/product-media-uploader";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import { parsePriceNumber } from "@/lib/format-price";
import { ProductSpecsSection, type SpecItem } from "@/components/admin/products/product-specs-section";
import { ProductFaqsSection, type FaqItem } from "@/components/admin/products/product-faqs-section";
import { ProductBannersSection, type BannerItem } from "@/components/admin/products/product-banners-section";
import { ProductCascadeBannersSection } from "@/components/admin/products/product-cascade-banners-section";
import { ProductCreatorVideosSection, type ProductCreatorVideoItem } from "@/components/admin/products/product-creator-videos-section";
import { ProductVariantsSection } from "@/components/admin/products/product-variants-section";

type CategoryOption = {
  id: string;
  title: string;
};

type EditableProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  oldPrice: string | null;
  mainImage: string;
  shippingNotice?: string | null;
  categoryId: string;
  quantity: number;
  showInBestSellers: boolean;
  showInNavbar?: boolean;
  category: { title: string } | null;
  media: { id: string; url: string; sortOrder: number }[];
  features?: { featureText: string }[];
  specs?: { id?: string; label: string; value: string }[];
  faqs?: { id?: string; question: string; answer: string }[];
  banners?: { id?: string; imageUrl: string; mobileImageUrl?: string | null; title?: string | null; sortOrder?: number }[];
  creatorVideos?: { id?: string; title?: string | null; thumbnailUrl: string; videoUrl?: string | null; sortOrder?: number; isActive?: boolean }[];
  sku?: string | null;
  colors?: { id?: string; name: string; bgHex: string; borderHex?: string | null }[];
  variants?: any[];
};

type ExistingMediaItem = {
  id?: string;
  url: string;
};

const inputClass = "h-10 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-black/50";

function inputValueForPrice(value: string | null) {
  return value?.replace(/[^0-9.]/g, "") ?? "";
}

function formatPrice(value: string) {
  return `₹${Number(value).toFixed(2)}`;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .split(/[\s-]+/)
    .filter(Boolean)
    .join("-");
}

function getExistingMedia(product: EditableProduct): ExistingMediaItem[] {
  const mediaByUrl = new Map(product.media.map((media) => [media.url, media]));
  const seenUrls = new Set<string>();

  return [product.mainImage, ...product.media.map((media) => media.url)].flatMap((url) => {
    if (!url || seenUrls.has(url)) return [];

    seenUrls.add(url);
    return [{ id: mediaByUrl.get(url)?.id, url }];
  });
}

function confirmDiscardChanges() {
  return window.confirm(
    "You have unsaved changes. Press Cancel to stay and save them, or OK to discard your changes."
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm">
      <h2 className="px-4 py-4 text-sm font-semibold text-black/75">{title}</h2>
      <div className="px-4 pb-4">{children}</div>
    </section>
  );
}

export function EditProductForm({ product, categories }: { product: EditableProduct; categories: CategoryOption[] }) {
  const router = useRouter();
  const generatedSlug = slugify(product.name);
  const usesGeneratedSlug =
    !product.slug ||
    product.slug === generatedSlug ||
    generatedSlug.startsWith(`${product.slug}-`);
  const [title, setTitle] = useState(product.name);
  const [sku, setSku] = useState((product as any).sku || "");
  const [slug, setSlug] = useState(usesGeneratedSlug ? generatedSlug : product.slug);
  const [shippingNotice, setShippingNotice] = useState(product.shippingNotice || "");
  const [isSlugTouched, setIsSlugTouched] = useState(
    !usesGeneratedSlug
  );
  const [categoryId, setCategoryId] = useState(product.categoryId);
  const [description, setDescription] = useState(product.description);
  const [price, setPrice] = useState(inputValueForPrice(product.price));
  const [compareAtPrice, setCompareAtPrice] = useState(inputValueForPrice(product.oldPrice));
  const [quantity, setQuantity] = useState(String(product.quantity));
  const [showInBestSellers, setShowInBestSellers] = useState(product.showInBestSellers);
  const [showInNavbar, setShowInNavbar] = useState(product.showInNavbar ?? false);
  const [variants, setVariants] = useState<any[]>(() => ((product as any).variants || []).map((v: any) => ({ ...v })));
  const [colors, setColors] = useState<any[]>(() => (product.colors || []).map((c: any) => ({ ...c })));
  const [orderedMedia, setOrderedMedia] = useState<ExistingMediaItem[]>(() => getExistingMedia(product));
  const [draggedMediaIndex, setDraggedMediaIndex] = useState<number | null>(null);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [features, setFeatures] = useState<string[]>(() => product.features?.map(f => f.featureText) || []);
  const [specs, setSpecs] = useState<SpecItem[]>(() => product.specs?.map(s => ({ label: s.label, value: s.value })) || []);
  const [faqs, setFaqs] = useState<FaqItem[]>(() => product.faqs?.map(f => ({ question: f.question, answer: f.answer })) || []);
  const [showcaseBanners, setShowcaseBanners] = useState<BannerItem[]>(() =>
    product.banners
      ?.filter((b) => !b.title?.includes("[slider]") && !(typeof b.sortOrder === "number" && b.sortOrder >= 1000))
      .map((b) => ({ id: b.id, imageUrl: b.imageUrl, mobileImageUrl: b.mobileImageUrl, title: b.title, sortOrder: b.sortOrder })) || []
  );
  const [sliderBanners, setSliderBanners] = useState<BannerItem[]>(() =>
    product.banners
      ?.filter((b) => b.title?.includes("[slider]") || (typeof b.sortOrder === "number" && b.sortOrder >= 1000))
      .map((b) => ({
        id: b.id,
        imageUrl: b.imageUrl,
        mobileImageUrl: b.mobileImageUrl,
        title: b.title?.replace(/\[slider(?::(?:pos:\w+|before|after))?\]\s*/gi, "").trim() || "",
        sortOrder: b.sortOrder,
      })) || []
  );
  const [sliderPosition, setSliderPosition] = useState<string>(() => {
    const sliderBanner = product.banners?.find((b) => b.title?.includes("[slider"));
    if (sliderBanner?.title) {
      const match = sliderBanner.title.match(/\[slider(?::pos:(\w+|\d+)|:(before|after))?\]/i);
      if (match) return match[1] || match[2] || "after";
    }
    return "after";
  });
  const [creatorVideos, setCreatorVideos] = useState<ProductCreatorVideoItem[]>(() => {
    return (product.creatorVideos || []).filter((v: any) => v && ((v as any).isProductVideo === true || (v as any).is_product_video === true)).map((v) => ({
      id: v.id,
      title: v.title,
      thumbnailUrl: v.thumbnailUrl,
      videoUrl: v.videoUrl,
      sortOrder: v.sortOrder,
      isActive: v.isActive,
    }));
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");
  const isRestoringHistoryRef = useRef(false);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId]
  );

  function handleTitleChange(nextTitle: string) {
    setTitle(nextTitle);
    if (!isSlugTouched) setSlug(slugify(nextTitle));
  }
  const isDirty = useMemo(() => {
    const initialMedia = getExistingMedia(product);
    const mediaChanged =
      initialMedia.length !== orderedMedia.length ||
      initialMedia.some((media, index) => {
        const currentMedia = orderedMedia[index];
        return currentMedia?.url !== media.url || currentMedia?.id !== media.id;
      });
    const featuresChanged = 
      features.length !== (product.features?.length || 0) ||
      features.some((f, i) => f !== product.features?.[i]?.featureText);
    const specsChanged =
      specs.length !== (product.specs?.length || 0) ||
      specs.some((s, i) => s.label !== product.specs?.[i]?.label || s.value !== product.specs?.[i]?.value);
    const faqsChanged =
      faqs.length !== (product.faqs?.length || 0) ||
      faqs.some((f, i) => f.question !== product.faqs?.[i]?.question || f.answer !== product.faqs?.[i]?.answer);
    
    const initialShowcase = product.banners?.filter((b) => !b.title?.includes("[slider]") && !(typeof b.sortOrder === "number" && b.sortOrder >= 1000)) || [];
    const initialSlider = product.banners?.filter((b) => b.title?.includes("[slider]") || (typeof b.sortOrder === "number" && b.sortOrder >= 1000)) || [];
    const showcaseChanged =
      showcaseBanners.length !== initialShowcase.length ||
      showcaseBanners.some((b, i) => b.imageUrl !== initialShowcase[i]?.imageUrl || b.mobileImageUrl !== initialShowcase[i]?.mobileImageUrl || b.title !== initialShowcase[i]?.title);
    const sliderChanged =
      sliderBanners.length !== initialSlider.length ||
      sliderBanners.some((b, i) => b.imageUrl !== initialSlider[i]?.imageUrl || b.mobileImageUrl !== initialSlider[i]?.mobileImageUrl || (b.title || "") !== (initialSlider[i]?.title?.replace(/\[slider(?::(?:pos:\w+|before|after))?\]\s*/gi, "").trim() || ""));

    const initialSliderSample = product.banners?.find((b) => b.title?.includes("[slider"));
    let initialPos = "after";
    if (initialSliderSample?.title) {
      const match = initialSliderSample.title.match(/\[slider(?::pos:(\w+|\d+)|:(before|after))?\]/i);
      if (match) initialPos = match[1] || match[2] || "after";
    }
    const positionChanged = sliderPosition !== initialPos;

    const initialVideos = product.creatorVideos || [];
    const videosChanged =
      creatorVideos.length !== initialVideos.length ||
      creatorVideos.some((v, i) => v.title !== initialVideos[i]?.title || v.thumbnailUrl !== initialVideos[i]?.thumbnailUrl || v.videoUrl !== initialVideos[i]?.videoUrl);

    const initialColors = product.colors || [];
    const colorsChanged =
      colors.length !== initialColors.length ||
      colors.some((c, i) => c.name !== initialColors[i]?.name || c.bgHex !== initialColors[i]?.bgHex);

    const initialVariants = (product as any).variants || [];
    const variantsChanged =
      variants.length !== initialVariants.length ||
      variants.some((v, i) => v.name !== initialVariants[i]?.name || v.sku !== initialVariants[i]?.sku || v.price !== initialVariants[i]?.price || v.stock !== initialVariants[i]?.stock);

    return (
      title !== product.name ||
      sku !== ((product as any).sku || "") ||
      slug !== product.slug ||
      shippingNotice !== (product.shippingNotice || "") ||
      categoryId !== product.categoryId ||
      description !== product.description ||
      price !== inputValueForPrice(product.price) ||
      compareAtPrice !== inputValueForPrice(product.oldPrice) ||
      quantity !== String(product.quantity) ||
      showInBestSellers !== product.showInBestSellers ||
      showInNavbar !== (product.showInNavbar ?? false) ||
      mediaChanged ||
      featuresChanged ||
      specsChanged ||
      faqsChanged ||
      showcaseChanged ||
      sliderChanged ||
      positionChanged ||
      videosChanged ||
      colorsChanged ||
      variantsChanged ||
      mediaFiles.length > 0
    );
  }, [categoryId, compareAtPrice, description, faqs, features, mediaFiles.length, orderedMedia, price, product, quantity, shippingNotice, showcaseBanners, showInBestSellers, showInNavbar, sliderBanners, sliderPosition, slug, specs, title, creatorVideos, colors, variants, sku]);

  useEffect(() => {
    if (!isDirty) return;

    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handleDocumentClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey ||
        !(event.target instanceof Element)
      ) {
        return;
      }

      const link = event.target.closest<HTMLAnchorElement>("a[href]");
      if (!link || link.target === "_blank" || link.hasAttribute("download")) return;

      const href = link.getAttribute("href");
      if (!href || href.startsWith("#") || href === window.location.pathname) return;

      if (!confirmDiscardChanges()) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    document.addEventListener("click", handleDocumentClick, true);
    return () => document.removeEventListener("click", handleDocumentClick, true);
  }, [isDirty]);

  useEffect(() => {
    if (!isDirty) return;

    const handlePopState = () => {
      if (isRestoringHistoryRef.current) {
        isRestoringHistoryRef.current = false;
        return;
      }

      if (!confirmDiscardChanges()) {
        isRestoringHistoryRef.current = true;
        window.history.forward();
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isDirty]);

  function moveMedia(fromIndex: number, toIndex: number) {
    setOrderedMedia((current) => {
      if (fromIndex === toIndex || toIndex < 0 || toIndex >= current.length) return current;

      const next = [...current];
      const [movedMedia] = next.splice(fromIndex, 1);
      if (!movedMedia) return current;

      next.splice(toIndex, 0, movedMedia);
      return next;
    });
  }

  function removeMedia(index: number) {
    setOrderedMedia((current) => current.filter((_, currentIndex) => currentIndex !== index));
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericPrice = Number(price);
    const numericCompareAtPrice = compareAtPrice.trim() ? Number(compareAtPrice) : undefined;
    const numericQuantity = Number(quantity);
    const finalSlug = slug.trim() || slugify(title);

    if (!title.trim() || !description.trim() || !categoryId || !finalSlug || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isSafeInteger(numericQuantity) || numericQuantity < 0) {
      setMessage("Add a title, category, description, valid price, and whole-number quantity before saving.");
      return;
    }
    if (numericCompareAtPrice !== undefined && (!Number.isFinite(numericCompareAtPrice) || numericCompareAtPrice < 0)) {
      setMessage("Enter a valid compare-at price or leave it blank.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const nextMediaSortOrder = Math.max(
        orderedMedia.length,
        ...product.media.map((media) => media.sortOrder + 1)
      );
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (file, index) => ({
          ...(await uploadProductImage(file)),
          mimeType: file.type,
          sortOrder: nextMediaSortOrder + index,
        }))
      );
      const removedMediaIds = product.media
        .filter((media) => !orderedMedia.some((currentMedia) => currentMedia.id === media.id))
        .map((media) => media.id);
      const response = await fetch(`/api/products/${encodeURIComponent(product.id)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          sku: sku.trim() || null,
          slug: finalSlug,
          shippingNotice: shippingNotice.trim(),
          categoryId,
          description: description.trim(),
          price: formatPrice(price),
          oldPrice: numericCompareAtPrice === undefined ? null : formatPrice(compareAtPrice),
          quantity: numericQuantity,
          showInBestSellers,
          showInNavbar,
          mainImage: orderedMedia[0]?.url ?? uploadedMedia[0]?.url ?? "",
          newMedia: uploadedMedia,
          removeMediaIds: removedMediaIds,
          mediaOrder: orderedMedia.flatMap((media, sortOrder) =>
            media.id ? [{ id: media.id, sortOrder }] : []
          ),
          variants,
          colors,
          features: features.map(f => f.trim()).filter(f => f !== ""),
          specs: specs.filter(s => s.label.trim() || s.value.trim()),
          faqs: faqs.filter(f => f.question.trim() || f.answer.trim()),
          banners: [
            ...showcaseBanners
              .filter((b) => b.imageUrl?.trim())
              .map((b, idx) => ({
                id: b.id,
                imageUrl: b.imageUrl.trim(),
                mobileImageUrl: b.mobileImageUrl?.trim() || null,
                title: b.title?.trim() || null,
                sortOrder: idx,
              })),
            ...sliderBanners
              .filter((b) => b.imageUrl?.trim())
              .map((b, idx) => ({
                id: b.id,
                imageUrl: b.imageUrl.trim(),
                mobileImageUrl: b.mobileImageUrl?.trim() || null,
                title: b.title?.trim() ? `[slider:pos:${sliderPosition}] ${b.title.trim()}` : `[slider:pos:${sliderPosition}]`,
                sortOrder: 1000 + idx,
              })),
          ],
          creatorVideos: creatorVideos
            .filter((v) => v.videoUrl?.trim())
            .map((v, idx) => ({
              id: v.id,
              title: v.title?.trim() || null,
              videoUrl: v.videoUrl?.trim() || null,
              thumbnailUrl: v.thumbnailUrl?.trim() || "/creator-projector.png",
              sortOrder: typeof v.sortOrder === "number" ? v.sortOrder : idx,
              isActive: v.isActive ?? true,
            })),
        }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Unable to save changes");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to save changes");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-lg font-semibold"><Tag className="size-4" /> Edit product</h1>
          <p className="mt-1 text-xs text-black/55">Editing {product.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link prefetch={false} href={`/product/${product.slug}`} target="_blank" className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black/[0.06] px-3 text-sm font-medium hover:bg-black/10"><ExternalLink className="size-3.5" /> Store</Link>
          {isDirty ? <span aria-live="polite" className="hidden text-xs font-medium text-amber-700 sm:inline">Unsaved changes</span> : null}
          <button type="submit" disabled={isSaving || !isDirty} className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15"><Save className="size-3.5" /> {isSaving ? "Saving…" : "Save changes"}</button>
        </div>
      </div>

      {message ? <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">{message}</p> : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="space-y-4">
          <Card title="Product details">
            <div className="space-y-4">
              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Title</span>
                <input value={title} onChange={(event) => handleTitleChange(event.target.value)} className={inputClass} />
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>SKU / Model Number</span>
                <input
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="e.g. XE-TECHNO-01"
                  className={`${inputClass} font-mono uppercase`}
                />
                <span className="text-xs text-black/50">Stock Keeping Unit for inventory identification.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Subtitle / Tagline</span>
                <input
                  value={shippingNotice}
                  onChange={(event) => setShippingNotice(event.target.value)}
                  className={inputClass}
                  placeholder="e.g. Cinema-grade theater projection, vibrant 4K support..."
                />
                <span className="text-xs text-black/50">Displayed directly below the title on the product page.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>URL Handle (Slug)</span>
                <div className="flex items-center rounded-lg border border-black/25 bg-slate-50 px-3 text-sm focus-within:border-black/50">
                  <span className="text-black/45 select-none shrink-0 font-mono text-xs">/product/</span>
                  <input
                    value={slug}
                    onChange={(event) => {
                      setIsSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    className="h-10 w-full bg-transparent px-1 font-mono text-xs text-black outline-none"
                    placeholder="techno-projector"
                  />
                </div>
                <span className="text-xs text-black/50">Short, readable URL path for this product.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Category</span>
                <select value={categoryId} onChange={(event) => setCategoryId(event.target.value)} className={inputClass}>
                  {categories.map((category) => <option key={category.id} value={category.id}>{category.title}</option>)}
                </select>
              </label>
            </div>
          </Card>
          <Card title="Description"><ProductDescriptionEditor value={description} onChange={setDescription} /></Card>
          <ProductSpecsSection specs={specs} onChange={setSpecs} />
          <ProductBannersSection banners={showcaseBanners} onChange={setShowcaseBanners} />
          <ProductCascadeBannersSection
            banners={sliderBanners}
            onChange={setSliderBanners}
            position={sliderPosition}
            onPositionChange={setSliderPosition}
            showcaseCount={showcaseBanners.length}
          />
          <Card title="Creator & Hands-on Videos">
            <ProductCreatorVideosSection
              videos={creatorVideos}
              onChange={setCreatorVideos}
            />
          </Card>
          <ProductFaqsSection faqs={faqs} onChange={setFaqs} />
          <Card title="Media">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {orderedMedia.map((media, index) => (
                <div
                  key={media.url}
                  draggable
                  onDragStart={(event) => {
                    setDraggedMediaIndex(index);
                    event.dataTransfer.effectAllowed = "move";
                    event.dataTransfer.setData("text/plain", media.url);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (draggedMediaIndex !== null) moveMedia(draggedMediaIndex, index);
                    setDraggedMediaIndex(null);
                  }}
                  onDragEnd={() => setDraggedMediaIndex(null)}
                  className={`group relative aspect-square cursor-grab overflow-hidden rounded-lg border bg-[#fafafa] transition ${
                    draggedMediaIndex === index
                      ? "border-black/30 opacity-45"
                      : "border-black/10 hover:border-black/30"
                  }`}
                >
                  <Image src={media.url || "/category-smartphone.png"} alt={`${title} image ${index + 1}`} fill className="object-contain p-1" />
                  {index === 0 ? <span className="absolute bottom-1 left-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] font-medium text-white">Primary</span> : null}
                  <div className="absolute right-1 top-1 flex items-center rounded-md border border-black/10 bg-white/95 p-0.5 shadow-sm">
                    <GripVertical aria-hidden="true" className="size-3.5 text-black/45" />
                    <button type="button" aria-label={`Move image ${index + 1} earlier`} disabled={index === 0} onClick={() => moveMedia(index, index - 1)} className="rounded p-0.5 text-black/60 hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-25"><ArrowLeft className="size-3.5" /></button>
                    <button type="button" aria-label={`Move image ${index + 1} later`} disabled={index === orderedMedia.length - 1} onClick={() => moveMedia(index, index + 1)} className="rounded p-0.5 text-black/60 hover:bg-black/[0.06] disabled:cursor-not-allowed disabled:opacity-25"><ArrowRight className="size-3.5" /></button>
                    <button type="button" aria-label={`Delete image ${index + 1}`} title="Delete image" onPointerDown={(event) => event.stopPropagation()} onClick={() => removeMedia(index)} className="rounded p-0.5 text-red-600 hover:bg-red-50"><Trash2 className="size-3.5" /></button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-sm text-black/60">Drag images to reorder them or use the arrows. The first image is the primary product image.</p>
            <div className="mt-4"><ProductMediaUploader onFilesChange={setMediaFiles} /></div>
          </Card>
          <Card title="Price">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm text-black/75"><span>Price</span><span className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/65">₹</span><input value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={`${inputClass} pl-7`} /></span></label>
              <label className="grid gap-1.5 text-sm text-black/75"><span>Compare-at price</span><span className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/65">₹</span><input value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} inputMode="decimal" placeholder="0.00" className={`${inputClass} pl-7`} /></span></label>
            </div>
            {parsePriceNumber(price) > parsePriceNumber(compareAtPrice) && parsePriceNumber(compareAtPrice) > 0 && (
              <p className="mt-3 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                Warning: The selling price is higher than the compare-at price. Typically, the compare-at price should be the higher, original MRP.
              </p>
            )}
          </Card>
          <Card title="Inventory">
            <label className="grid gap-1.5 text-sm text-black/75">
              <span>Quantity</span>
              <input aria-label="Quantity" type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="numeric" className={`${inputClass} ${Number(quantity) <= 5 ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
            </label>
            <p className={`mt-2 text-xs ${Number(quantity) <= 5 ? "text-red-600 font-medium" : "text-black/55"}`}>
              {Number(quantity) <= 5 ? (Number(quantity) === 0 ? "Out of stock!" : "Low stock warning.") : "Number of units currently available for sale."}
            </p>
          </Card>

          <ProductVariantsSection
            initialColors={colors}
            initialVariants={variants}
            onChange={(data) => {
              setColors(data.colors);
              setVariants(data.variants);
            }}
          />
        </div>

        <aside className="space-y-4">
          <Card title="Home page">
            <HomeShowcaseToggle checked={showInBestSellers} onCheckedChange={setShowInBestSellers} />
          </Card>
          <Card title="Navigation menu">
            <NavbarShowcaseToggle checked={showInNavbar} onCheckedChange={setShowInNavbar} />
          </Card>
          <Card title="Product organization">
            <dl className="space-y-3 text-sm"><div><dt className="text-black/55">Category</dt><dd className="mt-1 font-medium">{selectedCategory?.title || product.category?.title || "Uncategorized"}</dd></div><div><dt className="text-black/55">Handle</dt><dd className="mt-1 break-all font-medium">{slugify(title) || product.slug}</dd></div></dl>
          </Card>
        </aside>
      </div>
    </form>
  );
}
