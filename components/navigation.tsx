"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRight,
  ChevronDown,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CurrencySelector, useCurrency } from "@/components/currency-provider";
import { products } from "@/data/catalog";
import { newArrivalsPromotion } from "@/data/phase-one-collections";
import { announcementCopy, fixedProductPriceLabel, getCollectionByFamily } from "@/data/site-config";
import { readCart } from "@/lib/cart";
import { cn } from "@/lib/cn";

type MegaMenu = "collections" | "contact" | null;

const desktopLinks = [
  { href: "/collection", label: "SHOP" },
  { href: "/about", label: "ABOUT" },
  { href: "/journal", label: "JOURNAL" }
];

const collectionGroups = [
  {
    title: "Permanent Collections",
    links: [
      { href: "/collection#original", label: "Heritage — Nkwọ" },
      { href: "/collection#with-button", label: "Cowrie — Ọzọ" },
      { href: "/collection#without-button", label: "Resort — Uzọ" },
      { href: "/collection", label: "View All Collections" }
    ]
  },
  {
    title: "House Originals",
    links: [
      { href: "/products/ebube", label: "EBUBE / Black" },
      { href: "/products/ndu", label: "NDỤ / Burgundy" },
      { href: "/products/ijeoma", label: "IJEỌMA / Blue" },
      { href: "/collection#original", label: "Explore Nkwọ" }
    ]
  }
];

const contactGroups = [
  {
    title: "Client Services",
    links: [
      { href: "/shipping", label: "Delivery" },
      { href: "/returns", label: "Returns" },
      { href: "/services#sizing", label: "Sizing" },
      { href: "/services#care", label: "Care" },
      { href: "/contact", label: "Contact" },
      { href: "/services#faq", label: "Frequently Asked Questions" }
    ]
  },
  {
    title: "Policies",
    links: [
      { href: "/shipping", label: "Delivery" },
      { href: "/returns", label: "Returns & Exchanges" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/accessibility", label: "Accessibility" }
    ]
  }
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

function PromotionCard({ closeMenus }: { closeMenus: () => void }) {
  return (
    <Link
      href={newArrivalsPromotion.href}
      onClick={closeMenus}
      className="group grid min-h-[210px] grid-cols-[120px_1fr] items-center gap-5 bg-panel-muted p-4"
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#f1eee7]">
        <Image
          src="/brand/products/button/ndb3/ndb3-studio-registered.webp"
          alt="ỌNUỌRA Burgundy Cowrie Collection Outfit"
          fill
          sizes="120px"
          className="object-cover transition duration-700 group-hover:scale-[1.025]"
        />
      </div>
      <div>
        <p className="text-[9px] font-bold uppercase text-gold">{newArrivalsPromotion.title}</p>
        <p className="mt-2 text-lg font-semibold leading-6">{newArrivalsPromotion.offer}</p>
        <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-bold uppercase">
          Shop The Offer
          <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

export function Navigation() {
  const pathname = usePathname();
  const { currency } = useCurrency();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [megaMenu, setMegaMenu] = useState<MegaMenu>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cartCount, setCartCount] = useState(0);
  const isHome = pathname === "/";

  function closeMenus() {
    setMobileOpen(false);
    setMegaMenu(null);
    setSearchOpen(false);
  }

  function toggleMegaMenu(menu: Exclude<MegaMenu, null>) {
    setMegaMenu((current) => (current === menu ? null : menu));
    setSearchOpen(false);
  }

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

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
    if (!normalizedQuery) {
      return products.slice(0, 6);
    }

    return products
      .filter((product) =>
        [
          product.name,
          product.edition,
          product.meaning,
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
          "flex h-8 items-center justify-center px-4 text-center text-[9px] font-semibold uppercase tracking-[0.12em]",
          isHome ? "bg-transparent text-[#171717]" : "bg-obsidian text-ivory"
        )}
      >
        {announcementCopy(currency)}
      </div>

      <div className="mx-3 h-[68px] rounded-[14px] border border-white/55 bg-[#f7f3e8]/94 text-[#171717] shadow-[0_12px_36px_rgb(0_0_0/0.10)] backdrop-blur-xl sm:mx-5 lg:mx-7">
        <div className="flex h-full items-center justify-between gap-5 px-5 sm:px-7">
          <Link
            href="/"
            onClick={closeMenus}
            className="gold-focus -my-4 flex shrink-0 items-center"
            aria-label="ỌNUỌRA Home"
          >
            <BrandLogo />
          </Link>

          <nav
            className="hidden h-full items-center gap-7 text-[10px] font-semibold uppercase tracking-[0.08em] lg:flex"
            aria-label="Main navigation"
          >
            <Link
              href={desktopLinks[0].href}
              onClick={closeMenus}
              className="primary-nav-link gold-focus"
            >
              {desktopLinks[0].label}
            </Link>
            <button
              type="button"
              onClick={() => toggleMegaMenu("collections")}
              className="primary-nav-link gold-focus inline-flex h-full items-center gap-1.5"
              aria-expanded={megaMenu === "collections"}
            >
              COLLECTIONS
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition",
                  megaMenu === "collections" && "rotate-180"
                )}
              />
            </button>
            {desktopLinks.slice(1).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={closeMenus}
                className="primary-nav-link gold-focus"
              >
                {link.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => toggleMegaMenu("contact")}
              className="primary-nav-link gold-focus inline-flex h-full items-center gap-1.5"
              aria-expanded={megaMenu === "contact"}
            >
              CLIENT SERVICES
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 transition",
                  megaMenu === "contact" && "rotate-180"
                )}
              />
            </button>
          </nav>

          <div className="flex items-center gap-1.5">
            <CurrencySelector className="hidden sm:block" />
            <button
              type="button"
              onClick={() => {
                setSearchOpen((value) => !value);
                setMegaMenu(null);
              }}
              className="gold-focus inline-flex h-10 w-10 items-center justify-center"
              aria-label="Search"
              aria-expanded={searchOpen}
            >
              <Search className="h-[18px] w-[18px]" />
            </button>
            <Link
              href="/account"
              className="gold-focus hidden h-10 w-10 items-center justify-center sm:inline-flex"
              aria-label="Account"
            >
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
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[8px] font-bold text-obsidian">
                  {cartCount}
                </span>
              ) : null}
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileOpen((value) => !value);
                setMegaMenu(null);
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

      {megaMenu ? (
        <div
          className="mx-7 mt-2 hidden overflow-hidden rounded-[14px] border border-line bg-page text-copy shadow-2xl shadow-black/10 lg:block"
          onMouseLeave={() => setMegaMenu(null)}
        >
          <div
            className={cn(
              "container-luxe grid gap-8 py-9",
              megaMenu === "collections"
                ? "grid-cols-[repeat(2,1fr)_1.35fr]"
                : "grid-cols-[repeat(2,0.75fr)_1.35fr]"
            )}
          >
            {(megaMenu === "collections" ? collectionGroups : contactGroups).map((group) => (
              <div key={group.title}>
                <p className="mb-5 text-[10px] font-bold uppercase text-copy-muted">
                  {group.title}
                </p>
                <div className="flex flex-col gap-3.5 text-sm">
                  {group.links.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={closeMenus}
                      className="w-fit border-b border-transparent pb-0.5 transition hover:border-gold hover:text-gold"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
            <PromotionCard closeMenus={closeMenus} />
          </div>
        </div>
      ) : null}

      {searchOpen ? (
        <div className="mx-3 mt-2 overflow-hidden rounded-[14px] border border-line bg-page text-copy shadow-xl shadow-black/10 sm:mx-5 lg:mx-7">
          <div className="container-luxe py-7">
            <div className="flex items-center border-b border-copy/30">
              <Search className="h-5 w-5 text-copy-muted" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search Products, Collections Or Colours"
                className="min-h-14 flex-1 bg-transparent px-4 text-base outline-none placeholder:text-copy-muted/70"
                aria-label="Search ỌNUỌRA"
              />
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="gold-focus inline-flex h-10 w-10 items-center justify-center"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {searchResults.map((product) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  onClick={closeMenus}
                  className="group flex items-center gap-3 border-b border-copy/10 pb-3"
                >
                  <span className="relative h-16 w-12 shrink-0 overflow-hidden bg-page">
                    <Image
                      src={product.image}
                      alt=""
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">{product.name}</span>
                    <span className="mt-1 block text-[10px] uppercase text-copy-muted">
                      {product.colorName} · {fixedProductPriceLabel(currency)}
                    </span>
                  </span>
                </Link>
              ))}
              {!searchResults.length ? (
                <p className="text-sm text-copy-muted">No products match that search.</p>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}

      {mobileOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-[100px] overflow-y-auto bg-page text-copy lg:hidden">
          <nav className="container-luxe flex min-h-full flex-col py-7" aria-label="Mobile navigation">
            <div className="flex flex-col border-t border-copy/12">
              <div className="mb-5 flex items-center justify-between border-b border-copy/12 pb-5">
                <span className="text-xs font-semibold uppercase">Currency</span>
                <CurrencySelector />
              </div>
              {[
                { href: "/collection", label: "SHOP" },
                { href: "/collection", label: "COLLECTIONS" },
                { href: "/about", label: "ABOUT" },
                { href: "/journal", label: "JOURNAL" },
                { href: "/services", label: "CLIENT SERVICES" },
                { href: "/account", label: "ACCOUNT" }
              ].map((link) => (
                <Link
                  key={`${link.href}-${link.label}`}
                  href={link.href}
                  onClick={closeMenus}
                  className="flex min-h-14 items-center justify-between border-b border-copy/12 text-sm font-semibold uppercase tracking-[0.06em]"
                >
                  {link.label}
                  <ArrowRight className="h-4 w-4 text-copy-muted" />
                </Link>
              ))}
            </div>
            <Link
              href={newArrivalsPromotion.href}
              onClick={closeMenus}
              className="mt-6 bg-panel-muted p-5"
            >
              <p className="text-[9px] font-bold uppercase text-gold">Current Offer</p>
              <p className="mt-2 text-lg font-semibold">{newArrivalsPromotion.offer}</p>
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
