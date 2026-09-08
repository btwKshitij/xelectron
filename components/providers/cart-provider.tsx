"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

const CART_STORAGE_KEY = "xelectron-shopping-cart";
const WISHLIST_STORAGE_KEY = "xelectron-wishlist";

export type CartItem = {
  id: string;
  slug?: string;
  name: string;
  price: number;
  image: string;
  category: string;
  quantity: number;
};

export type CartProduct = Omit<CartItem, "quantity">;

export type WishlistItem = CartProduct & {
  oldPrice?: number;
};

type CartContextValue = {
  items: CartItem[];
  cartCount: number;
  subtotal: number;
  addItem: (product: CartProduct) => void;
  addItems: (products: CartProduct[]) => void;
  updateQuantity: (id: string, change: number) => void;
  updateItemPrice: (id: string, price: number, name?: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  syncLivePrices: () => Promise<void>;
  wishlistItems: WishlistItem[];
  wishlistCount: number;
  toggleWishlistItem: (product: WishlistItem) => void;
  removeWishlistItem: (id: string) => void;
  clearWishlist: () => void;
};

const defaultCartContext: CartContextValue = {
  items: [],
  cartCount: 0,
  subtotal: 0,
  addItem: () => {},
  addItems: () => {},
  updateQuantity: () => {},
  updateItemPrice: () => {},
  removeItem: () => {},
  clearCart: () => {},
  syncLivePrices: async () => {},
  wishlistItems: [],
  wishlistCount: 0,
  toggleWishlistItem: () => {},
  removeWishlistItem: () => {},
  clearWishlist: () => {},
};

const CartContext = createContext<CartContextValue>(defaultCartContext);

function readStoredCart(): CartItem[] {
  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);
    if (!storedCart) return [];

    const parsed = JSON.parse(storedCart);
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter(
        (item): item is CartItem =>
          typeof item?.id === "string" &&
          typeof item?.name === "string" &&
          typeof item?.price === "number" &&
          typeof item?.image === "string" &&
          typeof item?.category === "string" &&
          typeof item?.quantity === "number" &&
          item.quantity > 0,
      )
      .map((item) => {
        // Auto-heal items with inflated price due to earlier decimal parsing (e.g. 699900 -> 6999)
        if (item.price >= 100000 && item.price % 100 === 0) {
          return { ...item, price: item.price / 100 };
        }
        return item;
      });
  } catch {
    return [];
  }
}

function readStoredWishlist(): WishlistItem[] {
  try {
    const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
    if (!storedWishlist) return [];

    const parsed = JSON.parse(storedWishlist);
    if (!Array.isArray(parsed)) return [];

    return parsed.filter(
      (item): item is WishlistItem =>
        typeof item?.id === "string" &&
        typeof item?.name === "string" &&
        typeof item?.price === "number" &&
        typeof item?.image === "string" &&
        typeof item?.category === "string" &&
        (item.oldPrice === undefined || typeof item.oldPrice === "number"),
    );
  } catch {
    return [];
  }
}

export function priceToNumber(price: string | number) {
  if (typeof price === "number") return price;
  if (!price) return 0;

  // Clean currency symbols, spaces, and commas while preserving decimal point
  const cleanStr = String(price).replace(/,/g, "").replace(/[^0-9.]/g, "");
  const parsed = parseFloat(cleanStr);
  return Number.isFinite(parsed) ? Math.round(parsed * 100) / 100 : 0;
}

export default function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [hasLoadedCart, setHasLoadedCart] = useState(false);
  const [hasLoadedWishlist, setHasLoadedWishlist] = useState(false);

  useEffect(() => {
    const loadCart = window.setTimeout(() => {
      setItems(readStoredCart());
      setWishlistItems(readStoredWishlist());
      setHasLoadedCart(true);
      setHasLoadedWishlist(true);
    }, 0);

    return () => window.clearTimeout(loadCart);
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  }, [hasLoadedCart, items]);

  useEffect(() => {
    if (!hasLoadedWishlist) return;
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistItems));
  }, [hasLoadedWishlist, wishlistItems]);

  const addItem = useCallback((product: CartProduct) => {
    setItems((currentItems) => {
      const existingItem = currentItems.find((item) => item.id === product.id);

      if (existingItem) {
        return currentItems.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }

      return [...currentItems, { ...product, quantity: 1 }];
    });
  }, []);

  const addItems = useCallback((products: CartProduct[]) => {
    setItems((currentItems) => {
      const nextItems = [...currentItems];

      products.forEach((product) => {
        const existingItemIndex = nextItems.findIndex((item) => item.id === product.id);
        if (existingItemIndex >= 0) {
          nextItems[existingItemIndex] = {
            ...nextItems[existingItemIndex],
            quantity: nextItems[existingItemIndex].quantity + 1,
          };
        } else {
          nextItems.push({ ...product, quantity: 1 });
        }
      });

      return nextItems;
    });
  }, []);

  const updateQuantity = useCallback((id: string, change: number) => {
    setItems((currentItems) =>
      currentItems
        .map((item) => {
          if (item.id !== id) return item;
          const nextQty = item.quantity + change;
          return nextQty <= 0 ? null : { ...item, quantity: nextQty };
        })
        .filter((item): item is CartItem => item !== null),
    );
  }, []);

  const updateItemPrice = useCallback((id: string, price: number, name?: string) => {
    setItems((currentItems) =>
      currentItems.map((item) => {
        if (item.id === id || item.slug === id) {
          return {
            ...item,
            price,
            ...(name ? { name } : {}),
          };
        }
        return item;
      }),
    );
  }, []);

  const syncLivePrices = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      const json = await res.json();
      if (!json.success || !Array.isArray(json.data) || json.data.length === 0) return;

      const productsMap = new Map<string, any>();
      for (const p of json.data) {
        if (p.id) productsMap.set(p.id, p);
        if (p.slug) productsMap.set(p.slug, p);
      }

      setItems((currentItems) => {
        let changed = false;
        const nextItems = currentItems.map((item) => {
          const matched = productsMap.get(item.id) || (item.slug ? productsMap.get(item.slug) : null);
          if (!matched) return item;

          const livePrice = priceToNumber(matched.price);
          const liveName = matched.name || item.name;
          const liveImage = matched.mainImage || item.image;
          const liveSlug = matched.slug || item.slug;

          if (livePrice > 0 && (item.price !== livePrice || item.name !== liveName || item.image !== liveImage)) {
            changed = true;
            return {
              ...item,
              price: livePrice,
              name: liveName,
              image: liveImage,
              slug: liveSlug,
            };
          }
          return item;
        });

        return changed ? nextItems : currentItems;
      });
    } catch {
      // Ignore network errors
    }
  }, []);

  useEffect(() => {
    if (!hasLoadedCart) return;
    syncLivePrices();
  }, [hasLoadedCart, syncLivePrices]);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const toggleWishlistItem = useCallback((product: WishlistItem) => {
    setWishlistItems((currentItems) =>
      currentItems.some((item) => item.id === product.id)
        ? currentItems.filter((item) => item.id !== product.id)
        : [...currentItems, product],
    );
  }, []);

  const removeWishlistItem = useCallback((id: string) => {
    setWishlistItems((currentItems) => currentItems.filter((item) => item.id !== id));
  }, []);

  const clearWishlist = useCallback(() => {
    setWishlistItems([]);
  }, []);

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      cartCount: items.reduce((total, item) => total + item.quantity, 0),
      subtotal: items.reduce((total, item) => total + item.price * item.quantity, 0),
      addItem,
      addItems,
      clearCart,
      updateQuantity,
      updateItemPrice,
      removeItem,
      syncLivePrices,
      wishlistItems,
      wishlistCount: wishlistItems.length,
      toggleWishlistItem,
      removeWishlistItem,
      clearWishlist,
    }),
    [
      addItem,
      addItems,
      clearCart,
      clearWishlist,
      items,
      removeItem,
      removeWishlistItem,
      syncLivePrices,
      toggleWishlistItem,
      updateItemPrice,
      updateQuantity,
      wishlistItems,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const cart = useContext(CartContext);
  return cart || defaultCartContext;
}
