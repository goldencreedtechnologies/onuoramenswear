import { PRODUCT_PRICES, getCollectionByFamily } from "@/data/site-config";
import type { StoreProduct } from "@/lib/backend/types";

export const cartStorageKey = "onuora-cart";

export type CartItem = {
  productSlug: string;
  name: string;
  edition: string;
  image: string;
  colorName: string;
  colorValue: string;
  size: string;
  quantity: number;
  unitPriceUsd: number;
};

export type CartSnapshot = {
  items: CartItem[];
};

export function priceToUsd(price?: string) {
  void price;
  return PRODUCT_PRICES.USD;
}

export function cartItemKey(item: Pick<CartItem, "productSlug" | "size" | "colorName">) {
  return `${item.productSlug}::${item.size}::${item.colorName.toLowerCase()}`;
}

export function productToCartItem(
  product: StoreProduct,
  size: string,
  colour: { colorName: string; colorValue: string } = {
    colorName: product.colorName,
    colorValue: product.colorValue
  }
): CartItem {
  const collection = getCollectionByFamily(product.family);
  return {
    productSlug: product.slug,
    name: collection.englishName,
    edition: collection.igboName,
    image: product.image,
    colorName: colour.colorName,
    colorValue: colour.colorValue,
    size,
    quantity: 1,
    unitPriceUsd: priceToUsd(product.price)
  };
}

function normalizeCartItem(value: unknown): CartItem | null {
  if (!value || typeof value !== "object") return null;

  const item = value as Partial<CartItem>;
  if (
    typeof item.productSlug !== "string" ||
    typeof item.name !== "string" ||
    typeof item.edition !== "string" ||
    typeof item.image !== "string" ||
    typeof item.size !== "string" ||
    typeof item.quantity !== "number" ||
    typeof item.unitPriceUsd !== "number"
  ) {
    return null;
  }

  const fallbackColour = item.edition.replace(/\s+Edition$/i, "").trim() || "Selected Colour";

  return {
    productSlug: item.productSlug,
    name: item.name,
    edition: item.edition,
    image: item.image,
    colorName: typeof item.colorName === "string" ? item.colorName : fallbackColour,
    colorValue: typeof item.colorValue === "string" ? item.colorValue : "#1F1F1F",
    size: item.size,
    quantity: item.quantity,
    unitPriceUsd: item.unitPriceUsd
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

    const parsed = JSON.parse(stored) as Partial<CartSnapshot>;
    const items = Array.isArray(parsed.items)
      ? parsed.items.map(normalizeCartItem).filter((item): item is CartItem => Boolean(item))
      : [];

    return { items };
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
  const key = cartItemKey(item);
  const existing = cart.items.find((cartItem) => cartItemKey(cartItem) === key);

  if (existing) {
    existing.quantity += item.quantity;
  } else {
    cart.items.push(item);
  }

  writeCart(cart);
  return cart;
}

export function updateCartItemQuantity(
  productSlug: string,
  size: string,
  colorName: string,
  quantity: number
) {
  const targetKey = cartItemKey({ productSlug, size, colorName });
  const cart = readCart();
  const nextItems = cart.items
    .map((item) => (cartItemKey(item) === targetKey ? { ...item, quantity } : item))
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
