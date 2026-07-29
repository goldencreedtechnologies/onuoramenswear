import { CollectionBrowser } from "@/components/collection-browser";
import {
  phaseOneCollections,
  regionalPriceSets,
  type PhaseOneCollectionProduct
} from "@/data/phase-one-collections";
import { getStoreProducts } from "@/lib/backend/catalog";

export const metadata = {
  title: "Collections",
  description:
    "Explore ONUORA's new buttonless, buttoned, and original stretch-tailoring collections.",
  alternates: {
    canonical: "/collection"
  }
};

export default async function CollectionsPage() {
  const products = await getStoreProducts();
  const originalProducts: PhaseOneCollectionProduct[] = products
    .filter((product) => product.family === "original")
    .map((product) => ({
      id: `original-${product.slug}`,
      name: product.name,
      color: product.colorName,
      colorValue: product.colorValue,
      description: product.meaning,
      images: {
        front: product.image,
        hover: product.images.find((image) => image.includes("-angle.")) ?? product.images[1]
      },
      prices: regionalPriceSets.original,
      href: `/products/${product.slug}`
    }));

  const sections = [
    ...phaseOneCollections,
    {
      id: "original" as const,
      eyebrow: "House signature / 03",
      title: "Original Design",
      description:
        "The six named signatures that established ONUORA's language of modern African masculinity.",
      products: originalProducts
    }
  ];

  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe grid gap-7 md:grid-cols-[1fr_0.6fr] md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Collection / 2026</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              Made to move. Designed to be remembered.
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-ivory/68">
            New silhouettes and six house originals, cut in premium stretch fabric and delivered
            across the UK, USA, Europe, and worldwide.
          </p>
        </div>
      </section>
      <CollectionBrowser sections={sections} />
    </main>
  );
}
