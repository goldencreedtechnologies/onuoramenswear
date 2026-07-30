import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CollectionImageSwap } from "@/components/collection-image-swap";
import { homepageCollectionCards } from "@/data/phase-one-collections";

export const metadata = {
  title: "Collections",
  description: "Explore ỌNUỌRA Menswear's Heritage, Cowrie, and Resort collections.",
  alternates: {
    canonical: "/collection"
  }
};

export default function CollectionsPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="bg-obsidian py-14 text-ivory md:py-20">
        <div className="container-luxe grid gap-7 md:grid-cols-[1fr_0.7fr] md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Permanent Collections</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Three Silhouettes. One House Philosophy.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-7 text-ivory/68">
            Heritage, Cowrie and Resort are designed for different occasions while sharing the same considered fit, Nigerian craftsmanship and effortless wearability.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container-luxe grid gap-6 md:grid-cols-3">
          {homepageCollectionCards.map((collection, index) => (
            <Link
              key={collection.id}
              id={collection.id}
              href={collection.href}
              className="collection-image-pair gold-focus group relative block aspect-[4/5] overflow-hidden bg-page"
            >
              <CollectionImageSwap
                images={collection.images}
                alt={`${collection.eyebrow}: ${collection.title}`}
                sizes="(min-width: 768px) 33vw, 100vw"
                priority={index === 0}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-black/5 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-[10px] font-semibold uppercase text-gold-soft">{collection.eyebrow}</p>
                <h2 className="mt-2 text-2xl font-semibold">{collection.title}</h2>
                <p className="mt-3 text-sm leading-6 text-white/72">{collection.description}</p>
                <span className="mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase">
                  Explore Collection
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
