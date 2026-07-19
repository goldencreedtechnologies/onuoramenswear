import Link from "next/link";
import Image from "next/image";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { Cta } from "@/components/cta";

export function Footer() {
  return (
    <footer className="bg-obsidian text-ivory">
      <div className="container-luxe grid gap-5 border-t border-gold/20 py-16 md:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link href="/" className="inline-flex">
            <Image src="/brand/onuora-logo-gold.png" alt="Onuora Menswear" width={220} height={96} className="h-24 w-auto object-contain" />
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-7 text-ivory/62">
            Modern African stretch tailoring. Handmade in Nigeria, designed for global movement.
          </p>
        </div>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">House</p>
          <div className="flex flex-col gap-3 text-sm text-ivory/70">
            <Link href="/about">Heritage</Link>
            <Link href="/collections">Collections</Link>
            <Link href="/journal">Journal</Link>
            <Link href="/contact">Contact</Link>
          </div>
        </div>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Client Care</p>
          <div className="flex flex-col gap-3 text-sm text-ivory/70">
            <Link href="/shipping">Shipping</Link>
            <Link href="/returns">Returns</Link>
            <Link href="/checkout">Checkout</Link>
            <Link href="/account">Account</Link>
          </div>
        </div>
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Onuora Circle</p>
          <p className="mb-5 text-sm leading-7 text-ivory/62">Early access, private styling notes, and limited drop previews.</p>
          <Cta href="/contact" variant="ghost">Join the Circle</Cta>
          <div className="mt-6 flex gap-3 text-ivory/70">
            <Instagram className="h-5 w-5" />
            <Mail className="h-5 w-5" />
            <MessageCircle className="h-5 w-5" />
          </div>
        </div>
      </div>
      <div className="container-luxe flex flex-col gap-3 border-t border-gold/15 py-6 text-xs text-ivory/45 md:flex-row md:items-center md:justify-between">
        <span>© 2026 Onuora. Wear the story of your people.</span>
        <span>Privacy · Terms · Accessibility</span>
      </div>
    </footer>
  );
}
