import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, PackageCheck, Ruler, Scissors } from "lucide-react";
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
  const selectedPieces = ["ebube", "ndb3", "nd3", "ijeoma"]
    .map((slug) => products.find((product) => product.slug === slug))
    .filter((product): product is NonNullable<typeof product> => Boolean(product));

  return (
    <main className="bg-page text-copy">
      <section className="relative min-h-[min(680px,calc(100svh-56px))] overflow-hidden bg-[#f4eee6] text-[#171717] md:min-h-[min(820px,calc(100svh-72px))]">
        <Image
          src="/brand/main-hero-mobile.png"
          alt="Registered ỌNUỌRA models wearing the purple, forest and black two-piece outfits"
          fill
          priority
          quality={95}
          sizes="(max-width: 639px) 100vw, 1px"
          className="object-contain object-top sm:hidden"
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
              Designed for a global wardrobe. Prepared for dispatch within three working days.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Cta href="/collection" variant="dark">Shop Collections</Cta>
              <Cta href="/about" variant="ghost">Our Story</Cta>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f4eee6] py-16 md:py-24">
        <div className="container-luxe">
          <div className="mb-10 grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-end">
            <div>
              <p className="text-[10px] font-semibold uppercase text-gold">Permanent Collections</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Three Silhouettes. One Philosophy.</h2>
            </div>
            <p className="max-w-2xl text-sm leading-7 text-copy-muted">
              ỌNUỌRA is built around three permanent collections, each designed for a different rhythm of work, travel and celebration while sharing the same commitment to comfort, identity and considered construction.
            </p>
          </div>
          <div className="grid auto-rows-fr items-stretch gap-3 sm:grid-cols-3 md:gap-5">
            {homepageCollectionCards.map((collection, index) => (
              <Link key={collection.id} href={collection.href} className="collection-image-pair home-collection-card gold-focus group relative block h-full aspect-[4/5] overflow-hidden bg-[#f4eee6]">
                <CollectionImageSwap images={collection.images} alt={`${collection.eyebrow}: ${collection.title}`} sizes="(min-width: 640px) 33vw, 100vw" priority={index === 0} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/76 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[9px] font-semibold uppercase text-gold-soft">{collection.eyebrow}</p>
                  <h3 className="mt-1.5 text-xl font-semibold">{collection.title}</h3>
                  <p className="mt-2 text-xs leading-5 text-white/75">{collection.description}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase">Explore <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-luxe">
          <SectionHeading eyebrow="Selected Pieces" title="A Considered Edit From The House." copy="Four complete outfits chosen across the permanent collections." href="/collection" linkLabel="Shop All" />
          <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
            {selectedPieces.map((product, index) => <ProductCard key={product.slug} product={product} priority={index < 2} />)}
          </div>
        </div>
      </section>

      <LimitedOfferCarousel />

      <section className="border-y border-line py-12 md:py-16">
        <div className="container-luxe grid gap-6 md:grid-cols-3">
          <div><PackageCheck className="h-5 w-5 text-gold" /><h2 className="mt-4 text-lg font-semibold">Prepared For Dispatch</h2><p className="mt-2 text-sm leading-6 text-copy-muted">Orders are prepared for dispatch within three working days.</p></div>
          <div><Globe2 className="h-5 w-5 text-gold" /><h2 className="mt-4 text-lg font-semibold">Worldwide Delivery</h2><p className="mt-2 text-sm leading-6 text-copy-muted">Tracked international delivery is available. Shipping is charged separately.</p></div>
          <div><BadgeCheck className="h-5 w-5 text-gold" /><h2 className="mt-4 text-lg font-semibold">Current Offer</h2><p className="mt-2 text-sm leading-6 text-copy-muted">Buy two outfits and receive 50% off a third outfit.</p></div>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-luxe grid sm:grid-cols-2 lg:grid-cols-4">
          {craftsmanshipSignals.map((signal) => {
            const Icon = signal.icon;
            return <div key={signal.title} className="border-b border-line py-7 sm:px-6 sm:[&:nth-child(odd)]:border-r lg:border-b-0 lg:border-r lg:first:pl-0 lg:last:border-r-0"><Icon className="h-5 w-5 text-gold" />{signal.isHeading ? <h2 className="mt-4 text-xs font-semibold uppercase">{signal.title}</h2> : <h3 className="mt-4 text-xs font-semibold uppercase">{signal.title}</h3>}{signal.copy ? <p className="mt-2 text-xs leading-5 text-copy-muted">{signal.copy}</p> : null}</div>;
          })}
        </div>
      </section>

      <section className="bg-obsidian py-16 text-ivory md:py-24">
        <div className="container-luxe grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
          <div className="max-w-2xl">
            <BadgeCheck className="h-6 w-6 text-gold" />
            <p className="mt-5 text-[10px] font-semibold uppercase text-gold-soft">ỌNUỌRA Circle</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">Join The ỌNUỌRA Circle.</h2>
            <p className="mt-4 max-w-xl text-sm leading-6 text-white/58">Private previews, fit notes and first access to new releases.</p>
          </div>
          <Cta href="/contact" variant="light">Join The Circle</Cta>
        </div>
      </section>
    </main>
  );
}
