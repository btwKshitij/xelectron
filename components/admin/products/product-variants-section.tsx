"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Palette, Layers, Box, Tag } from "lucide-react";

export type AdminProductVariant = {
  id?: string;
  name: string;
  sku?: string;
  price?: string;
  stock?: number;
  colorHex?: string;
  image?: string;
  sortOrder?: number;
};

export type AdminProductColor = {
  id?: string;
  name: string;
  bgHex: string;
  borderHex?: string | null;
};

type ProductVariantsSectionProps = {
  initialVariants?: AdminProductVariant[];
  initialColors?: AdminProductColor[];
  onChange?: (data: { variants: AdminProductVariant[]; colors: AdminProductColor[] }) => void;
};

const PRESET_COLORS: { name: string; hex: string }[] = [
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#ffffff" },
  { name: "Silver / Grey", hex: "#94a3b8" },
  { name: "Midnight Blue", hex: "#1e3a8a" },
  { name: "Emerald Green", hex: "#047857" },
  { name: "Crimson Red", hex: "#b91c1c" },
  { name: "Rose Gold", hex: "#f43f5e" },
  { name: "Gold / Champagne", hex: "#d97706" },
];

export function ProductVariantsSection({
  initialVariants = [],
  initialColors = [],
  onChange,
}: ProductVariantsSectionProps) {
  const [colors, setColors] = useState<AdminProductColor[]>(initialColors);
  const [variants, setVariants] = useState<AdminProductVariant[]>(initialVariants);

  // Sync back to parent form whenever colors or variants change
  useEffect(() => {
    if (onChange) {
      onChange({ colors, variants });
    }
  }, [colors, variants, onChange]);

  // Color functions
  const addColor = (preset?: { name: string; hex: string }) => {
    const newColor: AdminProductColor = preset
      ? { name: preset.name, bgHex: preset.hex }
      : { name: "New Color", bgHex: "#0a7ae6" };
    setColors((prev) => [...prev, newColor]);
  };

  const updateColor = (index: number, field: keyof AdminProductColor, value: string) => {
    setColors((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeColor = (index: number) => {
    setColors((prev) => prev.filter((_, i) => i !== index));
  };

  // Variant functions
  const addVariant = () => {
    const newVariant: AdminProductVariant = {
      name: "",
      sku: "",
      price: "",
      stock: 10,
      sortOrder: variants.length,
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const updateVariant = (index: number, field: keyof AdminProductVariant, value: any) => {
    setVariants((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {/* 1. COLOR SWATCHES MANAGEMENT (Crossbeats style) */}
      <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-black/80 flex items-center gap-2">
              <Palette className="size-4 text-[#0a7ae6]" />
              <span>Color Options & Swatches</span>
            </h3>
            <p className="text-xs text-black/55 mt-0.5">
              Configured colors will show on the product page as interactive color circles.
            </p>
          </div>
          <button
            type="button"
            onClick={() => addColor()}
            className="inline-flex items-center gap-1 rounded-lg border border-black/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-black/80 hover:bg-black/5 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Color</span>
          </button>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[11px] font-semibold text-black/50 uppercase tracking-wider mr-1">Presets:</span>
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.name}
              type="button"
              onClick={() => addColor(preset)}
              className="inline-flex items-center gap-1.5 rounded-full border border-black/15 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:border-black/30 hover:bg-slate-100 cursor-pointer"
            >
              <span className="size-2.5 rounded-full border border-black/20" style={{ backgroundColor: preset.hex }} />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>

        {/* Color List */}
        {colors.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/15 p-4 text-center text-xs text-black/50">
            No colors added yet. Click &quot;Add Color&quot; or select a preset above.
          </div>
        ) : (
          <div className="grid gap-2.5 sm:grid-cols-2">
            {colors.map((c, idx) => (
              <div
                key={c.id || `color-${idx}`}
                className="flex items-center gap-2 rounded-lg border border-black/10 bg-black/[0.01] p-2.5"
              >
                <input
                  type="color"
                  value={c.bgHex || "#000000"}
                  onChange={(e) => updateColor(idx, "bgHex", e.target.value)}
                  className="size-8 cursor-pointer rounded border border-black/20 bg-transparent p-0.5"
                  title="Pick Color"
                />
                <input
                  type="text"
                  value={c.name}
                  onChange={(e) => updateColor(idx, "name", e.target.value)}
                  placeholder="Color Name (e.g. Midnight Black)"
                  className="flex-1 h-8 rounded border border-black/15 bg-white px-2.5 text-xs text-black focus:border-black focus:outline-none"
                />
                <input
                  type="text"
                  value={c.bgHex}
                  onChange={(e) => updateColor(idx, "bgHex", e.target.value)}
                  placeholder="#HEX"
                  className="w-20 h-8 rounded border border-black/15 bg-white px-2 text-xs font-mono text-black focus:border-black focus:outline-none uppercase"
                />
                <button
                  type="button"
                  onClick={() => removeColor(idx)}
                  className="p-1 text-black/40 hover:text-red-600 transition cursor-pointer"
                  title="Delete Color"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. PRODUCT EDITIONS / SIZE / MODEL VARIANTS */}
      <div className="rounded-xl border border-black/10 bg-white p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black/10 pb-3">
          <div>
            <h3 className="text-sm font-semibold text-black/80 flex items-center gap-2">
              <Layers className="size-4 text-[#0a7ae6]" />
              <span>Product Variants & Specifications</span>
            </h3>
            <p className="text-xs text-black/55 mt-0.5">
              Add variants with dedicated SKU, price override, and stock availability.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 rounded-lg border border-black/20 bg-white px-2.5 py-1.5 text-xs font-semibold text-black/80 hover:bg-black/5 cursor-pointer"
          >
            <Plus className="size-3.5" />
            <span>Add Variant</span>
          </button>
        </div>

        {variants.length === 0 ? (
          <div className="rounded-lg border border-dashed border-black/15 p-4 text-center text-xs text-black/50">
            No specific variants configured. Default product pricing and inventory will apply.
          </div>
        ) : (
          <div className="space-y-2.5">
            {variants.map((v, idx) => (
              <div
                key={v.id || `variant-${idx}`}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-black/10 bg-black/[0.01] p-3"
              >
                <div className="flex-1 min-w-[140px]">
                  <label className="block text-[10px] font-semibold text-black/60 uppercase mb-0.5">
                    Variant Title
                  </label>
                  <input
                    type="text"
                    value={v.name}
                    onChange={(e) => updateVariant(idx, "name", e.target.value)}
                    placeholder="e.g. 1080p Full HD or 64GB"
                    className="w-full h-8 rounded border border-black/15 bg-white px-2.5 text-xs text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div className="w-28 min-w-[100px]">
                  <label className="block text-[10px] font-semibold text-black/60 uppercase mb-0.5">
                    SKU
                  </label>
                  <input
                    type="text"
                    value={v.sku || ""}
                    onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                    placeholder="SKU-VAR-01"
                    className="w-full h-8 rounded border border-black/15 bg-white px-2 text-xs font-mono text-black focus:border-black focus:outline-none uppercase"
                  />
                </div>

                <div className="w-28 min-w-[90px]">
                  <label className="block text-[10px] font-semibold text-black/60 uppercase mb-0.5">
                    Price (₹)
                  </label>
                  <input
                    type="text"
                    value={v.price || ""}
                    onChange={(e) => updateVariant(idx, "price", e.target.value)}
                    placeholder="e.g. 7999"
                    className="w-full h-8 rounded border border-black/15 bg-white px-2 text-xs text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div className="w-20 min-w-[70px]">
                  <label className="block text-[10px] font-semibold text-black/60 uppercase mb-0.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    value={v.stock ?? 0}
                    onChange={(e) => updateVariant(idx, "stock", parseInt(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full h-8 rounded border border-black/15 bg-white px-2 text-xs text-black focus:border-black focus:outline-none"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={() => removeVariant(idx)}
                    className="p-1 text-black/40 hover:text-red-600 transition cursor-pointer"
                    title="Remove Variant"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
