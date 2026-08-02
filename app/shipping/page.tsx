import Link from "next/link";
import { Globe2, MapPin, PackageCheck, RotateCcw } from "lucide-react";

export const metadata = {
  title: "Delivery",
  description: "ỌNUỌRA dispatch, delivery times, shipping costs, and returns information."
};

const deliveryDetails = [
  {
    icon: PackageCheck,
    title: "Dispatch",
    copy: "Every order is prepared for dispatch within three working days. Once dispatched, tracking details are sent by email."
  },
  {
    icon: MapPin,
    title: "Nigeria",
    copy: "Estimated delivery: 2–5 working days after dispatch."
  },
  {
    icon: Globe2,
    title: "International",
    copy: "Estimated delivery: approximately 7–8 working days after dispatch, depending on destination and customs processing."
  }
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe py-12 md:py-16">
        <p className="text-[10px] font-semibold uppercase text-gold">Delivery</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          Designed in Nigeria.<br />
          Delivered Worldwide.
        </h1>

        <div className="mt-10 grid border-t border-line md:grid-cols-3">
          {deliveryDetails.map((item) => {
            const Icon = item.icon;
            return (
              <article
                key={item.title}
                className="border-b border-line py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                <h2 className="mt-5 text-sm font-semibold uppercase">{item.title}</h2>
                <p className="mt-3 text-sm leading-7 text-copy-muted">{item.copy}</p>
              </article>
            );
          })}
        </div>

        <section className="mt-12 max-w-3xl border-t border-line pt-7" aria-labelledby="shipping-costs">
          <h2 id="shipping-costs" className="text-lg font-semibold">Shipping</h2>
          <p className="mt-3 text-sm leading-7 text-copy-muted">
            Shipping costs are calculated at checkout based on destination and quantity ordered.
          </p>
        </section>

        <section className="mt-10 max-w-3xl border-t border-line pt-7" aria-labelledby="returns-exchanges">
          <div className="flex items-center gap-3">
            <RotateCcw className="h-5 w-5 text-gold" aria-hidden="true" />
            <h2 id="returns-exchanges" className="text-lg font-semibold">Returns &amp; Exchanges</h2>
          </div>
          <p className="mt-3 text-sm leading-7 text-copy-muted">
            Items must be unworn, unused and returned in their original packaging. Please contact{" "}
            <Link href="/contact" className="gold-focus border-b border-copy/35 text-copy transition hover:border-gold">
              Client Services
            </Link>{" "}
            for the full returns and exchanges policy.
          </p>
        </section>
      </section>
    </main>
  );
}
