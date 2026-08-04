import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { newArrivalsPromotion } from "@/data/phase-one-collections";

export const metadata = {
  title: "Client Care",
  description: "Contact ỌNUỌRA for sizing, styling, orders, delivery, and membership support."
};

const inputClass =
  "gold-focus min-h-12 border border-line bg-page px-4 text-sm font-normal normal-case text-copy outline-none transition focus:border-copy";

type ContactPageProps = {
  searchParams: Promise<{ enquiry?: string }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { enquiry } = await searchParams;
  const largeOrderSelected = enquiry === "large-order-delivery-quote";

  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe grid gap-12 py-12 md:grid-cols-[0.75fr_1.25fr] md:py-16">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gold">Client care</p>
          <h1 className="mt-3 max-w-md text-3xl font-semibold leading-tight md:text-4xl">We are here to help you arrive well.</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-copy-muted">Speak with the house about sizing, delivery, styling, existing orders, or ỌNUỌRA Circle access.</p>
          <div className="mt-8 border-t border-line">
            <a href="mailto:orders@onuoramenswear.com" className="gold-focus flex items-center gap-3 border-b border-line py-4 text-sm hover:text-gold"><Mail className="h-4 w-4" />orders@onuoramenswear.com</a>
            <a href="mailto:orders@onuoramenswear.com?subject=Styling%20consultation" className="gold-focus flex items-center gap-3 border-b border-line py-4 text-sm hover:text-gold"><MessageCircle className="h-4 w-4" />Request a styling consultation</a>
          </div>
        </div>

        <form action="mailto:orders@onuoramenswear.com" method="post" encType="text/plain" className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-[10px] font-semibold uppercase">Name<input name="name" autoComplete="name" required className={inputClass} /></label>
            <label className="grid gap-2 text-[10px] font-semibold uppercase">Email<input name="email" type="email" autoComplete="email" required className={inputClass} /></label>
          </div>
          <label className="grid gap-2 text-[10px] font-semibold uppercase">Phone<input name="phone" type="tel" autoComplete="tel" className={inputClass} /></label>
          <label className="grid gap-2 text-[10px] font-semibold uppercase">
            Enquiry
            <select name="enquiry" defaultValue={largeOrderSelected ? "Large Order / Delivery Quote" : "Product and sizing"} className={inputClass}>
              <option>Product and sizing</option>
              <option>Order support</option>
              <option>Delivery</option>
              <option>Large Order / Delivery Quote</option>
              <option>Styling</option>
              <option>ỌNUỌRA Circle</option>
            </select>
          </label>
          <label className="grid gap-2 text-[10px] font-semibold uppercase">Message<textarea name="message" required className={`${inputClass} min-h-40 py-4`} /></label>
          <button type="submit" className="gold-focus min-h-12 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian">Send enquiry</button>
          <p className="text-xs leading-5 text-copy-muted">Sending opens your email application with the enquiry details prepared.</p>
        </form>
      </section>
      <section className="border-t border-line bg-panel-muted">
        <div className="container-luxe grid gap-7 py-10 md:grid-cols-[260px_1fr_auto] md:items-center md:py-12">
          <div className="relative aspect-[4/3] overflow-hidden bg-[#f3f0e9]">
            <Image src="/brand/products/button/ndb3/ndb3-angle.webp" alt="ỌNUỌRA burgundy buttoned new arrival" fill sizes="260px" className="object-cover" />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">{newArrivalsPromotion.title}</p>
            <h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight">{newArrivalsPromotion.offer}</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-copy-muted">{newArrivalsPromotion.explanation}</p>
          </div>
          <Link href="/collection" className="gold-focus inline-flex min-h-11 items-center justify-center gap-3 border border-copy px-5 text-xs font-semibold uppercase transition hover:bg-copy hover:text-white">
            Shop All Collections
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
