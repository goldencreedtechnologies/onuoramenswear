"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductPrice } from "@/components/currency-provider";
import type { PhaseOneCollectionProduct } from "@/data/phase-one-collections";
import { PRODUCT_INCLUSION_LABEL } from "@/data/site-config";

type CollectionSection = { id: string; eyebrow: string; title: string; description: string; products: PhaseOneCollectionProduct[] };
type EditorialAsset = { productId: string; src: string; alt: string; className?: string };
type CollectionLayout = { hero: { productId: string; front: EditorialAsset; hover: EditorialAsset }; grid: EditorialAsset[] };

const collectionLayouts: Record<string, CollectionLayout> = {
  original: {
    hero: {
      productId: "aja",
      front: { productId: "aja", src: "/brand/products/original/aja/aja-front.png", alt: "AJA Heritage Collection full outfit", className: "object-cover object-top" },
      hover: { productId: "aja", src: "/brand/products/original/aja/aja-side.png", alt: "AJA Heritage Collection side view", className: "object-cover object-top" }
    },
    grid: [
      { productId: "aja", src: "/brand/products/original/ndu/ndu-angle.png", alt: "NDỤ Heritage Collection angled outfit view" },
      { productId: "ijeoma", src: "/brand/products/original/ijeoma/ijeoma-detail.png", alt: "IJEỌMA Heritage Collection detail" },
      { productId: "nsuo", src: "/brand/products/original/nsuo/nsuo-lifestyle.png", alt: "NSỤO Heritage Collection lifestyle image" },
      { productId: "ebube", src: "/brand/products/original/ebube/ebube-mid.png", alt: "EBUBE Heritage Collection upper-body view" }
    ]
  },
  "with-button": {
    hero: {
      productId: "ndb2",
      front: { productId: "ndb2", src: "/brand/products/button/ndb2/ndb2-front.png", alt: "NDB2 Cowrie Collection full outfit", className: "object-cover object-top" },
      hover: { productId: "ndb2", src: "/brand/products/button/ndb2/ndb2-angle.png", alt: "NDB2 Cowrie Collection angled view", className: "object-cover object-top" }
    },
    grid: [
      { productId: "ndb4", src: "/brand/products/button/ndb4/ndb4-mid.png", alt: "NDB4 Cowrie Collection upper-body view" },
      { productId: "ndb2", src: "/brand/products/button/ndb2/nd2-detail.png", alt: "NDB2 Cowrie Collection detail" },
      { productId: "ndb5", src: "/brand/products/button/ndb5/nd5-lifestyle.png", alt: "NDB5 Cowrie Collection lifestyle image" },
      { productId: "ndb1", src: "/brand/products/button/ndb1/ndb1-angle.png", alt: "NDB1 Cowrie Collection angled view" }
    ]
  },
  "without-button": {
    hero: {
      productId: "nd3",
      front: { productId: "nd3", src: "/brand/products/buttonless/nd3/nd3-angle.png", alt: "ND3 Resort Collection angled outfit", className: "object-cover object-top" },
      hover: { productId: "nd3", src: "/brand/products/buttonless/nd3/nd3-back.png", alt: "ND3 Resort Collection back view", className: "object-cover object-top" }
    },
    grid: [
      { productId: "nd4", src: "/brand/products/buttonless/nd4/nd4-mid.png", alt: "ND4 Resort Collection upper-body view" },
      { productId: "nd3", src: "/brand/products/buttonless/nd3/nd3-detail.png", alt: "ND3 Resort Collection detail" },
      { productId: "nd1", src: "/brand/products/buttonless/nd1/nd1-lifestyle.png", alt: "ND1 Resort Collection lifestyle image" },
      { productId: "nd2", src: "/brand/products/buttonless/nd2/nd2-studio-registered-source.png", alt: "ND2 Resort Collection studio portrait" }
    ]
  }
};

function findProduct(section: CollectionSection, productId: string) {
  return section.products.find((product) => product.id === productId) ?? section.products[0];
}

function HeroProduct({ section, layout, priority }: { section: CollectionSection; layout: CollectionLayout; priority: boolean }) {
  const product = findProduct(section, layout.hero.productId);
  if (!product) return null;
  const content = <>
    <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f0ec]">
      <Image src={layout.hero.front.src} alt={layout.hero.front.alt} fill priority={priority} quality={94} sizes="(min-width: 1024px) 390px, (min-width: 768px) 36vw, 88vw" className={`transition duration-700 ease-out group-hover:opacity-0 ${layout.hero.front.className ?? "object-cover object-top"}`} />
      <Image src={layout.hero.hover.src} alt="" aria-hidden="true" fill quality={94} sizes="(min-width: 1024px) 390px, (min-width: 768px) 36vw, 88vw" className={`opacity-0 transition duration-700 ease-out group-hover:opacity-100 ${layout.hero.hover.className ?? "object-cover object-top"}`} />
      <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100"><ArrowUpRight className="h-4 w-4" aria-hidden="true" /></span>
    </div>
    <div className="pt-4"><p className="text-sm font-semibold text-copy md:text-base">{section.title}</p><ProductPrice className="mt-2 block text-xl font-bold leading-none text-copy md:text-2xl" /><p className="mt-2 text-[10px] font-medium uppercase tracking-[0.04em] text-copy-muted">{PRODUCT_INCLUSION_LABEL}</p></div>
  </>;
  if (!product.href) return <article className="group min-w-0">{content}</article>;
  return <Link href={product.href} className="gold-focus group block min-w-0" aria-label={`Explore ${section.title}`}>{content}</Link>;
}

function SupportingGrid({ section, assets, priority }: { section: CollectionSection; assets: EditorialAsset[]; priority: boolean }) {
  return <div className="min-w-0">
    <div className="grid min-w-0 grid-cols-2 gap-2.5 sm:gap-3.5">
      {assets.map((asset, index) => {
        const product = findProduct(section, asset.productId);
        const image = <div className="relative aspect-[4/5] min-w-0 overflow-hidden bg-[#f1f0ec]"><Image src={asset.src} alt={asset.alt} fill priority={priority && index < 2} quality={92} sizes="(min-width: 1024px) 250px, (min-width: 768px) 22vw, 45vw" className={`transition duration-700 ease-out group-hover:scale-[1.015] ${asset.className ?? "object-cover object-top"}`} /></div>;
        if (!product?.href) return <div key={asset.src} className="group min-w-0">{image}</div>;
        return <Link key={asset.src} href={product.href} className="gold-focus group block min-w-0" aria-label={`Explore ${section.title} detail`}>{image}</Link>;
      })}
    </div>
    <p className="mt-3 flex items-center gap-2 text-[9px] uppercase tracking-[0.05em] text-copy-muted/75"><span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />Available In Different Colours</p>
  </div>;
}

export function CollectionBrowser({ sections }: { sections: CollectionSection[] }) {
  return <div id="collections" className="w-full overflow-hidden">
    {sections.map((section, sectionIndex) => {
      const layout = collectionLayouts[section.id];
      if (!layout) return null;
      const monogramPosition = sectionIndex % 2 === 0 ? "-right-28 md:right-[1%]" : "-left-28 md:left-[1%]";
      return <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="relative isolate scroll-mt-[112px] overflow-hidden border-b border-line py-10 md:py-14">
        <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true"><div className="absolute left-1/2 top-[58%] h-[78%] w-[min(98%,1120px)] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(circle_at_center,rgba(245,230,200,0.24),rgba(245,230,200,0.09)_40%,transparent_72%)]" /><span className={`absolute top-[56%] -translate-y-1/2 select-none font-semibold leading-none ${monogramPosition}`} style={{ fontSize: "clamp(18rem,33vw,34rem)", color: "transparent", WebkitTextStroke: "1px rgba(101,67,33,0.11)" }}>Ọ</span></div>
        <div className="container-luxe relative z-10 min-w-0">
          <header className="mb-8 max-w-3xl md:mb-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.09em] text-gold">{section.eyebrow}</p>
            <h1 id={`${section.id}-title`} className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">{section.title}</h1>
            <p className="mt-4 max-w-2xl text-sm font-normal leading-7 text-copy-muted md:text-base md:leading-7">{section.description}</p>
          </header>
          <div className="mx-auto grid min-w-0 max-w-[1040px] gap-7 md:grid-cols-[minmax(300px,390px)_minmax(0,520px)] md:items-start md:justify-center md:gap-8 lg:gap-10">
            <div className="mx-auto w-full min-w-0 max-w-[390px] md:max-w-none"><HeroProduct section={section} layout={layout} priority={sectionIndex === 0} /></div>
            <div className="mx-auto w-full min-w-0 max-w-[500px] md:max-w-none"><SupportingGrid section={section} assets={layout.grid} priority={sectionIndex === 0} /></div>
          </div>
        </div>
      </section>;
    })}
  </div>;
}
