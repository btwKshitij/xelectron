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
  removeItem: (id: string) => void;
  clearCart: () => void;
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
  removeItem: () => {},
  clearCart: () => {},
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
      currentItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, item.quantity + change) }
          : item,
      ),
    );
  }, []);

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
      removeItem,
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
      toggleWishlistItem,
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
