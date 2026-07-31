"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ProductPrice } from "@/components/currency-provider";
import type { PhaseOneCollectionProduct } from "@/data/phase-one-collections";
import { PRODUCT_INCLUSION_LABEL } from "@/data/site-config";

type CollectionSection = {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  products: PhaseOneCollectionProduct[];
};

type EditorialAsset = {
  productId: string;
  src: string;
  alt: string;
  className?: string;
};

type CollectionEditorialLayout = {
  heroSide: "left" | "right";
  hero: {
    productId: string;
    front: EditorialAsset;
    hover: EditorialAsset;
  };
  grid: EditorialAsset[];
};

const collectionLayouts: Record<string, CollectionEditorialLayout> = {
  original: {
    heroSide: "left",
    hero: {
      productId: "aja",
      front: {
        productId: "aja",
        src: "/brand/products/original/aja/aja-front.webp",
        alt: "AJA Heritage Collection full front view",
        className: "object-cover object-top"
      },
      hover: {
        productId: "aja",
        src: "/brand/products/original/aja/aja-original.png",
        alt: "AJA Heritage Collection original view",
        className: "object-cover object-top"
      }
    },
    grid: [
      {
        productId: "ebube",
        src: "/brand/products/original/ebube/ebube-back.webp",
        alt: "EBUBE Heritage Collection back view"
      },
      {
        productId: "aja",
        src: "/brand/products/original/aja/aja-mid.webp",
        alt: "AJA Heritage Collection mid view"
      },
      {
        productId: "ndu",
        src: "/brand/products/original/ndu/ndu-studio-idris-source.png",
        alt: "NDỤ Heritage Collection studio portrait"
      },
      {
        productId: "ohuru",
        src: "/brand/products/original/ohuru/ohuru-mid.webp",
        alt: "ỌHỤRỤ Heritage Collection mid view"
      }
    ]
  },
  "with-button": {
    heroSide: "right",
    hero: {
      productId: "ndb2",
      front: {
        productId: "ndb2",
        src: "/brand/products/button/ndb2/ndb2-studio-registered-source.png",
        alt: "NDB2 Cowrie Collection studio portrait",
        className: "object-cover object-top"
      },
      hover: {
        productId: "ndb2",
        src: "/brand/products/button/ndb2/ndb2-mid.webp",
        alt: "NDB2 Cowrie Collection mid view",
        className: "object-cover object-top"
      }
    },
    grid: [
      {
        productId: "ndb1",
        src: "/brand/products/button/ndb1/ndb1-back.webp",
        alt: "NDB1 Cowrie Collection back view"
      },
      {
        productId: "ndb3",
        src: "/brand/products/button/ndb3/ndb3-mid.webp",
        alt: "NDB3 Cowrie Collection mid view"
      },
      {
        productId: "ndb4",
        src: "/brand/products/button/ndb4/ndb4-angle.webp",
        alt: "NDB4 Cowrie Collection angle view"
      },
      {
        productId: "ndb5",
        src: "/brand/products/button/ndb5/ndb5-studio-registered-source.png",
        alt: "NDB5 Cowrie Collection studio portrait"
      }
    ]
  },
  "without-button": {
    heroSide: "left",
    hero: {
      productId: "nd5",
      front: {
        productId: "nd5",
        src: "/brand/products/buttonless/nd5/nd5-angle.webp",
        alt: "ND5 Resort Collection angle view",
        className: "object-cover object-top"
      },
      hover: {
        productId: "nd5",
        src: "/brand/products/buttonless/nd5/nd5-mid.webp",
        alt: "ND5 Resort Collection mid view",
        className: "object-cover object-top"
      }
    },
    grid: [
      {
        productId: "nd4",
        src: "/brand/products/buttonless/nd4/nd4-mid.webp",
        alt: "ND4 Resort Collection mid view"
      },
      {
        productId: "nd3",
        src: "/brand/products/buttonless/nd3/nd3-angle.webp",
        alt: "ND3 Resort Collection angle view"
      },
      {
        productId: "nd2",
        src: "/brand/products/buttonless/nd2/nd2-studio-registered-source.png",
        alt: "ND2 Resort Collection studio portrait"
      },
      {
        productId: "nd1",
        src: "/brand/products/buttonless/nd1/nd1-back.webp",
        alt: "ND1 Resort Collection back view"
      }
    ]
  }
};

function collectionProduct(section: CollectionSection, productId: string) {
  return section.products.find((product) => product.id === productId) ?? section.products[0];
}

function HeroProduct({
  section,
  layout,
  priority
}: {
  section: CollectionSection;
  layout: CollectionEditorialLayout;
  priority: boolean;
}) {
  const product = collectionProduct(section, layout.hero.productId);
  if (!product) return null;

  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f0ec]">
        <Image
          src={layout.hero.front.src}
          alt={layout.hero.front.alt}
          fill
          priority={priority}
          quality={92}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`transition duration-700 ease-out group-hover:opacity-0 ${layout.hero.front.className ?? "object-cover object-top"}`}
        />
        <Image
          src={layout.hero.hover.src}
          alt={layout.hero.hover.alt}
          fill
          quality={92}
          sizes="(min-width: 1024px) 50vw, 100vw"
          className={`opacity-0 transition duration-700 ease-out group-hover:opacity-100 ${layout.hero.hover.className ?? "object-cover object-top"}`}
        />
        <span className="absolute bottom-4 right-4 grid h-10 w-10 translate-y-2 place-items-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="pt-4">
        <ProductPrice className="text-base font-semibold text-copy" />
        <p className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.04em] text-copy-muted">
          {PRODUCT_INCLUSION_LABEL}
        </p>
      </div>
    </>
  );

  if (!product.href) {
    return <article className="group min-w-0">{content}</article>;
  }

  return (
    <Link
      href={product.href}
      className="gold-focus group block min-w-0"
      aria-label={`Explore ${section.title}`}
    >
      {content}
    </Link>
  );
}

function SupportingGrid({
  section,
  assets,
  priority
}: {
  section: CollectionSection;
  assets: EditorialAsset[];
  priority: boolean;
}) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {assets.map((asset, index) => {
          const product = collectionProduct(section, asset.productId);
          const image = (
            <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f0ec]">
              <Image
                src={asset.src}
                alt={asset.alt}
                fill
                priority={priority && index < 2}
                quality={90}
                sizes="(min-width: 1024px) 25vw, 50vw"
                className={`transition duration-700 ease-out group-hover:scale-[1.015] ${asset.className ?? "object-cover object-top"}`}
              />
            </div>
          );

          if (!product?.href) {
            return (
              <div key={asset.src} className="group min-w-0">
                {image}
              </div>
            );
          }

          return (
            <Link
              key={asset.src}
              href={product.href}
              className="gold-focus group block min-w-0"
              aria-label={`Explore ${section.title} detail`}
            >
              {image}
            </Link>
          );
        })}
      </div>
      <p className="mt-4 flex items-center gap-2 text-[9px] uppercase tracking-[0.05em] text-copy-muted/75">
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-gold" aria-hidden="true" />
        Available In Different Colours
      </p>
    </div>
  );
}

export function CollectionBrowser({ sections }: { sections: CollectionSection[] }) {
  return (
    <div className="overflow-hidden">
      {sections.map((section, sectionIndex) => {
        const layout = collectionLayouts[section.id];
        if (!layout) return null;

        const heroOrder = layout.heroSide === "right" ? "lg:order-2" : "lg:order-1";
        const gridOrder = layout.heroSide === "right" ? "lg:order-1" : "lg:order-2";

        return (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
            className="scroll-mt-[112px] border-b border-line py-12 md:py-16"
          >
            <div className="container-luxe">
              <header className="mb-7 max-w-2xl md:mb-9">
                <p className="text-[10px] font-semibold uppercase text-gold">{section.eyebrow}</p>
                <h2 id={`${section.id}-title`} className="mt-2 text-3xl font-semibold md:text-4xl">
                  {section.title}
                </h2>
                <p className="mt-3 text-sm leading-6 text-copy-muted">{section.description}</p>
              </header>

              <div className="grid gap-7 lg:grid-cols-2 lg:items-start lg:gap-6 xl:gap-8">
                <div className={heroOrder}>
                  <HeroProduct section={section} layout={layout} priority={sectionIndex === 0} />
                </div>
                <div className={gridOrder}>
                  <SupportingGrid
                    section={section}
                    assets={layout.grid}
                    priority={sectionIndex === 0}
                  />
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
