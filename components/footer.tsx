import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { NewsletterForm } from "@/components/newsletter-signup";

const shopLinks = [
  { href: "/collection/heritage", label: "Heritage Collection" },
  { href: "/collection/cowrie", label: "Cowrie Collection" },
  { href: "/collection/resort", label: "Resort Collection" }
];

const houseLinks = [
  { href: "/about", label: "Our Story" },
  { href: "/journal", label: "Journal" }
];

const serviceLinks = [
  { href: "/shipping", label: "Shipping & Delivery" },
  { href: "/returns", label: "Returns & Exchanges" },
  { href: "/contact", label: "Client Services" }
];

function LinkGroup({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div className="min-w-0">
      <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-soft">{title}</p>
      <div className="flex flex-col gap-2.5 text-sm text-white/66">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="w-fit transition hover:text-white">
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="w-full overflow-hidden bg-obsidian text-ivory">
      <div className="container-luxe grid min-w-0 gap-7 border-t border-white/10 py-9 sm:grid-cols-2 md:gap-8 lg:grid-cols-[1.1fr_0.65fr_0.65fr_0.8fr_1.25fr] lg:py-12">
        <div className="min-w-0">
          <Link href="/" className="inline-flex max-w-full" aria-label="ỌNUỌRA Home">
            <span className="relative block h-16 w-[190px] max-w-full overflow-hidden">
              <Image src="/brand/onuora-logo-gold.png" alt="ỌNUỌRA Menswear" fill sizes="190px" className="object-cover object-center" />
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">Contemporary African Menswear. Designed And Made In Nigeria.</p>
        </div>

        <LinkGroup title="SHOP" links={shopLinks} />
        <LinkGroup title="THE HOUSE" links={houseLinks} />
        <LinkGroup title="CLIENT SERVICES" links={serviceLinks} />

        <div className="min-w-0">
          <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-soft">JOIN THE ỌNUỌRA CIRCLE</p>
          <NewsletterForm />
          <div className="mt-5 flex items-center gap-6 text-white/58">
            <Link href="https://instagram.com/onuoramenswear" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:text-white"><Instagram className="h-5 w-5" /></Link>
            <Link href="mailto:orders@onuoramenswear.com" aria-label="Email" className="transition hover:text-white"><Mail className="h-5 w-5" /></Link>
            <Link href="/contact" aria-label="Client Services" className="transition hover:text-white"><MessageCircle className="h-5 w-5" /></Link>
          </div>
        </div>
      </div>

      <div className="container-luxe flex min-w-0 flex-col gap-3 border-t border-white/10 py-4 text-[9px] uppercase tracking-[0.06em] text-white/40 sm:flex-row sm:items-center sm:justify-between">
        <span>© 2026 ỌNUỌRA. Wear Your Identity.</span>
        <div className="flex flex-wrap gap-4">
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
          <Link href="/accessibility" className="hover:text-white">Accessibility</Link>
        </div>
      </div>
    </footer>
  );
}
