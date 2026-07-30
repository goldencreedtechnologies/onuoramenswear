import { CollectionBrowser } from "@/components/collection-browser";
import { phaseOneCollections } from "@/data/phase-one-collections";

export const metadata = {
  title: "Collections",
  description:
    "Explore ỌNUỌRA Menswear's Heritage, Cowrie, and Resort collections.",
  alternates: {
    canonical: "/collection"
  }
};

export default function CollectionsPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
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
