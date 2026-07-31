import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Ruler, Scissors } from "lucide-react";
import { CollectionImageSwap } from "@/components/collection-image-swap";
import { Cta } from "@/components/cta";
import { LimitedOfferCarousel } from "@/components/limited-offer-carousel";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { homepageCollectionCards } from "@/data/phase-one-collections";
import { getStoreProducts } from "@/lib/backend/catalog";

const craftsmanshipSignals = [
  {
    icon: BadgeCheck,
    title: "Every Detail Has A Purpose",
    copy: "",
    isHeading: true
  },
  {
    icon: Ruler,
    title: "Tailored Fit",
    copy: "Cut for comfort and effortless movement."
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

export default async function HomePage() {
  const products = await getStoreProducts();
  const originals = products.filter((product) => product.family === "original");

  return (
    <main className="bg-page text-copy">
      <section className="relative min-h-[min(680px,calc(100svh-56px))] overflow-hidden bg-[#f4eee6] text-[#171717] md:min-h-[min(820px,calc(100svh-72px))]">
        <Image
          src="/brand/main-hero.png"
          alt="Registered ỌNUỌRA models wearing the purple, forest and black two-piece outfits"
          fill
          priority
          quality={95}
          sizes="(max-width: 639px) 100vw, 1px"
          className="object-cover object-center sm:hidden"
        />
        <Image
          src="/brand/main-hero.png"
          alt=""
          aria-hidden="true"
          fill
          priority
          quality={95}
          sizes="(min-width: 640px) 100vw, 1px"
          className="hidden object-cover object-center sm:block"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,232,0)_0%,rgba(247,243,232,.12)_28%,rgba(247,243,232,.94)_48%,rgba(247,243,232,1)_100%)] sm:bg-[linear-gradient(90deg,rgba(247,243,232,.92)_0%,rgba(247,243,232,.56)_36%,rgba(247,243,232,0)_64%)]" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/70 to-transparent" />
        <div className="container-luxe relative flex min-h-[min(680px,calc(100svh-56px))] items-end pb-12 pt-32 md:min-h-[min(820px,calc(100svh-72px))] md:pb-16">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase text-[#9f751d]">Designed And Made In Nigeria</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.04] text-balance sm:text-5xl md:text-6xl">
              Contemporary African Menswear
            </h1>
            <p className="mt-4 max-w-md text-sm leading-6 text-black/68">
              Designed With Purpose. Crafted To Last.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Cta href="/collection" variant="dark">
                Shop Collections
              </Cta>
              <Cta href="/about" variant="ghost">
                Our Story
              </Cta>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] py-12 md:py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Collections"
            title="The Permanent Collections."
            href="/collection"
            linkLabel="Explore All"
          />
          <div className="grid gap-3 sm:grid-cols-3 md:gap-5">
            {homepageCollectionCards.map((collection, index) => (
              <Link
                key={collection.id}
                href={collection.href}
                data-collection={collection.id === "original" ? collection.id : undefined}
                className="collection-image-pair home-collection-card gold-focus group relative block aspect-[4/5] overflow-hidden bg-[#f4eee6]"
              >
                <CollectionImageSwap
                  images={collection.images}
                  alt={`${collection.eyebrow}: ${collection.title}`}
                  sizes="(min-width: 640px) 33vw, 100vw"
                  priority={index === 0}
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-5 text-white">
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-gold-soft">
                      {collection.eyebrow}
                    </p>
                    <h2 className="mt-1.5 text-xl font-semibold">{collection.title}</h2>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 transition group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <LimitedOfferCarousel />

      <section className="py-14 md:py-20">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="House Originals"
            title="Three Silhouettes. Eight Colours. One Philosophy."
            copy="Designed to move effortlessly between work, travel and celebration."
            href="/collection#original"
          />
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
            {originals.slice(0, 4).map((product, index) => (
              <ProductCard
                key={product.slug}
                product={product}
                priority={index < 2}
                badge="Heritage Collection"
                visualVariant="july29"
              />
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-luxe grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
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
              Designed And Made In Nigeria
            </h2>
            <p className="mt-5 text-sm leading-7 text-copy-muted">
              ỌNUỌRA creates contemporary menswear rooted in African identity, combining thoughtful
              design, quality craftsmanship and effortless wearability.
            </p>
            <Link
              href="/about"
              className="gold-focus mt-7 inline-flex items-center gap-2 border-b border-copy/40 pb-1 text-[10px] font-semibold uppercase"
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
                className="border-b border-line py-7 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"
              >
                <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                {signal.isHeading ? (
                  <h2 className="mt-4 text-xs font-semibold uppercase">{signal.title}</h2>
                ) : (
                  <h3 className="mt-4 text-xs font-semibold uppercase">{signal.title}</h3>
                )}
                {signal.copy ? (
                  <p className="mt-2 text-xs leading-5 text-copy-muted">{signal.copy}</p>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className="bg-obsidian py-14 text-ivory md:py-20">
        <div className="container-luxe grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <BadgeCheck className="h-6 w-6 text-gold" />
            <p className="mt-5 text-[10px] font-semibold uppercase text-gold-soft">ỌNUỌRA Circle</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Enter Before The Next Chapter Arrives.
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">
              Private previews, fit notes and first access to limited releases.
            </p>
          </div>
          <Cta href="/contact" variant="light">
            Join The Circle
          </Cta>
        </div>
      </section>
    </main>
  );
}
