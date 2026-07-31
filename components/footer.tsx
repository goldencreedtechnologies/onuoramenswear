import Image from "next/image";
import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";

const permanentCollectionLinks = [
  { href: "/collection#original", igbo: "Nkwọ", english: "Heritage Collection" },
  { href: "/collection#with-button", igbo: "Ọzọ", english: "Cowrie Collection" },
  { href: "/collection#without-button", igbo: "Uzọ", english: "Resort Collection" }
];

const footerGroups = [
  {
    title: "Client Services",
    links: [
      { href: "/services#sizing", label: "Sizing" },
      { href: "/services#care", label: "Care" },
      { href: "/contact", label: "Contact" },
      { href: "/services#faq", label: "FAQ" },
      { href: "/account", label: "My Account" }
    ]
  },
  {
    title: "Orders & Policies",
    links: [
      { href: "/shipping", label: "Delivery" },
      { href: "/returns", label: "Returns & Exchanges" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/accessibility", label: "Accessibility" }
    ]
  },
  {
    title: "The House",
    links: [
      { href: "/about", label: "About" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "ỌNUỌRA Circle" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="container-luxe grid gap-10 border-t border-white/10 py-12 lg:grid-cols-[1.2fr_0.8fr_repeat(3,0.7fr)] lg:py-16">
        <div>
          <Link href="/" className="inline-flex" aria-label="ỌNUỌRA Home">
            <span className="relative block h-20 w-[220px] overflow-hidden">
              <Image
                src="/brand/onuora-logo-gold.png"
                alt="ỌNUỌRA Menswear"
                fill
                sizes="220px"
                className="object-cover object-center"
              />
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
            Contemporary African Menswear. Designed And Made In Nigeria For A Global Wardrobe.
          </p>
        </div>

        <div>
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-soft">
            Shop
          </p>
          <div className="flex flex-col gap-4">
            {permanentCollectionLinks.map((link) => (
              <Link key={link.href} href={link.href} className="group w-fit">
                <span className="block text-[9px] font-semibold uppercase tracking-[0.08em] text-gold-soft">
                  {link.igbo}
                </span>
                <span className="mt-0.5 block text-sm font-semibold text-white/72 transition group-hover:text-white">
                  {link.english}
                </span>
              </Link>
            ))}
            <Link href="/cart" className="w-fit text-sm text-white/62 transition hover:text-white">
              Shopping Bag
            </Link>
          </div>
        </div>

        {footerGroups.map((group) => (
          <div key={group.title}>
            <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.1em] text-gold-soft">
              {group.title}
            </p>
            <div className="flex flex-col gap-3 text-sm text-white/62">
              {group.links.map((link) => (
                <Link key={link.href} href={link.href} className="w-fit transition hover:text-white">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="container-luxe grid gap-5 border-t border-white/10 py-6 lg:grid-cols-[1fr_auto] lg:items-center">
        <span className="text-[10px] uppercase tracking-[0.06em] text-white/40">
          © 2026 ỌNUỌRA. Wear Your Identity.
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] uppercase tracking-[0.06em] text-white/48">
          <Link href="/contact" aria-label="Instagram" className="transition hover:text-white">
            <Instagram className="h-4 w-4" />
          </Link>
          <Link
            href="mailto:orders@onuoramenswear.com"
            aria-label="Email"
            className="transition hover:text-white"
          >
            <Mail className="h-4 w-4" />
          </Link>
          <Link href="/contact" aria-label="Client Services" className="transition hover:text-white">
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
