import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Ruler, Scissors } from "lucide-react";
import { CollectionImageSwap } from "@/components/collection-image-swap";
import { HomepageHero } from "@/components/homepage-hero";
import { LimitedOfferCarousel } from "@/components/limited-offer-carousel";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { homepageCollectionCards } from "@/data/phase-one-collections";
import { getStoreProducts } from "@/lib/backend/catalog";

const craftsmanshipSignals = [
  {
    icon: BadgeCheck,
    title: "Every Detail Has A Purpose",
    copy: "Considered construction, precise finishing and a clear design language."
  },
  {
    icon: Ruler,
    title: "Tailored Fit",
    copy: "Balanced proportions for a composed, contemporary silhouette."
  },
  {
    icon: BadgeCheck,
    title: "Signature Cowries",
    copy: "A distinctive ỌNUỌRA detail inspired by African heritage."
  },
  {
    icon: Scissors,
    title: "Crafted In Nigeria",
    copy: "Designed and finished by skilled local artisans."
  }
];

const featuredSlugs = ["aja", "ndb2", "ndb3", "ijeoma"];

const featuredImageOverrides: Record<
  string,
  { primary: string; secondary: string }
> = {
  aja: {
    primary: "/brand/products/original/aja/aja-front.png",
    secondary: "/brand/products/original/aja/aja-side.png"
  },
  ndb2: {
    primary: "/brand/products/button/ndb2/ndb2-angle.png",
    secondary: "/brand/products/button/ndb2/ndb2-front.png"
  },
  ndb3: {
    primary: "/brand/products/button/ndb3/ndb3-angle.png",
    secondary: "/brand/products/button/ndb3/ndb3-front.png"
  },
  ijeoma: {
    primary: "/brand/products/original/ijeoma/ijeoma-front.png",
    secondary: "/brand/products/original/ijeoma/ijeoma-mid.png"
  }
};

export default async function HomePage() {
  const products = await getStoreProducts();
  const featured = featuredSlugs
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));
  const selectedProducts = featured.length === 4 ? featured : products.slice(0, 4);

  return (
    <main className="bg-page text-copy">
      <HomepageHero />

      <section className="bg-[#f4eee6] pb-10 pt-9 md:py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="THE PERMANENT COLLECTIONS"
            title="Three Collections. One Philosophy."
            copy="Three distinct expressions of contemporary African menswear designed for different occasions."
            href="/collection"
            linkLabel="Explore All"
            className="mb-4 md:mb-7"
          />
          <div className="grid auto-rows-fr gap-3 sm:grid-cols-3 md:gap-5">
            {homepageCollectionCards.map((collection, index) => (
              <Link
                key={collection.id}
                href={collection.href}
                data-collection={collection.id}
                className="collection-image-pair home-collection-card gold-focus group relative flex h-full min-h-[440px] flex-col overflow-hidden bg-[#f4eee6] sm:aspect-[4/5] sm:min-h-0"
              >
                <CollectionImageSwap
                  images={collection.images}
                  alt={`${collection.eyebrow}: ${collection.title}`}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  priority={index === 0}
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/82 via-black/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex min-h-[160px] flex-col justify-end p-5 text-white">
                  <p className="text-[9px] font-semibold uppercase text-gold-soft">
                    {collection.eyebrow}
                  </p>
                  <h2 className="mt-1.5 text-xl font-semibold">{collection.title}</h2>
                  <span className="mt-5 inline-flex min-h-11 w-full items-center justify-between border border-white/55 px-4 text-[10px] font-semibold uppercase transition group-hover:bg-white group-hover:text-black sm:w-[170px]">
                    Explore Collection
                    <ArrowRight className="h-4 w-4 shrink-0 transition group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LimitedOfferCarousel />

      <section className="py-12 md:py-20">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="SELECTED PIECES"
            title="From the Permanent Collections"
            href="/collection"
            linkLabel="Explore All"
          />
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
            {selectedProducts.map((product, index) => {
              const imageOverride = featuredImageOverrides[product.slug];
              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  priority={index < 2}
                  visualVariant="july29"
                  collectionOnly
                  imageOverride={imageOverride?.primary}
                  secondaryImageOverride={imageOverride?.secondary}
                />
              );
            })}
          </div>
        </div>
      </section>

      <section
        className="py-16 md:py-28"
        style={{
          background:
            "linear-gradient(180deg, rgba(245,230,200,0) 0%, rgba(245,230,200,0.78) 18%, rgba(245,230,200,0.78) 82%, rgba(245,230,200,0) 100%)"
        }}
      >
        <div className="container-luxe grid gap-7 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="relative aspect-[16/11] overflow-hidden bg-surface-subtle">
            <Image
              src="/brand/hero.jpg"
              alt="The ỌNUỌRA house wearing contemporary menswear in Lagos"
              fill
              quality={94}
              sizes="(min-width: 1024px) 58vw, 100vw"
              className="object-cover object-[50%_18%]"
            />
          </div>
          <div className="max-w-lg lg:pl-8">
            <p className="text-[10px] font-semibold uppercase text-gold">The House</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Designed In Nigeria. Worn Worldwide.
            </h2>
            <p className="mt-4 text-sm leading-7 text-copy-muted">
              ỌNUỌRA creates contemporary menswear rooted in African identity, combining thoughtful design and precise Nigerian craftsmanship.
            </p>
            <Link
              href="/about"
              className="gold-focus mt-6 inline-flex items-center gap-2 border-b border-copy/40 pb-1 text-[10px] font-semibold uppercase"
            >
              Learn Our Story
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="border-y border-line">
        <div className="container-luxe grid sm:grid-cols-2 lg:grid-cols-4">
          {craftsmanshipSignals.map((signal) => {
            const Icon = signal.icon;
            return (
              <div
                key={signal.title}
                className="border-b border-line py-6 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"
              >
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                <h3 className="mt-4 text-xs font-semibold uppercase">{signal.title}</h3>
                <p className="mt-2 text-xs leading-5 text-copy-muted">{signal.copy}</p>
              </div>
            );
          })}
        </div>
      </section>
    </main>
  );
}
