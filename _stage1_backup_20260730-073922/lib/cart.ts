import type { StoreProduct } from "@/lib/backend/types";

export const cartStorageKey = "onuora-cart";

export type CartItem = {
  productSlug: string;
  name: string;
  edition: string;
  image: string;
  size: string;
  quantity: number;
  unitPriceUsd: number;
};

export type CartSnapshot = {
  items: CartItem[];
};

export function priceToUsd(price: string) {
  const amount = Number(price.replace(/[^0-9.]/g, ""));
  return Number.isFinite(amount) && amount > 0 ? amount : 100;
}

export function productToCartItem(product: StoreProduct, size: string): CartItem {
  return {
    productSlug: product.slug,
    name: product.name,
    edition: product.edition,
    image: product.image,
    size,
    quantity: 1,
    unitPriceUsd: priceToUsd(product.price)
  };
}

export function readCart(): CartSnapshot {
  if (typeof window === "undefined") {
    return { items: [] };
  }

  try {
    const stored = window.localStorage.getItem(cartStorageKey);
    if (!stored) {
      return { items: [] };
    }

    const parsed = JSON.parse(stored) as CartSnapshot;
    return { items: Array.isArray(parsed.items) ? parsed.items : [] };
  } catch {
    return { items: [] };
  }
}

export function writeCart(cart: CartSnapshot) {
  window.localStorage.setItem(cartStorageKey, JSON.stringify(cart));
  window.dispatchEvent(new Event("onuora-cart-updated"));
}

export function addCartItem(item: CartItem) {
  const cart = readCart();
  const existing = cart.items.find(
    (cartItem) => cartItem.productSlug === item.productSlug && cartItem.size === item.size
  );

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  writeCart(cart);
  return cart;
}

export function updateCartItemQuantity(productSlug: string, size: string, quantity: number) {
  const cart = readCart();
  const nextItems = cart.items
    .map((item) => (item.productSlug === productSlug && item.size === size ? { ...item, quantity } : item))
    .filter((item) => item.quantity > 0);

  writeCart({ items: nextItems });
  return { items: nextItems };
}

export function clearCart() {
  writeCart({ items: [] });
}

export function cartSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.unitPriceUsd * item.quantity, 0);
}
