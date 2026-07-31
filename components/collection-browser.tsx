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

type ProductView = "front" | "mid" | "angle" | "back";

type EditorialView = {
  productId: string;
  frontView: ProductView;
  hoverView: ProductView;
  frontClassName: string;
  hoverClassName: string;
};

const editorialViews: Record<string, EditorialView[]> = {
  original: [
    {
      productId: "aja",
      frontView: "front",
      hoverView: "back",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "ohuru",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_12%] scale-[1.38]",
      hoverClassName: "object-cover object-[50%_14%] scale-[1.34]"
    },
    {
      productId: "ndu",
      frontView: "angle",
      hoverView: "mid",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "ijeoma",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_78%] scale-[1.2]",
      hoverClassName: "object-cover object-[50%_76%] scale-[1.16]"
    },
    {
      productId: "ebube",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_24%]",
      hoverClassName: "object-cover object-[50%_20%]"
    }
  ],
  "with-button": [
    {
      productId: "ndb2",
      frontView: "front",
      hoverView: "back",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "ndb1",
      frontView: "mid",
      hoverView: "front",
      frontClassName: "object-cover object-[50%_10%] scale-[1.42]",
      hoverClassName: "object-cover object-[50%_16%] scale-[1.55]"
    },
    {
      productId: "ndb3",
      frontView: "angle",
      hoverView: "mid",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "ndb4",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_80%] scale-[1.18]",
      hoverClassName: "object-cover object-[50%_78%] scale-[1.15]"
    },
    {
      productId: "ndb5",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_22%]",
      hoverClassName: "object-cover object-[50%_18%]"
    }
  ],
  "without-button": [
    {
      productId: "nd3",
      frontView: "front",
      hoverView: "back",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "nd1",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_10%] scale-[1.4]",
      hoverClassName: "object-cover object-[50%_14%] scale-[1.34]"
    },
    {
      productId: "nd2",
      frontView: "angle",
      hoverView: "mid",
      frontClassName: "object-cover object-top",
      hoverClassName: "object-cover object-top"
    },
    {
      productId: "nd4",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_80%] scale-[1.18]",
      hoverClassName: "object-cover object-[50%_78%] scale-[1.15]"
    },
    {
      productId: "nd5",
      frontView: "mid",
      hoverView: "angle",
      frontClassName: "object-cover object-[50%_22%]",
      hoverClassName: "object-cover object-[50%_18%]"
    }
  ]
};

function productFolder(sectionId: string) {
  if (sectionId === "original") return "original";
  if (sectionId === "with-button") return "button";
  return "buttonless";
}

function productAsset(sectionId: string, productId: string, view: ProductView) {
  const folder = productFolder(sectionId);
  return `/brand/products/${folder}/${productId}/${productId}-${view}.webp`;
}

function EditorialProductView({
  section,
  view,
  priority
}: {
  section: CollectionSection;
  view: EditorialView;
  priority: boolean;
}) {
  const product =
    section.products.find((candidate) => candidate.id === view.productId) ?? section.products[0];

  if (!product) return null;

  const content = (
    <>
      <div className="relative aspect-[4/5] overflow-hidden bg-[#f1f0ec]">
        <Image
          src={productAsset(section.id, view.productId, view.frontView)}
          alt={`${section.title} editorial view`}
          fill
          priority={priority}
          quality={91}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 78vw"
          className={`transition duration-700 ease-out group-hover:opacity-0 ${view.frontClassName}`}
        />
        <Image
          src={productAsset(section.id, view.productId, view.hoverView)}
          alt=""
          aria-hidden="true"
          fill
          quality={91}
          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 25vw, 78vw"
          className={`opacity-0 transition duration-700 ease-out group-hover:opacity-100 ${view.hoverClassName}`}
        />
        <span className="absolute bottom-3 right-3 grid h-9 w-9 translate-y-2 place-items-center rounded-full bg-obsidian text-ivory opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>
      <div className="pt-3">
        <ProductPrice className="text-sm font-semibold text-copy" />
        <p className="mt-1 text-[10px] font-medium uppercase tracking-[0.04em] text-copy-muted">
          {PRODUCT_INCLUSION_LABEL}
        </p>
        <p className="mt-1 text-[9px] text-copy-muted/75">Available In Different Colours</p>
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

export function CollectionBrowser({ sections }: { sections: CollectionSection[] }) {
  return (
    <div className="overflow-hidden">
      {sections.map((section, sectionIndex) => {
        const views = editorialViews[section.id] ?? [];

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

              <div className="hide-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3 sm:gap-5 lg:grid lg:grid-cols-5 lg:overflow-visible lg:pb-0">
                {views.map((view, viewIndex) => (
                  <div
                    key={`${section.id}-${view.productId}-${view.frontView}`}
                    className="w-[78vw] shrink-0 snap-start sm:w-[42vw] md:w-[31vw] lg:w-auto"
                  >
                    <EditorialProductView
                      section={section}
                      view={view}
                      priority={sectionIndex === 0 && viewIndex < 3}
                    />
                  </div>
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
