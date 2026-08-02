import Image from "next/image";
import { notFound } from "next/navigation";
import { CollectionBrowser } from "@/components/collection-browser";
import { phaseOneCollections } from "@/data/phase-one-collections";

const collectionRoutes = {
  heritage: "original",
  cowrie: "with-button",
  resort: "without-button"
} as const;

type CollectionSlug = keyof typeof collectionRoutes;
type CollectionPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return Object.keys(collectionRoutes).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collectionId = collectionRoutes[slug as CollectionSlug];
  const collection = phaseOneCollections.find((item) => item.id === collectionId);

  if (!collection) return {};

  return {
    title: collection.title,
    description: collection.description,
    alternates: {
      canonical: `/collection/${slug}`
    }
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { slug } = await params;
  const collectionId = collectionRoutes[slug as CollectionSlug];
  const collection = phaseOneCollections.find((item) => item.id === collectionId);

  if (!collection) notFound();

  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="relative isolate overflow-hidden bg-obsidian py-12 text-ivory md:py-20">
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
        <div className="container-luxe relative grid gap-5 md:grid-cols-[1fr_0.6fr] md:items-end md:gap-7">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">{collection.eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              {collection.title}
            </h1>
          </div>
          <p className="max-w-lg text-sm leading-6 text-ivory/68">{collection.description}</p>
        </div>
      </section>

      <CollectionBrowser sections={[collection]} />
    </main>
  );
}
