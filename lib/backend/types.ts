import type { Product } from "@/data/catalog";

export type StoreProduct = Product & {
  id?: string;
  sort_order?: number;
  updated_at?: string;
};

export type OrderItem = {
  productSlug: string;
  quantity: number;
  size: string;
  unitPriceUsd: number;
};

export type CheckoutDraft = {
  email: string;
  fullName: string;
  phone?: string;
  currency: string;
  items: OrderItem[];
  shippingCountry?: string;
  shippingCity?: string;
  shippingAddress?: string;
};
