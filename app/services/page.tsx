import Link from "next/link";
import {
  ArrowRight,
  CircleUserRound,
  Globe2,
  MessageCircle,
  PackageCheck,
  Ruler,
  Sparkles
} from "lucide-react";

export const metadata = {
  title: "Client Services",
  description: "ỌNUỌRA styling, sizing, delivery, order, and private client services."
};

const services = [
  {
    id: "sizing",
    icon: Ruler,
    title: "Fit & sizing",
    copy: "Personal guidance across stretch fit, chest, waist, trouser length, and the silhouette best suited to your preference."
  },
  {
    id: "styling",
    icon: Sparkles,
    title: "Private styling",
    copy: "Occasion-led advice on colour, edition, footwear, and building a considered ỌNUỌRA wardrobe."
  },
  {
    id: "care",
    icon: PackageCheck,
    title: "Order & garment care",
    copy: "Support with garment care, order status, exchanges, garment condition, fulfilment, and post-purchase questions."
  },
  {
    id: "delivery",
    icon: Globe2,
    title: "Global delivery",
    copy: "Destination guidance, delivery estimates, customs context, and tracked service across the UK, USA, Europe, and worldwide."
  },
  {
    id: "circle",
    icon: CircleUserRound,
    title: "ỌNUỌRA Circle",
    copy: "Private previews, early collection access, fit notes, and considered communication from the house."
  },
  {
    id: "contact",
    icon: MessageCircle,
    title: "Concierge enquiry",
    copy: "A direct route for gifting, group orders, press, partnerships, and requests that need a human response."
  }
];

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <header className="border-b border-line">
        <div className="container-luxe grid gap-7 py-12 md:grid-cols-[1fr_0.7fr] md:items-end md:py-16">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">Client services</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Considered service, before and after the garment.
            </h1>
          </div>
          <p className="text-sm leading-7 text-copy-muted">
            Speak with the house for a more personal path through fit, styling, delivery, and
            ownership.
          </p>
        </div>
      </header>
      <section className="container-luxe grid border-b border-line sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service) => {
          const Icon = service.icon;
          return (
            <article
              key={service.title}
              id={service.id}
              className="scroll-mt-28 border-b border-line py-8 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-r lg:[&:nth-child(3n)]:border-r-0"
            >
              <Icon className="h-5 w-5 text-gold" />
              <h2 className="mt-5 text-sm font-semibold uppercase">{service.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-copy-muted">{service.copy}</p>
            </article>
          );
        })}
      </section>
      <section className="container-luxe flex flex-col gap-6 py-12 sm:flex-row sm:items-end sm:justify-between md:py-16">
        <div>
          <p className="text-[10px] font-semibold uppercase text-gold">Begin a conversation</p>
          <h2 className="mt-3 max-w-xl text-2xl font-semibold sm:text-3xl">
            Tell us where you are going. We will help you arrive well.
          </h2>
        </div>
        <Link
          href="/contact"
          className="gold-focus inline-flex min-h-11 shrink-0 items-center justify-center gap-3 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
        >
          Contact the house
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
