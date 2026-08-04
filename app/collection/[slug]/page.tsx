import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CollectionBrowser } from "@/components/collection-browser";
import { phaseOneCollections } from "@/data/phase-one-collections";

const collectionRoutes = {
  heritage: "original",
  cowrie: "with-button",
  resort: "without-button"
} as const;

const recommendedCollections = {
  heritage: "resort",
  resort: "cowrie",
  cowrie: "heritage"
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
  const collectionSlug = slug as CollectionSlug;
  const collectionId = collectionRoutes[collectionSlug];
  const collection = phaseOneCollections.find((item) => item.id === collectionId);

  if (!collection) notFound();

  const recommendationSlug = recommendedCollections[collectionSlug];
  const recommendationId = collectionRoutes[recommendationSlug];
  const recommendation = phaseOneCollections.find((item) => item.id === recommendationId);
  const recommendationImages = recommendation?.products.slice(0, 2) ?? [];

  return (
    <main className="bg-page pt-[104px] text-copy">
      <CollectionBrowser sections={[collection]} />

      {recommendation ? (
        <section className="border-b border-line bg-panel-muted py-12 md:py-16" aria-labelledby="recommended-collection">
          <div className="container-luxe grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
            <div className="max-w-xl">
              <p className="text-[10px] font-semibold uppercase text-gold">Recommended Collection</p>
              <h2 id="recommended-collection" className="mt-3 text-3xl font-semibold md:text-4xl">
                {recommendation.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-copy-muted">{recommendation.description}</p>
              <Link
                href={`/collection/${recommendationSlug}`}
                className="gold-focus mt-6 inline-flex min-h-12 items-center justify-center gap-3 bg-obsidian px-5 text-[10px] font-semibold uppercase text-white transition hover:bg-gold hover:text-obsidian"
              >
                Explore {recommendation.title}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-5">
              {recommendationImages.map((product, index) => (
                <div key={product.id} className="relative aspect-[4/5] overflow-hidden bg-page">
                  <Image
                    src={product.images.front}
                    alt={`${recommendation.title} in ${product.color}`}
                    fill
                    sizes="(min-width: 1024px) 28vw, 50vw"
                    className="object-cover object-top"
                    priority={index === 0}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}
    </main>
  );
}
