"use client";

import Image from "next/image";
import { Loader2, LockKeyhole, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/currency-provider";
import {
  DELIVERY_COPY,
  PRODUCT_PRICES,
  PRODUCT_TYPE_LABEL,
  formatCurrency,
  operationalUsdAmountInCurrency
} from "@/data/site-config";
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
  requiresManualReview: boolean;
  note: string;
};

const TEST_VOUCHER_CODE = "ONUORA-TEST-100";
const deliveryFields = new Set(["shippingAddress", "shippingCity", "shippingState", "postalCode", "shippingCountry"]);
const fieldClass = "gold-focus min-h-12 w-full border border-line bg-page px-4 text-sm font-normal normal-case text-copy outline-none transition placeholder:text-copy-muted/60 hover:border-line-strong focus:border-copy";
const labelClass = "grid gap-2 text-[10px] font-semibold uppercase text-copy";

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { currency } = useCurrency();
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>({ type: "idle" });
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const subtotalUsd = useMemo(() => cartSubtotal(items), [items]);
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = PRODUCT_PRICES[currency] * itemCount;
  const shipping = deliveryQuote ? operationalUsdAmountInCurrency(deliveryQuote.shippingUsd, currency) : 0;
  const voucherApplied = voucherCode.trim().toUpperCase() === TEST_VOUCHER_CODE;
  const discount = voucherApplied ? subtotal + shipping : 0;
  const total = subtotal + shipping - discount;
  const money = (amount: number) => formatCurrency(currency, amount);

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
      itemCount,
      subtotalUsd
    };

    if (!payload.shippingAddress || !payload.shippingCity || !payload.shippingCountry) {
      setQuoteStatus({ type: "error", message: "Add your address, city and country to estimate delivery." });
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
      setQuoteStatus({ type: "error", message: result?.error ?? "Unable to estimate delivery right now." });
      return;
    }

    setDeliveryQuote(result.quote);
    setQuoteStatus({ type: "idle" });
    setStatus({ type: "idle" });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!items.length) {
      setStatus({ type: "error", message: "Your cart is empty." });
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
      currency,
      shippingAddress: String(form.get("shippingAddress") ?? ""),
      shippingCity: String(form.get("shippingCity") ?? ""),
      shippingState: String(form.get("shippingState") ?? "") || undefined,
      postalCode: String(form.get("postalCode") ?? "") || undefined,
      shippingCountry: String(form.get("shippingCountry") ?? ""),
      deliveryQuoteId: deliveryQuote.id,
      voucherCode: voucherCode.trim(),
      items: items.map((item) => ({
        productSlug: item.productSlug,
        quantity: item.quantity,
        size: item.size,
        colorName: item.colorName,
        colorValue: item.colorValue,
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
      setStatus({ type: "error", message: result?.error ?? "Unable to place this order right now." });
      return;
    }
    if (result?.checkoutUrl) {
      window.location.assign(result.checkoutUrl);
      return;
    }
    if (result?.successUrl) {
      window.location.assign(result.successUrl);
      return;
    }
    setStatus({ type: "error", message: "Checkout did not return a completion URL." });
  }

  return (
    <>
      <div className="mb-7 flex items-center justify-between gap-5 border-b border-line pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gold">Secure Checkout</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Delivery And Payment.</h1>
        </div>
        <LockKeyhole className="h-5 w-5 text-gold" aria-label="Secure payment" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-start lg:gap-10">
        <form ref={formRef} onSubmit={handleSubmit} onChange={handleFormChange} className="grid gap-4">
          <h2 className="mb-1 text-sm font-semibold uppercase">Contact</h2>
          <label className={labelClass}>Email<input name="email" type="email" autoComplete="email" required className={fieldClass} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Full name<input name="fullName" autoComplete="name" required className={fieldClass} /></label>
            <label className={labelClass}>Phone<input name="phone" type="tel" autoComplete="tel" className={fieldClass} /></label>
          </div>

          <h2 className="mb-1 mt-4 text-sm font-semibold uppercase">Delivery Address</h2>
          <label className={labelClass}>Street address<input name="shippingAddress" autoComplete="street-address" required className={fieldClass} /></label>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>City<input name="shippingCity" autoComplete="address-level2" required className={fieldClass} /></label>
            <label className={labelClass}>State / Region<input name="shippingState" autoComplete="address-level1" className={fieldClass} /></label>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className={labelClass}>Postal code<input name="postalCode" autoComplete="postal-code" className={fieldClass} /></label>
            <label className={labelClass}>Country<input name="shippingCountry" autoComplete="country-name" required className={fieldClass} /></label>
          </div>

          <div className="mt-2 border border-line p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-semibold uppercase">Delivery Estimate</p>
                  <p className="mt-1 max-w-md text-sm leading-6 text-copy-muted">
                    {deliveryQuote ? `${deliveryQuote.methodName}: ${deliveryQuote.estimatedMinDays}-${deliveryQuote.estimatedMaxDays} business days${deliveryQuote.distanceKm ? `, approximately ${deliveryQuote.distanceKm} km` : ""}.` : "Enter your destination to calculate the applicable service and rate."}
                  </p>
                </div>
              </div>
              <button type="button" onClick={handleDeliveryQuote} disabled={quoteStatus.type === "loading" || !items.length} className="gold-focus inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 border border-copy px-4 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto">
                {quoteStatus.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Calculate
              </button>
            </div>
            {quoteStatus.type === "error" ? <p className="mt-3 text-sm font-medium text-wine">{quoteStatus.message}</p> : null}
            {deliveryQuote?.requiresManualReview ? <p className="mt-3 text-sm text-copy-muted">{deliveryQuote.note}</p> : null}
          </div>

          <label className={`${labelClass} mt-2`}>Voucher code<input name="voucherCode" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} autoComplete="off" className={fieldClass} /></label>
          {voucherApplied ? <p className="text-sm font-medium text-gold">100% testing voucher applied.</p> : null}

          <p className="text-xs leading-5 text-copy-muted">{DELIVERY_COPY}</p>
          <p className="text-xs leading-5 text-copy-muted">Prices are shown in {currency}. Final payment details are confirmed securely by Stripe.</p>
          {status.type === "error" ? <p className="text-sm font-medium text-wine">{status.message}</p> : null}
          <button type="submit" disabled={status.type === "loading" || !items.length || !deliveryQuote} className="gold-focus mt-2 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-45">
            {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {voucherApplied ? "Complete Test Order" : "Continue To Secure Payment"}
          </button>
        </form>

        <aside className="bg-surface-subtle p-5 sm:p-6 lg:sticky lg:top-[124px]">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-5 space-y-4">
            {items.length ? items.map((item) => (
              <div key={`${item.productSlug}-${item.size}-${item.colorName}`} className="grid grid-cols-[72px_1fr_auto] gap-3 border-b border-line pb-4">
                <div className="relative aspect-[4/5] overflow-hidden bg-page"><Image src={item.image} alt={item.name} fill sizes="72px" className="object-cover object-top" /></div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.name}</p>
                  <p className="mt-1 text-[10px] uppercase text-copy-muted">{PRODUCT_TYPE_LABEL} / {item.colorName} / {item.size} / Qty {item.quantity}</p>
                </div>
                <p className="text-xs font-medium">{money(PRODUCT_PRICES[currency] * item.quantity)}</p>
              </div>
            )) : <p className="text-sm leading-6 text-copy-muted">Your cart is empty. Add a complete outfit before checkout.</p>}
          </div>
          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between"><span className="text-copy-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-copy-muted">Delivery</span><span>{deliveryQuote ? money(shipping) : "Not Calculated"}</span></div>
            {voucherApplied ? <div className="flex justify-between"><span className="text-copy-muted">Testing voucher</span><span>-{money(discount)}</span></div> : null}
            <div className="flex justify-between border-t border-line pt-4 text-base font-semibold"><span>Total</span><span>{money(total)}</span></div>
          </div>
        </aside>
      </div>
    </>
  );
}
