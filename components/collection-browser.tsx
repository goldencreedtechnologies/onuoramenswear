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
};

type CollectionLayout = {
  hero: EditorialAsset;
  gallery: EditorialAsset[];
};

const collectionLayouts: Record<string, CollectionLayout> = {
  original: {
    hero: {
      productId: "aja",
      src: "/brand/products/original/aja/aja-front.webp",
      alt: "AJA Heritage Collection full outfit"
    },
    gallery: [
      {
        productId: "aja",
        src: "/brand/products/original/aja/aja-mid.webp",
        alt: "AJA Heritage Collection upper-body view"
      },
      {
        productId: "ebube",
        src: "/brand/products/original/ebube/ebube-back.webp",
        alt: "EBUBE Heritage Collection construction detail"
      },
      {
        productId: "ndu",
        src: "/brand/products/original/ndu/ndu-studio-idris-source.png",
        alt: "NDỤ Heritage Collection lifestyle portrait"
      },
      {
        productId: "ohuru",
        src: "/brand/products/original/ohuru/ohuru-mid.webp",
        alt: "Heritage Collection alternative colour"
      }
    ]
  },
  "with-button": {
    hero: {
      productId: "ndb2",
      src: "/brand/products/button/ndb2/ndb2-front.webp",
      alt: "NDB2 Cowrie Collection full outfit"
    },
    gallery: [
      {
        productId: "ndb2",
        src: "/brand/products/button/ndb2/ndb2-mid.webp",
        alt: "NDB2 Cowrie Collection upper-body view"
      },
      {
        productId: "ndb4",
        src: "/brand/products/button/ndb4/ndb4-angle.webp",
        alt: "Cowrie Collection signature detail"
      },
      {
        productId: "ndb5",
        src: "/brand/products/button/ndb5/ndb5-studio-registered-source.png",
        alt: "Cowrie Collection lifestyle portrait"
      },
      {
        productId: "ndb1",
        src: "/brand/products/button/ndb1/ndb1-back.webp",
        alt: "Cowrie Collection alternative colour"
      }
    ]
  },
  "without-button": {
    hero: {
      productId: "nd3",
      src: "/brand/products/buttonless/nd3/nd3-front.webp",
      alt: "ND3 Resort Collection full outfit"
    },
    gallery: [
      {
        productId: "nd4",
        src: "/brand/products/buttonless/nd4/nd4-mid.webp",
        alt: "Resort Collection upper-body view"
      },
      {
        productId: "nd3",
        src: "/brand/products/buttonless/nd3/nd3-angle.webp",
        alt: "Resort Collection construction detail"
      },
      {
        productId: "nd2",
        src: "/brand/products/buttonless/nd2/nd2-studio-registered-source.png",
        alt: "Resort Collection lifestyle portrait"
      },
      {
        productId: "nd1",
        src: "/brand/products/buttonless/nd1/nd1-back.webp",
        alt: "Resort Collection alternative colour"
      }
    ]
  }
};

function findProduct(section: CollectionSection, productId: string) {
  return section.products.find((product) => product.id === productId) ?? section.products[0];
}

function ImageLink({ section, asset, priority = false }: { section: CollectionSection; asset: EditorialAsset; priority?: boolean }) {
  const product = findProduct(section, asset.productId);
  const image = (
    <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f0ec]">
      <Image
        src={asset.src}
        alt={asset.alt}
        fill
        priority={priority}
        quality={92}
        sizes="(min-width: 768px) 34vw, 50vw"
        className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.015]"
      />
      <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
        <ArrowUpRight className="h-4 w-4" />
      </span>
    </div>
  );

  if (!product?.href) return <div className="group">{image}</div>;
  return (
    <Link href={product.href} className="gold-focus group block" aria-label={`Explore ${section.title}`}>
      {image}
    </Link>
  );
}

export function CollectionBrowser({ sections }: { sections: CollectionSection[] }) {
  return (
    <div id="collections">
      {sections.map((section, sectionIndex) => {
        const layout = collectionLayouts[section.id];
        if (!layout) return null;
        const heroProduct = findProduct(section, layout.hero.productId);

        return (
          <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="scroll-mt-[112px] border-b border-line py-10 md:py-16">
            <div className="container-luxe">
              <header className="mb-6 max-w-2xl md:mb-8">
                <p className="text-[10px] font-semibold uppercase text-gold">{section.eyebrow}</p>
                <h2 id={`${section.id}-title`} className="mt-2 text-3xl font-semibold md:text-4xl">{section.title}</h2>
                <p className="mt-3 text-sm leading-6 text-copy-muted">{section.description}</p>
              </header>

              <div className="grid gap-3 md:grid-cols-[0.9fr_1.1fr] md:gap-5">
                <div>
                  <ImageLink section={section} asset={layout.hero} priority={sectionIndex === 0} />
                  <div className="flex items-start justify-between gap-3 pt-3">
                    <div>
                      <p className="text-sm font-semibold">{section.title}</p>
                      <p className="mt-1 text-[10px] uppercase text-copy-muted">{PRODUCT_INCLUSION_LABEL}</p>
                    </div>
                    <ProductPrice className="text-lg font-semibold" />
                  </div>
                  {heroProduct?.href ? (
                    <Link href={heroProduct.href} className="gold-focus mt-4 inline-flex min-h-11 w-full items-center justify-between border border-copy px-4 text-[10px] font-semibold uppercase transition hover:bg-copy hover:text-white sm:w-[190px]">
                      Explore Collection
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  ) : null}
                </div>

                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  {layout.gallery.map((asset, index) => (
                    <ImageLink key={asset.src} section={section} asset={asset} priority={sectionIndex === 0 && index < 2} />
                  ))}
                </div>
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
