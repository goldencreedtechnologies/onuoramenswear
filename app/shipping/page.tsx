import Link from "next/link";

export const metadata = {
  title: "Delivery",
  description: "ỌNUỌRA dispatch, delivery times, shipping costs, tracking and customs information."
};

const internationalRates = [
  { outfits: "1–2", usd: "$60", gbp: "£50", eur: "€55", ngn: "₦100,000" },
  { outfits: "3–4", usd: "$90", gbp: "£75", eur: "€80", ngn: "₦150,000" },
  { outfits: "5–6", usd: "$120", gbp: "£100", eur: "€110", ngn: "₦200,000" },
  { outfits: "7+", usd: "Manual quotation", gbp: "Manual quotation", eur: "Manual quotation", ngn: "Manual quotation" }
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen w-full overflow-hidden bg-page pt-[104px] text-copy">
      <section className="container-luxe min-w-0 py-10 sm:py-12 md:py-16">
        <p className="text-[10px] font-semibold uppercase text-gold">Delivery</p>
        <h1 className="mt-3 max-w-4xl text-3xl font-semibold leading-tight md:text-5xl">
          Delivery Across Nigeria and Worldwide
        </h1>
        <p className="mt-5 max-w-3xl text-sm leading-7 text-copy-muted">
          Every ỌNUỌRA order is prepared, inspected and packaged before dispatch. Your available delivery service and final shipping charge are shown at checkout after you enter your complete delivery address.
        </p>

        <div className="mt-10 grid min-w-0 gap-9 md:mt-12 md:gap-10">
          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="dispatch">
            <h2 id="dispatch" className="text-xl font-semibold">Prepared for Dispatch Within Three Working Days</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              Available garments are prepared for dispatch within three working days following payment and inventory confirmation. Orders placed at weekends or on public holidays begin processing on the next working day. Where an unexpected delay occurs, we will contact you directly.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="nigeria-delivery">
            <h2 id="nigeria-delivery" className="text-xl font-semibold">Delivery Within Nigeria</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              Tracked delivery is available throughout Nigeria. A flat delivery fee of ₦15,000 applies to online orders of up to six outfits. The estimated delivery window is shown during checkout.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="international-delivery">
            <h2 id="international-delivery" className="text-xl font-semibold">International Delivery</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              Tracked delivery is available to the United Kingdom, United States, Canada, Europe and selected destinations worldwide. International shipping is charged according to the number of outfits ordered.
            </p>

            <div className="mt-6 grid gap-3 sm:hidden" aria-label="International delivery rates">
              {internationalRates.map((rate) => (
                <article key={rate.outfits} className="min-w-0 border border-line bg-page p-4">
                  <p className="text-[10px] font-semibold uppercase text-gold">{rate.outfits} outfits</p>
                  <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div><dt className="text-[9px] uppercase text-copy-muted">USD</dt><dd className="mt-1 break-words font-semibold">{rate.usd}</dd></div>
                    <div><dt className="text-[9px] uppercase text-copy-muted">GBP</dt><dd className="mt-1 break-words font-semibold">{rate.gbp}</dd></div>
                    <div><dt className="text-[9px] uppercase text-copy-muted">EUR</dt><dd className="mt-1 break-words font-semibold">{rate.eur}</dd></div>
                    <div><dt className="text-[9px] uppercase text-copy-muted">NGN Display</dt><dd className="mt-1 break-words font-semibold">{rate.ngn}</dd></div>
                  </dl>
                </article>
              ))}
            </div>

            <div className="mt-6 hidden max-w-full overflow-x-auto border border-line sm:block">
              <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                <thead className="bg-surface-subtle text-[10px] uppercase text-copy-muted">
                  <tr>
                    <th className="border-b border-line px-4 py-4">Outfits</th>
                    <th className="border-b border-line px-4 py-4">USD</th>
                    <th className="border-b border-line px-4 py-4">GBP</th>
                    <th className="border-b border-line px-4 py-4">EUR</th>
                    <th className="border-b border-line px-4 py-4">NGN Display</th>
                  </tr>
                </thead>
                <tbody>
                  {internationalRates.map((rate) => (
                    <tr key={rate.outfits} className="border-b border-line last:border-b-0">
                      <td className="px-4 py-4 font-semibold">{rate.outfits}</td>
                      <td className="px-4 py-4">{rate.usd}</td>
                      <td className="px-4 py-4">{rate.gbp}</td>
                      <td className="px-4 py-4">{rate.eur}</td>
                      <td className="px-4 py-4">{rate.ngn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-sm leading-7 text-copy-muted">
              Orders of seven outfits or more require a delivery quotation from Client Care.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="delivery-estimates">
            <h2 id="delivery-estimates" className="text-xl font-semibold">Delivery Estimates</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              International delivery commonly takes approximately seven to eight working days after dispatch. Delivery may arrive sooner, but timing depends on destination, customs processing and courier operations. All delivery dates are estimates rather than guarantees.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="grouped-rates">
            <h2 id="grouped-rates" className="text-xl font-semibold">Why Rates Are Grouped</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              Shipping several outfits together usually provides better value than sending them separately. Up to two outfits can travel within the first shipping band, while larger orders move into the next parcel band.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="tracking">
            <h2 id="tracking" className="text-xl font-semibold">Tracking</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              Once your order has been dispatched, tracking details will be sent to the email address supplied during checkout.
            </p>
          </section>

          <section className="min-w-0 border-t border-line pt-7" aria-labelledby="customs">
            <h2 id="customs" className="text-xl font-semibold">Customs</h2>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-copy-muted">
              International orders may be subject to import duties, taxes or courier handling charges determined by the destination country. Where these are not collected during checkout, they remain the recipient&apos;s responsibility.
            </p>
          </section>
        </div>

        <Link href="/contact?enquiry=large-order-delivery-quote" className="gold-focus mt-10 inline-flex min-h-12 max-w-full items-center justify-center border border-copy px-5 text-center text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white">
          Request a Delivery Quote
        </Link>
      </section>
    </main>
  );
}
