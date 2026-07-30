import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Globe2, PackageCheck, ShieldCheck } from "lucide-react";
import { CurrencyConverter } from "@/components/currency-converter";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { ProductCard } from "@/components/product-card";
import { getStoreProductBySlug, getStoreProducts } from "@/lib/backend/catalog";
import { getCollectionByFamily } from "@/data/site-config";
import { priceToUsd } from "@/lib/cart";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const items = await getStoreProducts();
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) return {};

  return {
    title: product.name,
    description: `${product.name}, ${product.meaning}. ${product.story}`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getStoreProducts();
  const colorOptions = allProducts
    .filter((item) => item.family === product.family)
    .map((item) => ({
      slug: item.slug,
      name: item.name,
      colorName: item.colorName,
      colorValue: item.colorValue
    }));
  const related = allProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => Number(b.family === product.family) - Number(a.family === product.family))
    .slice(0, 4);
  const collection = getCollectionByFamily(product.family);
  const collectionLabel = collection.englishName;
  const collectionHash = collection.legacyHash;

  return (
    <main className="bg-page pt-[104px] text-copy">
      <div className="container-luxe py-4">
        <nav className="flex items-center gap-1.5 text-[10px] uppercase text-copy-muted" aria-label="Breadcrumb">
          <Link href="/" className="gold-focus hover:text-copy">
            Home
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={`/collection#${collectionHash}`} className="gold-focus hover:text-copy">
            {collectionLabel}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-copy">{product.name}</span>
        </nav>
      </div>

      <section className="container-luxe grid gap-8 pb-14 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-12 lg:pb-20">
        <ProductGallery
          images={Array.from(new Set([product.image, ...product.images]))}
          productName={product.name}
        />
        <aside className="lg:sticky lg:top-[124px] lg:self-start">
          <p className="text-[10px] font-semibold uppercase text-gold">{product.edition}</p>
          <h1 className="product-title mt-2 text-3xl font-semibold leading-none sm:text-4xl">
            {product.name}
          </h1>
          <p className="mt-2 text-sm text-copy-muted">{product.meaning}</p>
          <p className="mt-5 text-xl font-medium">{product.price}</p>
          <CurrencyConverter priceUsd={priceToUsd(product.price)} />
          <ProductOptions product={product} colorOptions={colorOptions} />

          <div className="mt-6 grid grid-cols-3 border-y border-line py-5">
            {[
              { icon: PackageCheck, label: "Inventory checked" },
              { icon: Globe2, label: "Tracked delivery" },
              { icon: ShieldCheck, label: "Secure payment" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="px-2 text-center">
                  <Icon className="mx-auto h-4 w-4 text-gold" />
                  <p className="mt-2 text-[9px] font-semibold uppercase text-copy-muted">
                    {item.label}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="divide-y divide-line border-b border-line text-sm">
            {[
              ["Details", product.details],
              ["Fit", product.fit],
              ["Fabric & care", product.fabricCare],
              ["Delivery", product.delivery]
            ].map(([title, text]) => (
              <details key={title} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase">
                  {title}
                  <span className="text-lg font-light group-open:rotate-45">+</span>
                </summary>
                <p className="pr-6 pt-3 text-sm leading-6 text-copy-muted">{text}</p>
              </details>
            ))}
          </div>
        </aside>
      </section>

      <section
        className="py-14 md:py-20"
        style={{ backgroundColor: product.palette, color: product.pageText }}
      >
        <div className="container-luxe grid gap-6 md:grid-cols-[0.8fr_1.2fr] md:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold-soft">{product.storyKicker}</p>
            <h2 className="mt-3 max-w-lg text-3xl font-semibold leading-tight md:text-4xl">
              {product.storyTitle}
            </h2>
          </div>
          <div>
            <p className="max-w-2xl text-base leading-8" style={{ color: product.pageMuted }}>
              {product.story}
            </p>
            <p className="mt-6 text-[10px] font-semibold uppercase" style={{ color: product.pageMuted }}>
              Designed for {product.occasion}
            </p>
          </div>
        </div>
      </section>

      <section className="container-luxe py-14 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">Complete The Wardrobe</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">You May Also Like</h2>
          </div>
          <Link
            href={`/collection#${collectionHash}`}
            className="gold-focus hidden border-b border-copy/35 pb-1 text-[10px] font-semibold uppercase sm:block"
          >
            Shop All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
