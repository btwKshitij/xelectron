"use client";

type ProductDescriptionEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

export function ProductDescriptionEditor({ value, onChange }: ProductDescriptionEditorProps) {

  return (
    <div data-lenis-prevent className="overflow-hidden overscroll-contain rounded-lg border border-black/30 bg-white">
      <textarea
        aria-label="Product description"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => event.stopPropagation()}
        onWheel={(event) => event.stopPropagation()}
        placeholder="Write a product description"
        rows={6}
        className="block box-border h-44 min-h-44 max-h-44 w-full resize-none overflow-y-auto border-0 bg-transparent p-3 text-sm leading-6 outline-none focus:ring-2 focus:ring-black/15"
      />
    </div>
  );
}
