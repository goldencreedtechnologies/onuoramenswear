"use client";

import Link from "next/link";
import Image from "next/image";
import { Menu, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { Cta } from "@/components/cta";
import { ThemeToggle } from "@/components/theme-toggle";

const links = [
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "Heritage" },
  { href: "/journal", label: "Journal" },
  { href: "/contact", label: "Contact" }
];

export function Navigation() {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-gold/10 bg-transparent px-0">
      <div className="glass-nav flex h-16 w-full items-center justify-between px-4 backdrop-blur-[2px] md:h-[72px] md:px-10">
        <Link href="/" className="gold-focus flex items-center gap-3">
          <Image
            src="/brand/onuora-logo-horizontal.png"
            alt="Onuora Menswear"
            width={260}
            height={82}
            className="theme-logo-light h-9 w-auto object-contain md:h-11"
            priority
          />
          <Image
            src="/brand/onuora-logo-gold.png"
            alt="Onuora Menswear"
            width={260}
            height={260}
            className="theme-logo-dark h-[156px] w-auto object-contain md:h-[228px]"
            priority
          />
        </Link>
        <nav className="hidden items-center gap-5 text-[11px] font-bold uppercase tracking-[0] text-copy md:flex" aria-label="Main navigation">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="gold-focus nav-link transition hover:text-gold">
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeToggle />
          <Link href="/cart" className="group gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gold text-obsidian shadow-lg shadow-black/20 transition hover:bg-obsidian hover:text-ivory">
            <ShoppingBag className="h-4 w-4 text-current transition group-hover:text-ivory" />
          </Link>
          <Cta href="/collections" className="min-h-10 px-4">Shop</Cta>
        </div>
        <button
          className="gold-focus inline-flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-gold text-obsidian shadow-lg shadow-black/20 transition hover:bg-obsidian hover:text-ivory md:hidden"
          onClick={() => setOpen((value) => !value)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-5 w-5 text-current transition" /> : <Menu className="h-5 w-5 text-current transition" />}
        </button>
      </div>
      {open ? (
        <div className="mx-3 mt-2 rounded-[26px] border border-gold/20 bg-panel p-5 shadow-2xl shadow-black/10 md:hidden">
          <nav className="flex flex-col gap-5 text-sm font-bold uppercase tracking-[0]" aria-label="Mobile navigation">
            {links.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-copy-muted">
              {link.label}
            </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className="text-copy-muted">
              Cart
            </Link>
            <ThemeToggle />
            <Cta href="/collections">Shop the collection</Cta>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
