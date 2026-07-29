"use client";

import Image from "next/image";
import { Loader2, LockKeyhole, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { cartSubtotal, readCart, type CartItem } from "@/lib/cart";

type OrderStatus = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };
type QuoteStatus = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };

type DeliveryQuote = {
  id?: string;
  methodName: string;
  shippingUsd: number;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  distanceKm: number | null;
  routeConfidence: string;
  requiresManualReview: boolean;
  note: string;
};

const deliveryFields = new Set([
  "shippingAddress",
  "shippingCity",
  "shippingState",
  "postalCode",
  "shippingCountry"
]);

const fieldClass =
  "gold-focus min-h-12 border border-line bg-page px-4 text-sm font-normal normal-case text-copy outline-none transition placeholder:text-copy-muted/60 hover:border-line-strong focus:border-copy";
const labelClass = "grid gap-2 text-[10px] font-semibold uppercase text-copy";

function money(amount: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount);
}

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>({ type: "idle" });
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const subtotal = useMemo(() => cartSubtotal(items), [items]);
  const shipping = deliveryQuote?.shippingUsd ?? 0;
  const total = subtotal + shipping;

  useEffect(() => {
    const syncCart = () => setItems(readCart().items);
    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("onuora-cart-updated", syncCart);

    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("onuora-cart-updated", syncCart);
    };
  }, []);

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (deliveryQuote && deliveryFields.has(target.name)) {
      setDeliveryQuote(null);
      setQuoteStatus({ type: "idle" });
    }
  }

  async function handleDeliveryQuote() {
    if (!formRef.current) return;

    const form = new FormData(formRef.current);
    const payload = {
      email: String(form.get("email") ?? "") || undefined,
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingState: String(form.get("shippingState") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalUsd: subtotal
    };

    if (!payload.shippingAddress || !payload.shippingCity || !payload.shippingCountry) {
      setQuoteStatus({
        type: "error",
        message: "Add your address, city, and country to estimate delivery."
      });
      return;
    }

    setQuoteStatus({ type: "loading" });
    const response = await fetch("/api/delivery/quote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok || !result?.quote) {
      setQuoteStatus({
        type: "error",
        message: result?.error ?? "Unable to estimate delivery right now."
      });
      return;
    }

    setDeliveryQuote(result.quote);
    setQuoteStatus({ type: "idle" });
    setStatus({ type: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!items.length) {
      setStatus({ type: "error", message: "Your bag is empty." });
      return;
    }

    if (!deliveryQuote) {
      setStatus({ type: "error", message: "Estimate delivery before continuing to payment." });
      return;
    }

    const form = new FormData(event.currentTarget);
    setStatus({ type: "loading" });

    const payload = {
      email: String(form.get("email") ?? ""),
      fullName: String(form.get("fullName") ?? ""),
      phone: String(form.get("phone") ?? ""),
      currency: "USD",
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingState: String(form.get("shippingState") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      deliveryQuoteId: deliveryQuote.id,
      items: items.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
        size: item.size,
        unitPriceUsd: item.unitPriceUsd
      }))
    };

    const response = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus({
        type: "error",
        message: result?.error ?? "Unable to place this order right now."
      });
      return;
    }

    if (result?.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }

    setStatus({ type: "error", message: "Stripe did not return a checkout URL." });
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between gap-5 border-b border-line pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gold">Secure checkout</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Delivery and payment.</h1>
        </div>
        <LockKeyhole className="h-5 w-5 text-gold" aria-label="Secure payment" />
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start">
        <form
          ref={formRef}
          onSubmit={handleSubmit}
          onChange={handleFormChange}
          className="grid gap-4"
        >
          <h2 className="mb-1 text-sm font-semibold uppercase">Contact</h2>
          <label className={labelClass}>
            Email
            <input name="email" type="email" autoComplete="email" required className={fieldClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Full name
              <input name="fullName" autoComplete="name" required className={fieldClass} />
            </label>
            <label className={labelClass}>
              Phone
              <input name="phone" type="tel" autoComplete="tel" className={fieldClass} />
            </label>
          </div>

          <h2 className="mb-1 mt-5 text-sm font-semibold uppercase">Delivery address</h2>
          <label className={labelClass}>
            Street address
            <input name="shippingAddress" autoComplete="street-address" required className={fieldClass} />
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              City
              <input name="shippingCity" autoComplete="address-level2" required className={fieldClass} />
            </label>
            <label className={labelClass}>
              State / Region
              <input name="shippingState" autoComplete="address-level1" className={fieldClass} />
            </label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>
              Postal code
              <input name="postalCode" autoComplete="postal-code" className={fieldClass} />
            </label>
            <label className={labelClass}>
              Country
              <input name="shippingCountry" autoComplete="country-name" required className={fieldClass} />
            </label>
          </div>

          <div className="mt-3 border border-line p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-semibold uppercase">Delivery estimate</p>
                  <p className="mt-1 max-w-md text-sm leading-6 text-copy-muted">
                    {deliveryQuote
                      ? `${deliveryQuote.methodName}: ${deliveryQuote.estimatedMinDays}-${deliveryQuote.estimatedMaxDays} business days${
                          deliveryQuote.distanceKm ? `, approximately ${deliveryQuote.distanceKm} km` : ""
                        }.`
                      : "Enter your destination to calculate the applicable service and rate."}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDeliveryQuote}
                disabled={quoteStatus.type === "loading" || !items.length}
                className="gold-focus inline-flex min-h-11 shrink-0 items-center justify-center gap-2 border border-copy px-4 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                {quoteStatus.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Calculate
              </button>
            </div>
            {quoteStatus.type === "error" ? (
              <p className="mt-3 text-sm font-medium text-wine">{quoteStatus.message}</p>
            ) : null}
            {deliveryQuote?.requiresManualReview ? (
              <p className="mt-3 text-sm text-copy-muted">{deliveryQuote.note}</p>
            ) : null}
          </div>

          <p className="text-xs leading-5 text-copy-muted">
            Stripe securely processes payment in USD. Your bank may display the local equivalent.
          </p>
          {status.type === "error" ? (
            <p className="text-sm font-medium text-wine">{status.message}</p>
          ) : null}
          <button
            type="submit"
            disabled={status.type === "loading" || !items.length || !deliveryQuote}
            className="gold-focus mt-2 inline-flex min-h-12 items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-45"
          >
            {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Continue to secure payment
          </button>
        </form>

        <aside className="bg-surface-subtle p-6 lg:sticky lg:top-[124px]">
          <h2 className="text-lg font-semibold">Order summary</h2>
          <div className="mt-5 space-y-4">
            {items.length ? (
              items.map((item) => (
                <div
                  key={`${item.productSlug}-${item.size}`}
                  className="grid grid-cols-[64px_1fr_auto] gap-3 border-b border-line pb-4"
                >
                  <div className="relative aspect-[3/4] bg-page">
                    <Image src={item.image} alt={item.name} fill sizes="64px" className="object-contain p-1.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{item.name}</p>
                    <p className="mt-1 text-[10px] uppercase text-copy-muted">
                      {item.edition} / {item.size} / Qty {item.quantity}
                    </p>
                  </div>
                  <p className="text-xs font-medium">{money(item.unitPriceUsd * item.quantity)}</p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-copy-muted">
                Your bag is empty. Add a garment before checkout.
              </p>
            )}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-copy-muted">Subtotal</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-copy-muted">Delivery</span>
              <span>{deliveryQuote ? money(shipping) : "Not calculated"}</span>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-semibold">
              <span>Total</span>
              <span>{money(total)}</span>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
