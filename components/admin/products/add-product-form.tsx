"use client";

import { FormEvent, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Pencil, Tag } from "lucide-react";

import { ProductAdditionalDetailsSection } from "@/components/admin/products/product-additional-details-section";
import { ProductDescriptionEditor } from "@/components/admin/products/product-description-editor";
import { HomeShowcaseToggle } from "@/components/admin/products/home-showcase-toggle";
import { NavbarShowcaseToggle } from "@/components/admin/products/navbar-showcase-toggle";
import { ProductMediaUploader } from "@/components/admin/products/product-media-uploader";
import { ProductVariantsSection } from "@/components/admin/products/product-variants-section";
import { uploadProductImage } from "@/lib/client/upload-product-image";
import { parsePriceNumber } from "@/lib/format-price";
import { ProductSpecsSection, type SpecItem } from "@/components/admin/products/product-specs-section";
import { ProductFaqsSection, type FaqItem } from "@/components/admin/products/product-faqs-section";
import { ProductBannersSection, type BannerItem } from "@/components/admin/products/product-banners-section";
import { ProductCascadeBannersSection } from "@/components/admin/products/product-cascade-banners-section";
import { ProductCreatorVideosSection, type ProductCreatorVideoItem } from "@/components/admin/products/product-creator-videos-section";

export type ProductCategoryOption = {
  id: string;
  title: string;
};

type CardProps = {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
};

const inputClass = "h-10 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-black/50";

function Card({ title, children, className = "", actions }: CardProps) {
  return (
    <section className={`overflow-hidden rounded-xl border border-black/10 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-3 px-4 py-4">
        <h2 className="text-sm font-semibold text-black/75">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
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

export function AddProductForm({ categories }: { categories: ProductCategoryOption[] }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [sku, setSku] = useState("");
  const [slug, setSlug] = useState("");
  const [shippingNotice, setShippingNotice] = useState("");
  const [isSlugTouched, setIsSlugTouched] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("0.00");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [showInBestSellers, setShowInBestSellers] = useState(false);
  const [showInNavbar, setShowInNavbar] = useState(false);
  const [status, setStatus] = useState("active");
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [variants, setVariants] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [specs, setSpecs] = useState<SpecItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [showcaseBanners, setShowcaseBanners] = useState<BannerItem[]>([]);
  const [sliderBanners, setSliderBanners] = useState<BannerItem[]>([]);
  const [sliderPosition, setSliderPosition] = useState<string>("after");
  const [creatorVideos, setCreatorVideos] = useState<ProductCreatorVideoItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId]
  );

  function handleTitleChange(newTitle: string) {
    setTitle(newTitle);
    if (!isSlugTouched) {
      setSlug(slugify(newTitle));
    }
  }

  async function saveProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const numericPrice = Number(price);
    const numericCompareAtPrice = compareAtPrice.trim() ? Number(compareAtPrice) : undefined;
    const numericQuantity = Number(quantity);

    if (!title.trim() || !description.trim() || !categoryId || !Number.isFinite(numericPrice) || numericPrice < 0 || !Number.isSafeInteger(numericQuantity) || numericQuantity < 0) {
      setMessage("Add a title, category, description, valid price, and whole-number quantity before saving.");
      return;
    }

    if (numericCompareAtPrice !== undefined && (!Number.isFinite(numericCompareAtPrice) || numericCompareAtPrice < 0)) {
      setMessage("Enter a valid compare-at price or leave it blank.");
      return;
    }

    const finalSlug = slug.trim() || slugify(title);
    if (!finalSlug) {
      setMessage("Use letters or numbers in the product title or URL slug.");
      return;
    }

    setIsSaving(true);
    setMessage("");
    try {
      const uploadedMedia = await Promise.all(
        mediaFiles.map(async (file, sortOrder) => ({
          ...(await uploadProductImage(file)),
          mimeType: file.type,
          sortOrder,
        }))
      );
      const mainImage = uploadedMedia[0]?.url || "/category-smartphone.png";
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: title.trim(),
          sku: sku.trim() || null,
          slug: finalSlug,
          categoryId,
          price: `₹${numericPrice.toFixed(2)}`,
          oldPrice: numericCompareAtPrice !== undefined ? `₹${numericCompareAtPrice.toFixed(2)}` : undefined,
          description: description.trim(),
          mainImage,
          shippingNotice: shippingNotice.trim() || "Cinema-grade theater projection, vibrant 4K support, Android Smart OS & immersive stereo audio.",
          quantity: numericQuantity,
          showInBestSellers,
          showInNavbar,
          media: uploadedMedia,
          variants,
          colors,
          features: features.map(f => f.trim()).filter(f => f !== ""),
          specs: specs.filter(s => s.label.trim() || s.value.trim()),
          faqs: faqs.filter(f => f.question.trim() || f.answer.trim()),
          banners: [
            ...showcaseBanners
              .filter((b) => b.imageUrl?.trim())
              .map((b, idx) => ({
                imageUrl: b.imageUrl.trim(),
                mobileImageUrl: b.mobileImageUrl?.trim() || null,
                title: b.title?.trim() || null,
                sortOrder: idx,
              })),
            ...sliderBanners
              .filter((b) => b.imageUrl?.trim())
              .map((b, idx) => ({
                imageUrl: b.imageUrl.trim(),
                mobileImageUrl: b.mobileImageUrl?.trim() || null,
                title: b.title?.trim() ? `[slider:pos:${sliderPosition}] ${b.title.trim()}` : `[slider:pos:${sliderPosition}]`,
                sortOrder: 1000 + idx,
              })),
          ],
          creatorVideos: creatorVideos
            .filter((v) => v.videoUrl?.trim())
            .map((v, idx) => ({
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
        throw new Error(result.error || "Unable to create product");
      }

      router.push("/dashboard/products");
      router.refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create product");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={saveProduct}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-black">Add product</h1>
          <p className="mt-1 text-xs text-black/55">Create a new product listing with rich media, specs, FAQs, and marketing banners.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-black px-4 text-sm font-medium text-white hover:bg-black/80 disabled:cursor-not-allowed disabled:bg-black/15"
          >
            {isSaving ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>

      {message ? (
        <p role="alert" className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {message}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_318px]">
        <div className="space-y-4">
          <Card title="Product details">
            <div className="space-y-4 px-4 pb-4">
              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Title</span>
                <input
                  aria-label="Title"
                  value={title}
                  onChange={(event) => handleTitleChange(event.target.value)}
                  placeholder="e.g. Cinema-Grade Smart Projector"
                  className={inputClass}
                />
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Subtitle / Tagline</span>
                <input
                  aria-label="Subtitle"
                  value={shippingNotice}
                  onChange={(event) => setShippingNotice(event.target.value)}
                  placeholder="e.g. Cinema-grade theater projection, vibrant 4K support..."
                  className={inputClass}
                />
                <span className="text-xs text-black/50">Displayed directly below the title on the product page.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>SKU / Model Number</span>
                <input
                  aria-label="SKU"
                  value={sku}
                  onChange={(event) => setSku(event.target.value)}
                  placeholder="e.g. XE-TECHNO-01"
                  className={`${inputClass} font-mono uppercase`}
                />
                <span className="text-xs text-black/50">Stock Keeping Unit for inventory tracking and identification.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>URL Handle (Slug)</span>
                <div className="flex items-center rounded-lg border border-black/25 bg-slate-50 px-3 text-sm focus-within:border-black/50">
                  <span className="text-black/45 select-none shrink-0 font-mono text-xs">/product/</span>
                  <input
                    aria-label="Slug"
                    value={slug}
                    onChange={(event) => {
                      setIsSlugTouched(true);
                      setSlug(slugify(event.target.value));
                    }}
                    placeholder="cinema-grade-smart-projector"
                    className="h-10 w-full bg-transparent px-1 font-mono text-xs text-black outline-none"
                  />
                </div>
                <span className="text-xs text-black/50">Used to build your customer-facing link.</span>
              </label>

              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Category</span>
                <select
                  aria-label="Category"
                  value={categoryId}
                  onChange={(event) => setCategoryId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.title}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </Card>

          <Card title="Description" className="mt-4">
            <div className="px-4 pb-4"><ProductDescriptionEditor value={description} onChange={setDescription} /></div>
          </Card>
          
          <ProductSpecsSection specs={specs} onChange={setSpecs} />

          <ProductBannersSection banners={showcaseBanners} onChange={setShowcaseBanners} />

          <ProductCascadeBannersSection
            banners={sliderBanners}
            onChange={setSliderBanners}
            position={sliderPosition}
            onPositionChange={setSliderPosition}
            showcaseCount={showcaseBanners.length}
          />

          <Card title="Creator & Hands-on Videos" className="mt-4">
            <div className="px-4 pb-4">
              <ProductCreatorVideosSection
                videos={creatorVideos}
                onChange={setCreatorVideos}
              />
            </div>
          </Card>

          <ProductFaqsSection faqs={faqs} onChange={setFaqs} />

          <Card title="Media" className="mt-4">
            <div className="px-4 pb-4"><ProductMediaUploader onFilesChange={setMediaFiles} /></div>
          </Card>

          <Card title="Price" className="mt-4">
            <div className="grid gap-4 px-4 pb-4 sm:grid-cols-2">
              <label className="grid gap-1.5 text-sm text-black/75"><span>Price</span><span className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/65">₹</span><input aria-label="Price" value={price} onChange={(event) => setPrice(event.target.value)} inputMode="decimal" className={`${inputClass} pl-7`} /></span></label>
              <label className="grid gap-1.5 text-sm text-black/75"><span>Compare-at price</span><span className="relative block"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-black/65">₹</span><input aria-label="Compare-at price" value={compareAtPrice} onChange={(event) => setCompareAtPrice(event.target.value)} inputMode="decimal" placeholder="0.00" className={`${inputClass} pl-7`} /></span></label>
            </div>
            {parsePriceNumber(price) > parsePriceNumber(compareAtPrice) && parsePriceNumber(compareAtPrice) > 0 && (
              <div className="px-4 pb-4">
                <p className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                  Warning: The selling price is higher than the compare-at price. Typically, the compare-at price should be the higher, original MRP.
                </p>
              </div>
            )}
          </Card>

          <Card title="Inventory" className="mt-4">
            <div className="px-4 pb-4">
              <label className="grid gap-1.5 text-sm text-black/75">
                <span>Quantity</span>
                <input aria-label="Quantity" type="number" min="0" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} inputMode="numeric" className={`${inputClass} ${Number(quantity) <= 5 ? "border-red-400 bg-red-50 text-red-700 focus:border-red-500 focus:ring-red-500/20" : ""}`} />
              </label>
              <p className={`mt-2 text-xs ${Number(quantity) <= 5 ? "text-red-600 font-medium" : "text-black/55"}`}>
                {Number(quantity) <= 5 ? (Number(quantity) === 0 ? "Out of stock!" : "Low stock warning.") : "Number of units currently available for sale."}
              </p>
            </div>
          </Card>

          <ProductVariantsSection
            initialColors={colors}
            initialVariants={variants}
            onChange={(data) => {
              setColors(data.colors);
              setVariants(data.variants);
            }}
          />
          <ProductAdditionalDetailsSection />
          <Card title="Search engine listing" className="mt-4" actions={<Pencil className="size-4 text-black/55" />}><p className="px-4 pb-5 text-sm text-black/65">{title ? `${title} · ${selectedCategory?.title || "Choose a category"}` : "Add a title and description to see how this product might appear in a search engine listing."}</p></Card>
        </div>

        <aside className="space-y-4">
          <Card title="Status"><div className="px-4 pb-4"><select value={status} onChange={(event) => setStatus(event.target.value)} className={inputClass}><option value="active">Active</option><option value="draft">Draft</option></select><p className="mt-2 text-xs text-black/55">Status will be stored when product publishing is added.</p></div></Card>
          <Card title="Home page"><div className="px-4 pb-4"><HomeShowcaseToggle checked={showInBestSellers} onCheckedChange={setShowInBestSellers} /></div></Card>
          <Card title="Navigation menu"><div className="px-4 pb-4"><NavbarShowcaseToggle checked={showInNavbar} onCheckedChange={setShowInNavbar} /></div></Card>
          <Card title="Product organization"><div className="space-y-4 px-4 pb-4 text-sm"><div><p className="text-black/75">Category</p><p className="mt-1 text-black/55">{selectedCategory?.title || "Choose a category in Product details."}</p></div><div><p className="text-black/75">Collections and tags</p><p className="mt-1 text-black/55">Available when those records are added to the database.</p></div></div></Card>
        </aside>
      </div>
    </form>
  );
}
