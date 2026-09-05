"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { SimilarProductCard } from "@/lib/products-data";
import { priceToNumber, useCart } from "@/components/providers/cart-provider";
import { formatINR } from "@/lib/format-price";

interface SimilarProductsSectionProps {
  products: SimilarProductCard[];
  excludeIds?: string[];
}

export default function SimilarProductsSection({ products, excludeIds = [] }: SimilarProductsSectionProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const excludeSet = new Set(excludeIds);
  const displayProducts = products
    .filter((product) => !excludeSet.has(product.id) && !excludeSet.has(product.slug))
    .slice(0, 4);

  if (displayProducts.length === 0) return null;

  return (
    <section className="mt-10 border-t border-slate-100 bg-white pt-8 sm:mt-12 sm:pt-10 lg:mt-16 lg:pt-12">
      <div className="mx-auto max-w-[1440px]">
        <div className="px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-normal uppercase tracking-wider text-slate-900 sm:text-3xl lg:text-[34px]">
            Related Products
          </h2>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 px-4 sm:grid-cols-2 sm:gap-4 sm:px-6 lg:grid-cols-4 lg:gap-4 lg:px-8">
          {displayProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group flex min-h-[320px] flex-col rounded-[12px] border border-slate-100 bg-white p-3 shadow-[0_1px_2px_rgba(15,23,42,0.05)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)] sm:min-h-[360px]"
            >
              <p className="text-[11px] leading-none text-slate-400">{product.category}</p>
              <h3 className="mt-1 truncate w-full text-[14px] font-medium tracking-tight text-slate-900 sm:text-[16px]" title={product.name}>
                {product.name}
              </h3>

              <div className="relative mt-3 flex flex-1 items-center justify-center overflow-hidden rounded-[10px] bg-white py-3 sm:py-4 min-h-[180px] sm:min-h-[240px]">
                <Image
                  src={product.image}
                  alt={product.alt}
                  fill
                  className={`object-contain p-2 transition-all duration-300 ${
                    product.hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"
                  }`}
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                />
                {product.hoverImage && (
                  <Image
                    src={product.hoverImage}
                    alt={`${product.alt} alternate`}
                    fill
                    className="object-contain p-2 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                )}
              </div>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[15px] font-bold tracking-tight text-slate-900 sm:text-[18px]">
                      {formatINR(product.price)}
                    </span>
                    {product.oldPrice && (
                      <span className="text-[11px] text-slate-400 line-through sm:text-[13px]">
                        {formatINR(product.oldPrice)}
                      </span>
                    )}
                  </div>
                  {product.discount && (
                    <span className="text-[10px] font-bold text-emerald-600 mt-0.5">
                      {product.discount}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    addItem({ id: product.id, slug: product.slug, name: product.name, price: priceToNumber(product.price), image: product.image, category: product.category });
                    router.push(`/checkout?product=${encodeURIComponent(product.slug || product.id)}`);
                  }}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-900 transition-colors hover:border-[#0a7ae6] hover:bg-[#0a7ae6] hover:text-white sm:px-4 sm:py-2 sm:text-[12px] shrink-0"
                >
                  Buy
                </button>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
