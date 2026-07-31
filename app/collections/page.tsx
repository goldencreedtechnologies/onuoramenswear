import Image from "next/image";
import { CollectionBrowser } from "@/components/collection-browser";
import { phaseOneCollections } from "@/data/phase-one-collections";

export const metadata = {
  title: "Shop Collections",
  description:
    "Explore ỌNUỌRA Menswear's Heritage, Cowrie, and Resort collections.",
  alternates: {
    canonical: "/collection"
  }
};

export default function CollectionsPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="relative isolate overflow-hidden bg-obsidian py-14 text-ivory md:py-20">
        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center">
          <Image
            src="/brand/onuora-logo-gold.png"
            alt=""
            aria-hidden="true"
            width={1100}
            height={420}
            priority
            className="h-auto w-[min(94vw,1050px)] object-contain opacity-[0.075]"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(31,31,31,0.18),rgba(31,31,31,0.78)_70%)]" />
        <div className="container-luxe relative grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Permanent Collections</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Made To Move. Designed To Be Remembered.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-ivory/68">
            Three permanent silhouettes, designed and made in Nigeria for work, travel, and celebration.
          </p>
        </div>
      </section>

      <CollectionBrowser sections={phaseOneCollections} />
    </main>
  );
}
