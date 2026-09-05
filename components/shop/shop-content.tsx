"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { priceToNumber, useCart } from "@/components/providers/cart-provider";
import { formatINR } from "@/lib/format-price";
import {
  getRecentlyViewedProductIds,
  recordRecentlyViewedProduct,
  recentlyViewedProductsUpdatedEvent,
} from "@/lib/recently-viewed-products";

export type ShopProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  mainImage: string;
  hoverImage: string | null;
  price: string;
  oldPrice: string | null;
  category: string;
  categorySlug: string;
  showInBestSellers: boolean;
  createdAt: string;
};

export default function ShopContent({ products }: { products: ShopProduct[] }) {
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const filterParam = searchParams.get("filter") || "all";
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    const updateRecentlyViewed = () => setRecentlyViewedIds(getRecentlyViewedProductIds());
    updateRecentlyViewed();
    window.addEventListener(recentlyViewedProductsUpdatedEvent, updateRecentlyViewed);
    return () => window.removeEventListener(recentlyViewedProductsUpdatedEvent, updateRecentlyViewed);
  }, []);

  const getFilteredProducts = () => {
    if (filterParam === "new-arrivals") {
      return [...products]
        .sort((left, right) => Date.parse(right.createdAt) - Date.parse(left.createdAt))
        .slice(0, 4);
    }

    if (filterParam === "best-sellers") {
      return products.filter((product) => product.showInBestSellers);
    }

    if (filterParam === "all") return products;

    return products.filter((product) => product.categorySlug === filterParam);
  };

  const filteredProducts = getFilteredProducts();
  const shownIds = new Set(filteredProducts.map((product) => product.id));
  const relatedProducts = products.filter((product) => !shownIds.has(product.id)).slice(0, 4);
  const recommendations = relatedProducts.length > 0 ? relatedProducts : products.slice(0, 4);
  const recentlyViewedProducts = recentlyViewedIds.reduce<ShopProduct[]>(
    (recentProducts, identifier) => {
      // Earlier releases could store the storefront slug. Newer releases store
      // the database ID, so accept both formats to preserve existing history.
      const product = products.find(
        (candidate) => candidate.id === identifier || candidate.slug === identifier,
      );

      if (!product || recentProducts.some((candidate) => candidate.id === product.id)) {
        return recentProducts;
      }

      return [...recentProducts, product];
    },
    [],
  );

  const heading =
    filterParam === "new-arrivals"
      ? "New Arrivals"
      : filterParam === "best-sellers"
        ? "Best Sellers"
        : filterParam === "all"
          ? "All Products"
          : filteredProducts[0]?.category || filterParam.replace(/-/g, " ");

  const addProductToCart = (product: ShopProduct, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    addItem({
      id: product.id,
      slug: product.slug,
      name: product.name,
      price: priceToNumber(product.price),
      image: product.mainImage,
      category: product.category,
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-10 text-center md:text-left">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a7ae6]">
          Collection
        </p>
        <div className="inline-block relative">
          <h1 className="mt-1.5 text-3xl font-normal tracking-tight text-slate-900 sm:text-4xl md:text-5xl">
            {heading}
          </h1>
          <div className="mt-2.5 h-0.5 w-14 rounded-full bg-[#0a7ae6] ml-auto" />
        </div>
        <p className="mt-3 max-w-xl text-sm text-slate-500 md:text-base">
          Explore our premium setup gear designed for ultimate performance, convenience, and immersive entertainment.
        </p>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-3">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onAddToCart={addProductToCart} />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center">
          <p className="text-slate-400">No products found matching this filter.</p>
        </div>
      )}

      {recommendations.length > 0 ? (
        <section className="mt-8 border-t border-slate-100 pt-6 sm:mt-16 sm:pt-12">
          <div className="mb-4 flex flex-col items-center text-center sm:mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a7ae6]">Recommendations</p>
            <div className="inline-block relative">
              <h2 className="mt-1.5 text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl">You May Also Like</h2>
              <div className="mt-2 h-0.5 w-12 rounded-full bg-[#0a7ae6] ml-auto" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4">
            {recommendations.map((product) => (
              <CompactProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-8 border-t border-slate-100 pt-6 sm:mt-16 sm:pt-12">
        <div className="mb-4 flex flex-col items-center text-center sm:mb-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-[#0a7ae6]">Your history</p>
          <div className="inline-block relative">
            <h2 className="mt-1.5 text-2xl font-normal tracking-tight text-slate-900 sm:text-3xl">Recently Viewed</h2>
            <div className="mt-2 h-0.5 w-12 rounded-full bg-[#0a7ae6] ml-auto" />
          </div>
        </div>

        {recentlyViewedProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6 lg:grid-cols-4">
            {recentlyViewedProducts.slice(0, 4).map((product) => (
              <CompactProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="py-8 text-center text-sm text-slate-500">Products you view will appear here.</p>
        )}
      </section>
    </div>
  );
}

function ProductCard({
  product,
  onAddToCart,
}: {
  product: ShopProduct;
  onAddToCart: (product: ShopProduct, event: React.MouseEvent<HTMLButtonElement>) => void;
}) {
  const router = useRouter();
  return (
    <Link prefetch={false}
      href={`/product/${product.slug}`}
      onClick={() => recordRecentlyViewedProduct(product.id)}
      className="group block h-full"
      aria-label={`View ${product.name}`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="relative flex h-[140px] items-center justify-center bg-[#ffffff] p-2 sm:h-[250px] sm:p-4 lg:h-[280px]">
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className={`object-contain p-2 transition-all duration-500 sm:p-4 ${
              product.hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"
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
        </div>

        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0a7ae6] sm:text-[11px] sm:tracking-[0.15em]">
            {product.category}
          </p>
          <h3 className="mt-1 truncate text-[12px] font-medium leading-4 text-slate-900 sm:text-[14px]">{product.name}</h3>
          <p className="mt-2 line-clamp-2 min-h-10 text-xs leading-5 text-slate-600 sm:text-sm">{product.description}</p>

          <div className="mt-auto flex items-baseline gap-1.5 pt-2.5 sm:pt-3">
            <span className="text-[16px] font-semibold text-slate-900 sm:text-[20px]">{formatINR(product.price)}</span>
            {product.oldPrice ? <span className="text-[11px] text-slate-400 line-through sm:text-[13px]">{formatINR(product.oldPrice)}</span> : null}
          </div>

          <div className="mt-2.5 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={(event) => onAddToCart(product, event)}
              className="inline-flex h-8 items-center justify-center truncate rounded-md border border-[#0a7ae6] px-1 text-[10px] font-medium text-[#0a7ae6] transition-colors group-hover:bg-[#0a7ae6]/5 sm:h-10 sm:text-[13px]"
            >
              Add to cart
            </button>
            <button
              type="button"
              onClick={(event) => {
                onAddToCart(product, event);
                router.push(`/checkout?product=${encodeURIComponent(product.slug || product.id)}`);
              }}
              className="inline-flex h-8 items-center justify-center truncate rounded-md bg-[#0a7ae6] px-1 text-[10px] font-medium text-white transition-opacity group-hover:opacity-90 sm:h-10 sm:text-[13px]"
            >
              Buy now
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}

function CompactProductCard({ product }: { product: ShopProduct }) {
  const router = useRouter();
  const { addItem } = useCart();

  return (
    <Link prefetch={false}
      href={`/product/${product.slug}`}
      onClick={() => recordRecentlyViewedProduct(product.id)}
      className="group block h-full"
      aria-label={`View ${product.name}`}
    >
      <article className="flex h-full flex-col overflow-hidden rounded-lg border border-slate-200/80 bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
        <div className="relative flex h-[120px] items-center justify-center bg-[#ffffff] p-2 sm:h-[180px] sm:p-4">
          <Image
            src={product.mainImage}
            alt={product.name}
            fill
            className={`object-contain p-2 transition-all duration-500 ${
              product.hoverImage ? "opacity-100 group-hover:opacity-0" : "group-hover:scale-105"
            }`}
            sizes="220px"
          />
          {product.hoverImage ? (
            <Image
              src={product.hoverImage}
              alt={`${product.name} alternate view`}
              fill
              className="object-contain p-2 opacity-0 transition-all duration-500 group-hover:scale-105 group-hover:opacity-100"
              sizes="220px"
            />
          ) : null}
        </div>
        <div className="flex flex-1 flex-col p-2.5 sm:p-4">
          <p className="text-[9px] font-semibold uppercase tracking-[0.12em] text-[#0a7ae6]">{product.category}</p>
          <h3 className="mt-1 truncate text-[12px] font-medium leading-4 text-slate-900 sm:text-[14px]">{product.name}</h3>
          
          <div className="mt-auto flex items-center justify-between gap-2 pt-3">
            <div className="flex flex-col">
              <span className="text-[14px] font-bold text-slate-900 sm:text-[16px]">{formatINR(product.price)}</span>
              {product.oldPrice ? <span className="text-[10px] text-slate-400 line-through">{formatINR(product.oldPrice)}</span> : null}
            </div>

            <button
              type="button"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                addItem({
                  id: product.id,
                  slug: product.slug,
                  name: product.name,
                  price: priceToNumber(product.price),
                  image: product.mainImage,
                  category: product.category,
                });
                router.push(`/checkout?product=${encodeURIComponent(product.slug || product.id)}`);
              }}
              className="inline-flex h-8 shrink-0 items-center justify-center rounded-md bg-[#0a7ae6] px-3 text-[11px] font-semibold text-white transition-opacity hover:opacity-90 sm:h-9 sm:px-4 sm:text-[12px]"
            >
              Buy now
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
