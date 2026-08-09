"use client";

import Image from "next/image";
import Link from "next/link";
import { Loader2, LockKeyhole, MapPin } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useCurrency } from "@/components/currency-provider";
import { ShippingRatesModal } from "@/components/shipping-rates-modal";
import {
  DELIVERY_COPY,
  PRODUCT_PRICES,
  PRODUCT_TYPE_LABEL,
  formatCurrency,
  promotionDiscountForQuantity
} from "@/data/site-config";
import { phaseOneCollections, type PhaseOneCollectionProduct } from "@/data/phase-one-collections";
import { resolveShippingRule } from "@/lib/commerce/shipping-rules";
import { addCartItem, cartSubtotal, readCart, type CartItem } from "@/lib/cart";

type OrderStatus = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };
type QuoteStatus = { type: "idle" } | { type: "loading" } | { type: "error"; message: string };

type DeliveryQuote = {
  id?: string;
  methodName: string;
  estimatedMinDays: number;
  estimatedMaxDays: number;
  distanceKm: number | null;
  requiresManualReview: boolean;
  note: string;
};

const TEST_VOUCHER_CODE = "ONUORA-TEST-100";
const TEST_VOUCHER_ENABLED = process.env.NEXT_PUBLIC_ENABLE_TEST_CHECKOUT_VOUCHER === "true";
const SHIPPING_COUNTRY_KEY = "onuora-shipping-country";
const deliveryFields = new Set(["shippingAddress", "shippingCity", "shippingState", "postalCode", "shippingCountry"]);
const fieldClass = "gold-focus min-h-12 w-full border border-line bg-page px-4 text-sm font-normal normal-case text-copy outline-none transition placeholder:text-copy-muted/60 hover:border-line-strong focus:border-copy";
const labelClass = "grid gap-2 text-[10px] font-semibold uppercase text-copy";

function ordinal(value: number) {
  const remainder = value % 100;
  if (remainder >= 11 && remainder <= 13) return `${value}th`;
  if (value % 10 === 1) return `${value}st`;
  if (value % 10 === 2) return `${value}nd`;
  if (value % 10 === 3) return `${value}rd`;
  return `${value}th`;
}

function wardrobeProgressMessage(outfitCount: number) {
  if (outfitCount <= 0) return "Add your first complete outfit to begin building your wardrobe.";
  if (outfitCount === 1) return "Your second outfit ships within the same delivery band. Add another outfit to make better use of your shipping.";

  const nextReward = Math.ceil((outfitCount + 1) / 3) * 3;
  const positionInGroup = outfitCount % 3;

  if (positionInGroup === 0) {
    return `Your wardrobe offer has been applied. Add another two outfits to unlock 50% off your ${ordinal(outfitCount + 3)} outfit.`;
  }
  if (positionInGroup === 1) {
    return "Add one more outfit to move closer to your next wardrobe reward.";
  }
  if (outfitCount === 2) {
    return "Complete your wardrobe. Your third outfit is now 50% off.";
  }
  return `One more outfit and your ${ordinal(nextReward)} outfit will be 50% off.`;
}

type WardrobeUpsellProps = {
  items: CartItem[];
  outfitCount: number;
  onAdd: (product: PhaseOneCollectionProduct, collectionName: string) => void;
};

function WardrobeUpsell({ items, outfitCount, onAdd }: WardrobeUpsellProps) {
  const [selectedProducts, setSelectedProducts] = useState<Record<string, string>>(() =>
    Object.fromEntries(phaseOneCollections.map((collection) => [collection.id, collection.products[0]?.id ?? ""]))
  );
  const [announcement, setAnnouncement] = useState("");

  return (
    <section className="relative isolate overflow-hidden rounded-[1.5rem] border border-[#d8c9aa]/70 bg-[#f8f3e9] p-5 shadow-[0_20px_50px_rgba(42,32,19,0.06)] sm:p-6" aria-labelledby="complete-your-wardrobe">
      <span aria-hidden="true" className="pointer-events-none absolute -right-9 -top-14 -z-10 select-none text-[12rem] font-semibold leading-none text-[#8d6b2e]/[0.035]">Ọ</span>
      <span aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-[34%] -z-10 rotate-[-12deg] select-none text-[10rem] font-semibold leading-none text-[#8d6b2e]/[0.025]">Ọ</span>
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">A Considered Addition</p>
      <h2 id="complete-your-wardrobe" className="mt-2 text-xl font-semibold">Complete Your Wardrobe</h2>
      <p className="mt-2 text-sm leading-6 text-copy-muted">{wardrobeProgressMessage(outfitCount)}</p>
      <div className="mt-6 grid gap-4">
        {phaseOneCollections.map((collection) => {
          const selectedProduct = collection.products.find((product) => product.id === selectedProducts[collection.id]) ?? collection.products[0];
          if (!selectedProduct) return null;

          return (
            <article key={collection.id} className="grid min-w-0 grid-cols-[88px_1fr] gap-4 rounded-xl border border-[#dfd4bf] bg-white/70 p-3 shadow-[0_10px_24px_rgba(42,32,19,0.035)]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-lg bg-surface-subtle">
                <Image src={selectedProduct.images.front} alt={`${collection.title}, ${selectedProduct.color}`} fill sizes="88px" className="object-cover object-top" />
              </div>
              <div className="flex min-w-0 flex-col justify-between gap-3">
                <h3 className="text-xs font-semibold uppercase">{collection.title}</h3>
                <div className="flex flex-wrap gap-1" role="group" aria-label={`${collection.title} colour selection`}>
                  {collection.products.map((product) => {
                    const selected = product.id === selectedProduct.id;
                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => setSelectedProducts((current) => ({ ...current, [collection.id]: product.id }))}
                        className={`gold-focus grid h-8 w-8 place-items-center rounded-full border ${selected ? "border-gold" : "border-transparent"}`}
                        aria-label={`Show ${product.color} ${collection.title}`}
                        aria-pressed={selected}
                        title={product.color}
                      >
                        <span className="block h-4 w-4 rounded-full border border-black/15" style={{ backgroundColor: product.colorValue }} />
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  disabled={!items.length}
                  onClick={() => {
                    onAdd(selectedProduct, collection.title);
                    setAnnouncement(`${selectedProduct.color} ${collection.title} added to your bag.`);
                  }}
                  className="gold-focus inline-flex min-h-11 w-full items-center justify-center rounded-lg bg-obsidian px-4 text-[10px] font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-45"
                  aria-label={`Add ${selectedProduct.color} ${collection.title} to bag`}
                >
                  Add to Bag
                </button>
              </div>
            </article>
          );
        })}
      </div>
      <p className="sr-only" aria-live="polite">{announcement}</p>
    </section>
  );
}

export function CheckoutClient() {
  const [items, setItems] = useState<CartItem[]>([]);
  const { currency } = useCurrency();
  const [status, setStatus] = useState<OrderStatus>({ type: "idle" });
  const [quoteStatus, setQuoteStatus] = useState<QuoteStatus>({ type: "idle" });
  const [deliveryQuote, setDeliveryQuote] = useState<DeliveryQuote | null>(null);
  const [voucherCode, setVoucherCode] = useState("");
  const [shippingCountry, setShippingCountry] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const subtotalUsd = useMemo(() => cartSubtotal(items), [items]);
  const itemCount = useMemo(() => items.reduce((total, item) => total + item.quantity, 0), [items]);
  const subtotal = PRODUCT_PRICES[currency] * itemCount;
  const wardrobeDiscount = promotionDiscountForQuantity(itemCount, currency);
  const shippingRule = shippingCountry ? resolveShippingRule({ shippingCountry, itemCount, currency }) : null;
  const shipping = shippingRule?.displayCurrency === currency ? shippingRule.displayAmount ?? 0 : 0;
  const voucherApplied = TEST_VOUCHER_ENABLED && voucherCode.trim().toUpperCase() === TEST_VOUCHER_CODE;
  const discount = voucherApplied ? subtotal - wardrobeDiscount + shipping : wardrobeDiscount;
  const total = subtotal + shipping - discount;
  const money = (amount: number) => formatCurrency(currency, amount);

  useEffect(() => {
    const syncCart = () => setItems(readCart().items);
    syncCart();
    const savedCountry = window.localStorage.getItem(SHIPPING_COUNTRY_KEY) ?? "";
    setShippingCountry(savedCountry);
    window.addEventListener("storage", syncCart);
    window.addEventListener("onuora-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("onuora-cart-updated", syncCart);
    };
  }, []);

  function handleFormChange(event: React.FormEvent<HTMLFormElement>) {
    const target = event.target as HTMLInputElement;
    if (target.name === "shippingCountry") {
      const country = target.value;
      setShippingCountry(country);
      window.localStorage.setItem(SHIPPING_COUNTRY_KEY, country);
    }
    if (deliveryQuote && deliveryFields.has(target.name)) {
      setDeliveryQuote(null);
      setQuoteStatus({ type: "idle" });
    }
  }

  function addWardrobeOutfit(product: PhaseOneCollectionProduct, collectionName: string) {
    const size = items[0]?.size;
    if (!size) return;

    const next = addCartItem({
      productSlug: product.id,
      name: collectionName,
      edition: product.color,
      image: product.images.front,
      colorName: product.color,
      colorValue: product.colorValue,
      size,
      quantity: 1,
      unitPriceUsd: product.prices.USD
    });
    setItems(next.items);
    setDeliveryQuote(null);
    setQuoteStatus({ type: "idle" });
    setStatus({ type: "idle" });
  }

  async function handleDeliveryQuote() {
    if (!formRef.current) return;
    if (itemCount >= 7) {
      setQuoteStatus({ type: "error", message: "Please contact Client Care for a delivery quotation on orders of seven outfits or more." });
      return;
    }
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
      setQuoteStatus({ type: "error", message: "Add your address, city and country to calculate delivery." });
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
      setQuoteStatus({ type: "error", message: result?.error ?? "Unable to calculate delivery right now." });
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
    if (itemCount >= 7 || shippingRule?.requiresManualQuote) {
      setStatus({ type: "error", message: "Please request a delivery quotation before checking out with seven outfits or more." });
      return;
    }
    if (!deliveryQuote || !shippingRule) {
      setStatus({ type: "error", message: "Enter your complete delivery address and calculate delivery before continuing." });
      return;
    }
    if (shippingRule.displayCurrency !== currency) {
      setStatus({ type: "error", message: "Delivery within Nigeria is charged in NGN. Select NGN before continuing." });
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
        <form id="checkout-form" ref={formRef} onSubmit={handleSubmit} onChange={handleFormChange} className="grid gap-4">
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
            <label className={labelClass}>Country<input name="shippingCountry" defaultValue={shippingCountry} autoComplete="country-name" required className={fieldClass} /></label>
          </div>

          <div className="mt-2 border border-line p-4 sm:p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-semibold uppercase">Delivery Estimate</p>
                  <p className="mt-1 max-w-md text-sm leading-6 text-copy-muted">
                    {itemCount >= 7
                      ? "Please contact Client Care for a delivery quotation on orders of seven outfits or more."
                      : deliveryQuote
                        ? `${deliveryQuote.estimatedMinDays}-${deliveryQuote.estimatedMaxDays} business days. ${deliveryQuote.note}`
                        : "Enter your complete delivery address to calculate the applicable service and rate."}
                  </p>
                </div>
              </div>
              {itemCount >= 7 ? (
                <Link href="/contact?enquiry=large-order-delivery-quote" className="gold-focus inline-flex min-h-12 w-full shrink-0 items-center justify-center border border-copy px-4 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white sm:w-auto">Request a Delivery Quote</Link>
              ) : (
                <button type="button" onClick={handleDeliveryQuote} disabled={quoteStatus.type === "loading" || !items.length} className="gold-focus inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 border border-copy px-4 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white disabled:cursor-not-allowed disabled:opacity-45 sm:w-auto">
                  {quoteStatus.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Calculate
                </button>
              )}
            </div>
            {quoteStatus.type === "error" ? <p className="mt-3 text-sm font-medium text-wine">{quoteStatus.message}</p> : null}
          </div>

          <label className={`${labelClass} mt-2`}>Voucher code<input name="voucherCode" value={voucherCode} onChange={(event) => setVoucherCode(event.target.value)} autoComplete="off" className={fieldClass} /></label>
          {voucherApplied ? <p className="text-sm font-medium text-gold">100% testing voucher applied.</p> : null}

          <p className="text-xs leading-5 text-copy-muted">{DELIVERY_COPY}</p>
          <p className="text-xs leading-5 text-copy-muted">Prices are shown in {currency}. Final payment details are confirmed securely by Stripe.</p>
        </form>

        <div className="grid min-w-0 gap-4 lg:sticky lg:top-[124px]">
        <WardrobeUpsell items={items} outfitCount={itemCount} onAdd={addWardrobeOutfit} />
        <aside className="bg-surface-subtle p-5 sm:p-6">
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
            {wardrobeDiscount > 0 ? <div className="flex justify-between"><span className="text-copy-muted">Wardrobe Discount</span><span>-{money(wardrobeDiscount)}</span></div> : null}
            <div className="flex items-start justify-between gap-5 border-t border-line pt-4">
              <div>
                <p className="text-sm text-copy-muted">Shopping</p>
                <ShippingRatesModal triggerLabel="View Delivery Rates" triggerClassName="gold-focus mt-1 inline-flex border-b border-copy-muted/30 text-[9px] font-medium text-copy-muted transition hover:border-gold hover:text-copy" />
              </div>
              <span>{!shippingRule ? "Calculated after address" : shippingRule.requiresManualQuote ? "Manual quotation" : formatCurrency(shippingRule.displayCurrency, shippingRule.displayAmount ?? 0)}</span>
            </div>
            {voucherApplied ? <div className="flex justify-between"><span className="text-copy-muted">Testing voucher</span><span>-{money(subtotal - wardrobeDiscount + shipping)}</span></div> : null}
            <div className="flex justify-between border-t border-line pt-4 text-base font-semibold"><span>Total</span><span>{shippingRule?.requiresManualQuote ? "Quotation required" : money(total)}</span></div>
          </div>
          {status.type === "error" ? <p className="mt-4 text-sm font-medium text-wine">{status.message}</p> : null}
          <button form="checkout-form" type="submit" disabled={status.type === "loading" || !items.length || !deliveryQuote || itemCount >= 7} className="gold-focus mt-5 inline-flex min-h-14 w-full items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian disabled:cursor-not-allowed disabled:opacity-45">
            {status.type === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {voucherApplied ? "Complete Test Order" : "Continue To Secure Payment"}
          </button>
        </aside>
        </div>
      </div>
    </>
  );
}
