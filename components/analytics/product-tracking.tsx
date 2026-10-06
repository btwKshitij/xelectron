"use client";

import { useEffect, useRef, type ReactNode, type MouseEvent } from "react";
import { analyticsItem, trackEcommerce, type AnalyticsProduct } from "@/lib/analytics";

/** Observe the actual card, so offscreen carousel slides don't count as views. */
export function TrackedProduct({ product, listId, listName, index, children }: {
  product: AnalyticsProduct; listId: string; listName: string; index: number; children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const seen = useRef("");
  const item = analyticsItem(product, index, listId, listName);
  const serialized = JSON.stringify(item);
  const identity = `${listId}:${product.id}:${index}`;
  useEffect(() => {
    const element = ref.current?.firstElementChild;
    if (!element) return;
    let inView = false;
    const check = () => {
      if (!inView || seen.current === identity) return;
      for (let node: Element | null = element; node; node = node.parentElement) {
        const style = getComputedStyle(node);
        if (style.visibility === "hidden" || style.display === "none" || Number(style.opacity) === 0) return;
      }
      {
        seen.current = identity;
        trackEcommerce("view_item_list", { item_list_id: listId, item_list_name: listName, items: [JSON.parse(serialized)] });
      }
    };
    const observer = new IntersectionObserver(entries => {
      inView = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= 0.5);
      check();
    }, { threshold: 0.5 });
    const styles = new MutationObserver(check);
    styles.observe(element, { attributes: true, attributeFilter: ["style", "class"] });
    observer.observe(element);
    return () => { observer.disconnect(); styles.disconnect(); };
  }, [serialized, identity, listId, listName]);

  function select(event: MouseEvent) {
    if (event.defaultPrevented || !(event.target instanceof Element) || event.target.closest("button")) return;
    if (event.target.closest("a") && (event.button === 0 || event.button === 1)) {
      trackEcommerce("select_item", { item_list_id: listId, item_list_name: listName, items: [item] });
    }
  }
  return <div ref={ref} className="contents" onClickCapture={select} onAuxClickCapture={select}>{children}</div>;
}
