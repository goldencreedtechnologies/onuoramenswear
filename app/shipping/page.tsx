import { Globe2, MapPin, PackageCheck } from "lucide-react";

export const metadata = {
  title: "Delivery",
  description: "ONUORA delivery rates, destination estimates, and dispatch information."
};

const deliveryOptions = [
  {
    icon: MapPin,
    title: "Lagos delivery",
    price: "Complimentary",
    copy: "Available for valid delivery addresses within Lagos."
  },
  {
    icon: PackageCheck,
    title: "Outside Lagos / one outfit",
    price: "$50",
    copy: "A destination estimate and delivery window are confirmed during checkout."
  },
  {
    icon: Globe2,
    title: "Outside Lagos / two or more",
    price: "$25",
    copy: "Reduced delivery applies automatically when the bag contains at least two outfits."
  }
];

export default function ShippingPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe py-12 md:py-16">
        <p className="text-[10px] font-semibold uppercase text-gold">Delivery</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          Clear rates. Destination-aware service.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-copy-muted">
          Enter the complete destination at checkout to receive the applicable delivery method,
          charge, and estimated window before payment.
        </p>
        <div className="mt-10 grid border-t border-line md:grid-cols-3">
          {deliveryOptions.map((option) => {
            const Icon = option.icon;
            return (
              <article
                key={option.title}
                className="border-b border-line py-7 md:border-b-0 md:border-r md:px-7 md:first:pl-0 md:last:border-r-0"
              >
                <Icon className="h-5 w-5 text-gold" />
                <h2 className="mt-5 text-sm font-semibold uppercase">{option.title}</h2>
                <p className="mt-3 text-2xl font-semibold">{option.price}</p>
                <p className="mt-3 text-sm leading-6 text-copy-muted">{option.copy}</p>
              </article>
            );
          })}
        </div>
        <div className="mt-12 max-w-3xl border-t border-line pt-7">
          <h2 className="text-lg font-semibold">Dispatch and tracking</h2>
          <p className="mt-3 text-sm leading-7 text-copy-muted">
            Orders are checked before dispatch. Tracking or delivery updates are sent to the email
            supplied at checkout. Unusual or remote routes may require manual confirmation by
            client care before fulfilment.
          </p>
        </div>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-2">
          {[
            {
              title: "Processing",
              copy:
                "Available garments are normally prepared after payment and inventory confirmation. Limited runs, high-volume periods, or additional quality checks may extend preparation; any material delay will be communicated."
            },
            {
              title: "Destination accuracy",
              copy:
                "The customer is responsible for a complete name, telephone number, street address, city, state, postal code, and country. Address changes cannot be guaranteed after fulfilment begins."
            },
            {
              title: "International duties",
              copy:
                "Import duties, taxes, brokerage, or local handling charges may be payable by the recipient unless checkout expressly states that they were collected. Local authorities determine these charges."
            },
            {
              title: "Missed or failed delivery",
              copy:
                "A carrier may require a signature or make a limited number of attempts. Re-delivery, storage, return-to-sender, or correction costs caused by an unavailable recipient or incorrect address may be charged."
            }
          ].map((item) => (
            <article key={item.title} className="bg-page p-6 md:p-8">
              <h2 className="text-base font-semibold">{item.title}</h2>
              <p className="mt-3 text-sm leading-7 text-copy-muted">{item.copy}</p>
            </article>
          ))}
        </div>
        <div className="mt-10 max-w-3xl border-t border-line pt-7">
          <h2 className="text-lg font-semibold">Timing and responsibility</h2>
          <p className="mt-3 text-sm leading-7 text-copy-muted">
            Delivery dates are estimates rather than guarantees. Delays caused by customs,
            weather, carrier disruption, access restrictions, or other circumstances outside
            reasonable control do not cancel an otherwise valid order. Contact Client Care
            promptly if tracking appears stalled or a parcel arrives damaged.
          </p>
        </div>
      </section>
    </main>
  );
}
