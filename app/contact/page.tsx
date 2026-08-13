import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Mail, MessageCircle } from "lucide-react";
import { ContactForm } from "@/components/contact-form";
import { newArrivalsPromotion } from "@/data/phase-one-collections";

export const metadata = {
  title: "Client Services",
  description: "Contact ỌNUỌRA for sizing, styling, orders, shipping and delivery, and membership support."
};

const inputClass = "gold-focus min-h-12 w-full min-w-0 border border-line bg-page px-4 text-sm font-normal normal-case text-copy outline-none transition focus:border-copy";

type ContactPageProps = { searchParams: Promise<{ enquiry?: string }> };

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const { enquiry } = await searchParams;
  const defaultEnquiry = enquiry === "large-order-delivery-quote" ? "Large Order / Delivery Quote" : "Product and sizing";

  return (
    <main className="min-h-screen overflow-hidden bg-page pt-[104px] text-copy">
      <section className="container-luxe grid min-w-0 gap-12 py-12 md:grid-cols-[0.75fr_1.25fr] md:py-16">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-gold">Client Services</p>
          <h1 className="mt-3 max-w-md text-3xl font-semibold leading-tight md:text-4xl">Helping You Arrive Well</h1>
          <p className="mt-5 max-w-md text-sm leading-7 text-copy-muted">Speak with the house about sizing, shipping and delivery, styling, existing orders, or ỌNUỌRA Circle access.</p>
          <div className="mt-8 min-w-0 border-t border-line">
            <a href="mailto:menswear@onuoraenterprises.com" className="gold-focus flex min-w-0 items-center gap-3 break-all border-b border-line py-4 text-sm hover:text-gold"><Mail className="h-4 w-4 shrink-0" />menswear@onuoraenterprises.com</a>
            <a href="mailto:menswear@onuoraenterprises.com?subject=Styling%20consultation" className="gold-focus flex min-w-0 items-center gap-3 border-b border-line py-4 text-sm hover:text-gold"><MessageCircle className="h-4 w-4 shrink-0" />Request a styling consultation</a>
          </div>
        </div>

        <ContactForm defaultEnquiry={defaultEnquiry} inputClass={inputClass} />
      </section>
      <section className="border-t border-line bg-panel-muted">
        <div className="container-luxe grid min-w-0 gap-7 py-10 md:grid-cols-[260px_1fr_auto] md:items-center md:py-12">
          <div className="relative aspect-[4/3] min-w-0 overflow-hidden bg-[#f3f0e9]"><Image src="/brand/products/button/ndb3/ndb3-angle.png" alt="ỌNUỌRA burgundy Cowrie Collection outfit" fill sizes="260px" className="object-contain object-top" /></div>
          <div className="min-w-0"><p className="text-[10px] font-semibold uppercase text-gold">{newArrivalsPromotion.title}</p><h2 className="mt-2 max-w-2xl text-2xl font-semibold leading-tight">{newArrivalsPromotion.offer}</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-copy-muted">{newArrivalsPromotion.explanation}</p></div>
          <Link href="/collection" className="gold-focus inline-flex min-h-11 items-center justify-center gap-3 border border-copy px-5 text-xs font-semibold uppercase transition hover:bg-copy hover:text-white">Shop All Collections<ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </main>
  );
}
