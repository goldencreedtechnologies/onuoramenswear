import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Instagram, Mail, MessageCircle } from "lucide-react";

const footerGroups = [
  {
    title: "Shop",
    links: [
      { href: "/collection#without-button", label: "New arrivals" },
      { href: "/collection#with-button", label: "With button" },
      { href: "/collection#original", label: "Original design" },
      { href: "/cart", label: "Shopping bag" }
    ]
  },
  {
    title: "Client care",
    links: [
      { href: "/contact", label: "Contact us" },
      { href: "/services", label: "Services" },
      { href: "/shipping", label: "Delivery" },
      { href: "/returns", label: "Returns & exchanges" },
      { href: "/account", label: "My account" }
    ]
  },
  {
    title: "The house",
    links: [
      { href: "/about", label: "Our heritage" },
      { href: "/journal", label: "Journal" },
      { href: "/contact", label: "ONUORA Circle" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="container-luxe grid gap-10 border-t border-white/10 py-12 lg:grid-cols-[1.25fr_repeat(3,0.7fr)] lg:py-16">
        <div>
          <Link href="/" className="inline-flex" aria-label="ONUORA home">
            <span className="relative block h-20 w-[220px] overflow-hidden">
              <Image
                src="/brand/onuora-logo-gold.png"
                alt="ONUORA Menswear"
                fill
                sizes="220px"
                className="object-cover object-center"
              />
            </span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-6 text-white/55">
            Modern stretch menswear, made with African craft for a global wardrobe.
          </p>
          <form action="/contact" method="get" className="mt-7 flex max-w-md border-b border-white/35">
            <label className="sr-only" htmlFor="footer-email">
              Email address
            </label>
            <input
              id="footer-email"
              name="email"
              type="email"
              placeholder="Email for private previews"
              className="min-h-12 flex-1 bg-transparent pr-4 text-sm text-white outline-none placeholder:text-white/40"
            />
            <button
              type="submit"
              className="gold-focus inline-flex h-12 w-12 items-center justify-center text-gold"
              aria-label="Join ONUORA Circle"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
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
          © 2026 ONUORA. Wear the story of your people.
        </span>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-3 text-[10px] uppercase tracking-[0.06em] text-white/48">
          <Link href="/privacy" className="transition hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-white">
            Terms
          </Link>
          <Link href="/accessibility" className="transition hover:text-white">
            Accessibility
          </Link>
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
          <Link href="/contact" aria-label="Client care" className="transition hover:text-white">
            <MessageCircle className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
