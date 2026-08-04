import Image from "next/image";
import { CollectionBrowser } from "@/components/collection-browser";
import { phaseOneCollections } from "@/data/phase-one-collections";

export const metadata = {
  title: "Shop Collections",
  description: "Explore ỌNUỌRA Menswear's Heritage, Cowrie and Resort collections.",
  alternates: {
    canonical: "/collection"
  }
};

export default function CollectionsPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="relative isolate min-h-[300px] overflow-hidden bg-obsidian text-ivory md:min-h-[390px]">
        <Image
          src="/brand/Untitled-design-34.png"
          alt="ỌNUỌRA contemporary African menswear campaign"
          fill
          priority
          quality={94}
          sizes="100vw"
          className="-z-20 object-cover object-center"
        />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-r from-black/88 via-black/58 to-black/28" />
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-t from-black/46 via-transparent to-black/18" />
        <div className="container-luxe relative grid min-h-[300px] gap-5 py-12 md:min-h-[390px] md:grid-cols-[1fr_0.6fr] md:items-end md:gap-7 md:py-20">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">THE PERMANENT COLLECTIONS</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight text-white sm:text-4xl md:text-5xl">
              Three Collections. One Philosophy.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-white/78">
            Three distinct expressions of contemporary African menswear designed for different occasions.
          </p>
        </div>
      </section>

      <CollectionBrowser sections={phaseOneCollections} />
    </main>
  );
}
