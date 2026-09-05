"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, ArrowRight } from "lucide-react";
import { priceToNumber, useCart } from "@/components/providers/cart-provider";
import { formatINR } from "@/lib/format-price";

export type StorefrontProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  hoverImage: string | null;
  price: string;
  oldPrice: string | null;
  rating: number;
  reviews: string;
  category: string;
  discount: string | null;
};

export default function ProductShowcaseSection({ products }: { products: StorefrontProduct[] }) {
  const router = useRouter();
  const { addItem, wishlistItems, toggleWishlistItem } = useCart();

  const addProductToCart = (product: StorefrontProduct) => {
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: priceToNumber(product.price),
      image: product.image,
      category: product.category,
    });
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-white px-4 py-6 sm:px-6 lg:px-8 lg:py-12">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.2em] text-[#0a7ae6]">
              Featured Products
            </p>
            <h2 className="mt-1 text-[22px] font-normal tracking-[-0.03em] text-slate-900 sm:text-[28px]">
              Latest Launch
            </h2>
          </div>

          <Link
            href="/shop"
            className="group inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-slate-800 shadow-xs transition-all duration-200 hover:border-[#0a7ae6] hover:bg-slate-50 hover:text-[#0a7ae6] active:scale-95 shrink-0"
          >
            <span>View All</span>
            <ArrowRight className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {products.slice(0, 4).map((product) => {
            const isWishlisted = wishlistItems.some((item) => item.id === product.id);

            return (
              <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="group block h-full"
              aria-label={`View ${product.name}`}
            >
              <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_12px_30px_rgba(15,23,42,0.08)]">
                <div className="flex flex-1 flex-col p-2.5 sm:p-4 lg:p-5">
                  <div className="relative flex h-[140px] items-center justify-center overflow-hidden rounded-md bg-slate-50/60 p-2 sm:h-[235px] sm:p-4 lg:h-[270px]">
                    <button
                      type="button"
                      aria-label={`${isWishlisted ? "Remove" : "Add"} ${product.name} ${isWishlisted ? "from" : "to"} wishlist`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleWishlistItem({
                          id: product.id,
                          slug: product.slug,
                          name: product.name,
                          price: priceToNumber(product.price),
                          oldPrice: product.oldPrice ? priceToNumber(product.oldPrice) : undefined,
                          image: product.image,
                          category: product.category,
                        });
                      }}
                      className="absolute top-2.5 right-2.5 z-10 flex size-8 items-center justify-center rounded-full bg-white/90 shadow-sm text-slate-400 backdrop-blur-xs transition-all duration-200 hover:scale-110 hover:bg-white hover:text-red-500 active:scale-95"
                    >
                      <Heart
                        className={`size-4 transition-colors ${
                          isWishlisted
                            ? "fill-red-500 text-red-500"
                            : "text-slate-400 hover:text-red-500"
                        }`}
                      />
                    </button>
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className={`object-contain p-2 transition-all duration-300 sm:p-3 ${
                        product.hoverImage
                          ? "opacity-100 group-hover:opacity-0"
                          : "group-hover:scale-[1.03]"
                      }`}
                      sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 50vw"
                    />
                    {product.hoverImage ? (
                      <Image
                        src={product.hoverImage}
                        alt={`${product.name} alternate view`}
                        fill
                        className="object-contain p-2 opacity-0 transition-all duration-300 group-hover:scale-[1.03] group-hover:opacity-100 sm:p-3"
                        sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 50vw"
                      />
                    ) : null}
                  </div>

                  <div className="mt-2.5 flex flex-1 flex-col sm:mt-4">
                    <p className="text-[9px] uppercase tracking-[0.15em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">
                      XElectron
                    </p>
                    <h3 className="mt-1 truncate text-[12px] font-medium leading-4 text-slate-900 sm:text-[16px] sm:leading-5">
                      {product.name}
                    </h3>

                    <p className="mt-1.5 hidden text-[11px] leading-4 text-slate-600 sm:line-clamp-2 sm:text-[12px]">
                      {product.description}
                    </p>

                    <div className="mt-auto flex items-baseline gap-1.5 pt-2.5 sm:pt-3">
                      <span className="text-[13px] font-medium text-slate-900 sm:text-[15px]">
                        {formatINR(product.price)}
                      </span>
                      {product.oldPrice ? (
                        <span className="text-[11px] text-slate-400 line-through sm:text-[12px]">
                          {formatINR(product.oldPrice)}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-1.5 sm:mt-4">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          addProductToCart(product);
                        }}
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md border border-[#0a7ae6] px-1 text-[10px] font-medium text-[#0a7ae6] truncate transition-colors hover:bg-[#0a7ae6] hover:text-white sm:h-10 sm:text-[12px]"
                      >
                        Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.preventDefault();
                          event.stopPropagation();
                          addProductToCart(product);
                          router.push(`/checkout?product=${encodeURIComponent(product.slug || product.id)}`);
                        }}
                        className="inline-flex h-8 cursor-pointer items-center justify-center rounded-md bg-[#0a7ae6] px-1 text-[10px] font-medium text-white truncate transition-opacity hover:opacity-90 sm:h-10 sm:text-[12px]"
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </article>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}



