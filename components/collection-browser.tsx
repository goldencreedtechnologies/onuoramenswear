import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollectionImageSwap } from "@/components/collection-image-swap";
import { ProductPrice } from "@/components/currency-provider";
import type { PhaseOneCollection } from "@/data/phase-one-collections";

export function CollectionBrowser({ sections }: { sections: PhaseOneCollection[] }) {
  return (
    <section className="py-10 md:py-16" aria-labelledby="permanent-collections-title">
      <div className="container-luxe">
        <header className="mb-9 max-w-2xl md:mb-12">
          <p className="text-[10px] font-semibold uppercase text-gold">Three Permanent Collections</p>
          <h2 id="permanent-collections-title" className="mt-3 text-3xl font-semibold md:text-4xl">
            One Philosophy, Three Ways To Dress.
          </h2>
          <p className="mt-4 text-sm leading-7 text-copy-muted">
            Each collection is built around one distinct form, with considered colour variants
            for different occasions. Choose the collection first, then select your colour and size.
          </p>
        </header>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-5">
          {sections.map((section, index) => (
            <article key={section.id} id={section.id} className="relative scroll-mt-32">
              <span id={section.legacyId} className="absolute -top-32" aria-hidden="true" />
              <Link
                href={section.href}
                className="collection-image-pair gold-focus group block"
                aria-label={`Explore ${section.title}`}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-surface-subtle">
                  <CollectionImageSwap
                    images={section.images}
                    alt={`${section.title} by ỌNUỌRA`}
                    sizes="(min-width: 1024px) 33vw, 100vw"
                    priority={index === 0}
                    className="object-contain object-center"
                  />
                  <span className="absolute bottom-3 right-3 grid h-10 w-10 place-items-center rounded-full bg-obsidian text-white transition group-hover:bg-gold group-hover:text-obsidian">
                    <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
                <div className="pt-5">
                  <p className="text-[10px] font-semibold uppercase text-gold">{section.eyebrow}</p>
                  <div className="mt-2 flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-2xl font-semibold">{section.title}</h3>
                      <p className="mt-2 max-w-sm text-sm leading-6 text-copy-muted">
                        {section.description}
                      </p>
                    </div>
                    <ProductPrice className="shrink-0 text-sm font-medium" />
                  </div>
                  <div className="mt-4 flex items-center justify-between gap-4 border-t border-line pt-4">
                    <div className="flex -space-x-1" aria-label={`${section.variants.length} available colours`}>
                      {section.variants.map((variant) => (
                        <span
                          key={variant.slug}
                          className="h-4 w-4 rounded-full border border-page ring-1 ring-copy/10"
                          style={{ backgroundColor: variant.colorValue }}
                          title={variant.color}
                        />
                      ))}
                    </div>
                    <span className="text-[9px] font-semibold uppercase text-copy-muted">
                      {section.variants.length} Colours
                    </span>
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
