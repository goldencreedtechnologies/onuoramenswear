"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

const internationalRates = [
  { outfits: "1–2", usd: "$60", gbp: "£50", eur: "€55", ngn: "₦100,000" },
  { outfits: "3–4", usd: "$90", gbp: "£75", eur: "€80", ngn: "₦150,000" },
  { outfits: "5–6", usd: "$120", gbp: "£100", eur: "€110", ngn: "₦200,000" },
  { outfits: "7+", manualQuotation: true }
];

type ShippingRatesModalProps = {
  triggerLabel?: string;
  triggerClassName?: string;
};

export function ShippingRatesModal({
  triggerLabel = "View Delivery Rates",
  triggerClassName = "gold-focus mt-3 inline-flex border-b border-copy/35 text-[10px] font-semibold uppercase text-copy transition hover:border-gold"
}: ShippingRatesModalProps = {}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={triggerClassName}>
        {triggerLabel}
      </button>
      {open ? (
        <div className="fixed inset-0 z-[170] grid place-items-center overscroll-none bg-black/62 p-3 backdrop-blur-sm sm:p-4" role="dialog" aria-modal="true" aria-label="Shipping and delivery rates" onMouseDown={(event) => { if (event.currentTarget === event.target) setOpen(false); }}>
          <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto overscroll-contain bg-page p-5 text-copy shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-5 border-b border-line pb-5">
              <div>
                <p className="text-[10px] font-semibold uppercase text-gold">Shipping & Delivery</p>
                <h2 className="mt-2 text-2xl font-semibold md:text-3xl">Worldwide Shipping Rates</h2>
              </div>
              <button type="button" onClick={() => setOpen(false)} className="gold-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full hover:bg-surface-subtle" aria-label="Close shipping rates"><X className="h-5 w-5" /></button>
            </div>

            <div className="mt-6 grid gap-6 text-sm leading-7 text-copy-muted">
              <section>
                <h3 className="font-semibold text-copy">Prepared for Dispatch Within Three Working Days</h3>
                <p className="mt-2">Available garments are prepared for dispatch within 3 working days following payment and inventory confirmation.</p>
              </section>
              <section className="border-t border-line pt-5">
                <h3 className="font-semibold text-copy">Shipping & Delivery Within Nigeria</h3>
                <p className="mt-2">Tracked delivery is available throughout Nigeria. A flat shipping fee of ₦15,000 applies to online orders of up to six outfits.</p>
              </section>
              <section className="border-t border-line pt-5">
                <h3 className="font-semibold text-copy">International Shipping & Delivery</h3>
                <p className="mt-2">Tracked delivery is available to the United Kingdom, United States, Canada, Europe and selected destinations worldwide.</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {internationalRates.map((rate) => (
                    <article key={rate.outfits} className="border border-line p-4">
                      <p className="text-[10px] font-semibold uppercase text-gold">{rate.outfits} outfits</p>
                      {"manualQuotation" in rate ? (
                        <div className="mt-3"><p className="font-semibold text-copy">Manual Quotation</p></div>
                      ) : (
                        <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
                          <div><dt className="text-copy-muted">USD</dt><dd className="font-semibold text-copy">{rate.usd}</dd></div>
                          <div><dt className="text-copy-muted">GBP</dt><dd className="font-semibold text-copy">{rate.gbp}</dd></div>
                          <div><dt className="text-copy-muted">EUR</dt><dd className="font-semibold text-copy">{rate.eur}</dd></div>
                          <div><dt className="text-copy-muted">NGN</dt><dd className="font-semibold text-copy">{rate.ngn}</dd></div>
                        </dl>
                      )}
                    </article>
                  ))}
                </div>
              </section>
              <section className="border-t border-line pt-5">
                <h3 className="font-semibold text-copy">Tracking, Estimates & Customs</h3>
                <p className="mt-2">International delivery commonly takes 6–8 days after dispatch. Tracking is sent by email. Import duties, taxes or courier handling charges remain the recipient&apos;s responsibility where not collected at checkout.</p>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
