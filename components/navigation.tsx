"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, Menu, Search, ShoppingBag, UserRound, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { CurrencySelector, useCurrency } from "@/components/currency-provider";
import { products } from "@/data/catalog";
import { announcementCopy, fixedProductPriceLabel, getCollectionByFamily } from "@/data/site-config";
import { readCart } from "@/lib/cart";
import { cn } from "@/lib/cn";

const permanentCollectionLinks = [
  { href: "/collection#original", igbo: "Nkwọ", english: "Heritage Collection" },
  { href: "/collection#with-button", igbo: "Ọzọ", english: "Cowrie Collection" },
  { href: "/collection#without-button", igbo: "Uzọ", english: "Resort Collection" }
];

const mobileLinks = [
  { href: "/collection", label: "Shop" },
  { href: "/collection#collections", label: "Collections" },
  { href: "/journal", label: "Journal" },
  { href: "/about", label: "Our Story" }
];

function BrandLogo() {
  return (
    <Image
      src="/brand/onuora-logo-horizontal.png"
      alt="ỌNUỌRA Menswear"
      width={260}
      height={82}
      className="h-9 w-auto object-contain md:h-10"
      priority
    />
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { currency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collectionsOpen, setCollectionsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const collectionsButtonRef = useRef<HTMLButtonElement>(null);
  const collectionsPanelRef = useRef<HTMLDivElement>(null);
  const isHome = pathname === "/";

  function closeMenus() {
    setMobileOpen(false);
    setCollectionsOpen(false);
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!collectionsOpen) return;

    const closeOnScroll = () => setCollectionsOpen(false);
    const closeOnPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        collectionsButtonRef.current?.contains(target) ||
        collectionsPanelRef.current?.contains(target)
      ) {
        return;
      }
      setCollectionsOpen(false);
    };

    window.addEventListener("scroll", closeOnScroll, { passive: true });
    document.addEventListener("pointerdown", closeOnPointerDown);
    return () => {
      window.removeEventListener("scroll", closeOnScroll);
      document.removeEventListener("pointerdown", closeOnPointerDown);
    };
  }, [collectionsOpen]);

  useEffect(() => {
    const syncCart = () => {
      setCartCount(readCart().items.reduce((total, item) => total + item.quantity, 0));
    };

    syncCart();
    window.addEventListener("storage", syncCart);
    window.addEventListener("onuora-cart-updated", syncCart);
    return () => {
      window.removeEventListener("storage", syncCart);
      window.removeEventListener("onuora-cart-updated", syncCart);
    };
  }, []);

  const searchResults = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return products.slice(0, 6);

    return products
      .filter((product) =>
        [
          product.name,
          product.edition,
          product.colorName,
          getCollectionByFamily(product.family).englishName,
          getCollectionByFamily(product.family).igboName
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      )
      .slice(0, 8);
  }, [query]);

  return (
    <header className={cn("inset-x-0 top-0 z-50", isHome ? "absolute" : "fixed")}>
      <div
        className={cn(
          "flex min-h-8 items-center justify-center px-3 py-1.5 text-center text-[8px] font-semibold uppercase tracking-[0.08em] sm:text-[9px] sm:tracking-[0.12em]",
          isHome ? "bg-transparent text-[#171717]" : "bg-obsidian text-ivory"
        )}
      >
        {announcementCopy(currency)}
      </div>

      <div className="mx-3 h-[68px] rounded-[14px] border border-white/55 bg-[#f7f3e8]/94 text-[#171717] shadow-[0_12px_36px_rgb(0_0_0/0.10)] backdrop-blur-xl sm:mx-5 lg:mx-7">
        <div className="flex h-full items-center justify-between gap-5 px-5 sm:px-7">
          <Link href="/" onClick={closeMenus} className="gold-focus -my-4 flex shrink-0 items-center" aria-label="ỌNUỌRA Home">
            <BrandLogo />
          </Link>

          <nav className="hidden h-full items-center gap-7 text-[10px] font-semibold uppercase tracking-[0.08em] lg:flex" aria-label="Main navigation">
            <Link href="/collection" className="primary-nav-link gold-focus">SHOP</Link>
            <button
              ref={collectionsButtonRef}
              type="button"
              onClick={() => setCollectionsOpen((value) => !value)}
              className="primary-nav-link gold-focus inline-flex h-full items-center gap-1.5"
              aria-expanded={collectionsOpen}
            >
              COLLECTIONS
              <ChevronDown className={cn("h-3.5 w-3.5 transition", collectionsOpen && "rotate-180")} />
            </button>
            <Link href="/journal" className="primary-nav-link gold-focus">JOURNAL</Link>
            <Link href="/about" className="primary-nav-link gold-focus">OUR STORY</Link>
            <Link href="/contact" className="primary-nav-link gold-focus">CLIENT SERVICES</Link>
          </nav>

          <div className="flex items-center gap-1.5">
            <CurrencySelector className="hidden sm:block" />
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setCollectionsOpen(false);
              }}
              className="gold-focus inline-flex h-10 w-10 items-center justify-center"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link href="/account" className="gold-focus hidden h-10 w-10 items-center justify-center sm:inline-flex" aria-label="Account">
              <UserRound className="h-[18px] w-[18px]" />
            </Link>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event("onuora-cart-open"))}
              className="gold-focus relative inline-flex h-10 w-10 items-center justify-center bg-gold text-obsidian transition hover:bg-obsidian hover:text-white"
              aria-label={`Open shopping bag with ${cartCount} items`}
            >
              <ShoppingBag className="h-[18px] w-[18px]" />
              {cartCount ? (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-obsidian px-1 text-[8px] font-bold text-white">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen((value) => !value);
                setCollectionsOpen(false);
                setSearchOpen(false);
              }}
              className="gold-focus inline-flex h-10 w-10 items-center justify-center lg:hidden"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {collectionsOpen ? (
        <div
          ref={collectionsPanelRef}
          onMouseLeave={() => setCollectionsOpen(false)}
          className="mx-7 mt-2 hidden overflow-hidden rounded-[14px] border border-line bg-page text-copy shadow-2xl shadow-black/10 lg:block"
        >
          <div className="container-luxe grid grid-cols-3 gap-8 py-8">
            {permanentCollectionLinks.map((link) => (
              <Link key={link.href} href={link.href} onClick={closeMenus} className="gold-focus border-b border-line pb-4 transition hover:border-gold">
                <span className="block text-[9px] font-semibold uppercase text-gold">{link.igbo}</span>
                <span className="mt-1 block text-base font-semibold">{link.english}</span>
              </Link>
            ))}
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="mx-3 mt-2 overflow-hidden rounded-[14px] border border-line bg-page text-copy shadow-xl shadow-black/10 sm:mx-5 lg:mx-7">
          <div className="container-luxe py-6">
            <div className="flex items-center border-b border-copy/30">
              <Search className="h-5 w-5 text-copy-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search products, collections or colours"
                className="min-h-14 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-copy-muted/70"
                aria-label="Search ỌNUỌRA"
              />
              <button type="button" onClick={() => setSearchOpen(false)} className="gold-focus inline-flex h-10 w-10 items-center justify-center" aria-label="Close search">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {searchResults.map((product) => (
                <Link key={product.slug} href={`/products/${product.slug}`} onClick={closeMenus} className="group flex items-center gap-3 border-b border-copy/10 pb-3">
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-page">
                    <Image src={product.image} alt="" fill sizes="48px" className="object-cover" />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{product.name}</span>
                    <span className="mt-1 block text-[10px] uppercase text-copy-muted">
                      {product.colorName} · {fixedProductPriceLabel(currency)}
                    </span>
                  </span>
                </Link>
              ))}
              {!searchResults.length ? <p className="text-sm text-copy-muted">No products match that search.</p> : null}
            </div>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[100px] overflow-y-auto bg-page text-copy lg:hidden">
          <nav className="container-luxe flex min-h-full flex-col py-6" aria-label="Mobile navigation">
            <div className="mb-3 flex items-center justify-between border-b border-copy/12 pb-4">
              <span className="text-xs font-semibold uppercase">Currency</span>
              <CurrencySelector />
            </div>
            {mobileLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={closeMenus}
                className="gold-focus flex min-h-16 items-center justify-between border-b border-copy/12 text-base font-semibold uppercase tracking-[0.06em]"
              >
                {link.label}
                <span aria-hidden="true">→</span>
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
