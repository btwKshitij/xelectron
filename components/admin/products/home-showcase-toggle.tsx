type HomeShowcaseToggleProps = {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
};

export function HomeShowcaseToggle({ checked, onCheckedChange }: HomeShowcaseToggleProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-black/80">Show in Best Sellers</p>
        <p className="mt-1 text-xs leading-5 text-black/55">
          Add this product to the Best Sellers carousel on the home page.
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label="Show in Best Sellers"
        onClick={() => onCheckedChange(!checked)}
        className={`relative mt-0.5 inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 ${
          checked ? "bg-black" : "bg-black/20"
        }`}
      >
        <span
          aria-hidden="true"
          className={`size-5 rounded-full bg-white shadow-sm transition-transform ${
            checked ? "translate-x-5" : "translate-x-0.5"
          }`}
        />
      </button>
    </div>
  );
}
