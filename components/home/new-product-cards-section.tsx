"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

import type { StorefrontProduct } from "@/components/home/product-showcase-section";
import { priceToNumber, useCart } from "@/components/providers/cart-provider";
import { formatINR } from "@/lib/format-price";

/** Shows dashboard products that are not already present in the first featured row. */
export default function NewProductCardsSection({ products = [] }: { products?: StorefrontProduct[] }) {
  const router = useRouter();
  const { addItem } = useCart();

  if (products.length === 0) return null;

  return (
    <section className="bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a7ae6]">Our Products</p>
            <h2 className="mt-1 text-[22px] font-normal tracking-[-0.03em] text-slate-900 sm:text-[28px]">Explore our complete range</h2>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.slug}`} className="group block h-full" aria-label={`View ${product.name}`}>
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
                <div className="relative flex h-[140px] items-center justify-center bg-slate-50/60 p-2 sm:h-[200px] sm:p-4 lg:h-[220px]">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className={`object-contain p-2 transition-all duration-500 sm:p-4 ${
                      product.hoverImage
                        ? "opacity-100 group-hover:opacity-0"
                        : "group-hover:scale-105"
                    }`}
                    sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                  />
                  {product.hoverImage ? (
                    <Image
                      src={product.hoverImage}
                      alt={`${product.name} alternate view`}
                      fill
                      className="object-contain p-2 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100 sm:p-4"
                      sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
                    />
                  ) : null}
                  {product.discount ? <span className="absolute left-2 top-2 rounded-[2px] bg-[#0a7ae6] px-1.5 py-0.5 text-[9px] font-semibold text-white sm:left-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-[11px]">{product.discount}</span> : null}
                </div>

                <div className="flex flex-1 flex-col p-2.5 sm:p-4">
                  <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0a7ae6] sm:text-[11px] sm:tracking-[0.15em]">{product.category}</p>
                  <h3 className="mt-1 truncate text-[12px] font-medium leading-4 text-slate-900 sm:text-[14px] sm:leading-5">{product.name}</h3>
                  <div className="mt-auto flex items-baseline gap-1.5 pt-2.5 sm:pt-3"><span className="text-[13px] font-medium text-slate-900 sm:text-[15px]">{formatINR(product.price)}</span>{product.oldPrice ? <span className="text-[11px] text-slate-400 line-through sm:text-[13px]">{formatINR(product.oldPrice)}</span> : null}</div>
                  <div className="mt-2.5 grid grid-cols-2 gap-1.5"><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); addItem({ id: product.id, slug: product.slug, name: product.name, price: priceToNumber(product.price), image: product.image, category: product.category }); }} className="inline-flex h-8 items-center justify-center rounded-md border border-[#0a7ae6] px-1 text-[10px] font-medium text-[#0a7ae6] truncate transition-colors group-hover:bg-[#0a7ae6]/5 sm:h-10 sm:text-[13px]">Add to cart</button><button type="button" onClick={(event) => { event.preventDefault(); event.stopPropagation(); addItem({ id: product.id, slug: product.slug, name: product.name, price: priceToNumber(product.price), image: product.image, category: product.category }); router.push(`/checkout?product=${encodeURIComponent(product.slug || product.id)}`); }} className="inline-flex h-8 items-center justify-center rounded-md bg-[#0a7ae6] px-1 text-[10px] font-medium text-white truncate transition-opacity group-hover:opacity-90 sm:h-10 sm:text-[13px]">Buy now</button></div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
