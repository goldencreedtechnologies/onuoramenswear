import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Globe2, PackageCheck, ShieldCheck } from "lucide-react";
import { CurrencySelector, ProductPrice } from "@/components/currency-provider";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { ProductCard } from "@/components/product-card";
import { getStoreProductBySlug, getStoreProducts } from "@/lib/backend/catalog";
import { getCollectionByFamily } from "@/data/site-config";
import styles from "./product-page.module.css";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

function galleryRank(image: string) {
  const normalized = image.toLowerCase();
  if (normalized.includes("-front.")) return 0;
  if (normalized.includes("-mid.")) return 1;
  if (normalized.includes("-angle.") || normalized.includes("-side.")) return 2;
  if (normalized.includes("detail")) return 3;
  if (normalized.includes("lifestyle") || normalized.includes("studio") || normalized.includes("grid")) return 4;
  if (normalized.includes("-back.") || normalized.includes(".back.")) return 5;
  return 6;
}

export async function generateStaticParams() {
  const items = await getStoreProducts();
  return items.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);
  if (!product) return {};

  const collection = getCollectionByFamily(product.family);
  return {
    title: `${collection.englishName} in ${product.colorName}`,
    description: `${product.colorName} contemporary menswear from the ${collection.englishName}.`
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
      name: item.colorName,
      colorName: item.colorName,
      colorValue: item.colorValue
    }));
  const related = allProducts
    .filter((item) => item.slug !== product.slug)
    .sort((a, b) => Number(b.family === product.family) - Number(a.family === product.family))
    .slice(0, 4);
  const collection = getCollectionByFamily(product.family);
  const collectionLabel = collection.englishName;
  const galleryImages = Array.from(new Set([product.image, ...product.images])).sort(
    (a, b) => galleryRank(a) - galleryRank(b)
  );

  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="container-luxe grid gap-6 pb-12 pt-4 md:gap-8 md:pt-8 lg:grid-cols-[minmax(0,1.38fr)_minmax(340px,0.62fr)] lg:gap-12 lg:pb-20">
        <ProductGallery images={galleryImages} productName={`${collectionLabel} in ${product.colorName}`} />

        <aside className="lg:sticky lg:top-[124px] lg:self-start">
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-[9px] uppercase text-copy-muted" aria-label="Breadcrumb">
            <Link href="/" className="gold-focus hover:text-copy">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/collection" className="gold-focus hover:text-copy">Shop</Link>
            <ChevronRight className="h-3 w-3" />
            <span>{collectionLabel}</span>
            <ChevronRight className="h-3 w-3" />
            <span>{product.colorName}</span>
            <ChevronRight className="h-3 w-3" />
            <span className="text-copy">Product</span>
          </nav>

          <div className="mb-5 flex items-center justify-between border-y border-line py-2.5">
            <span className="text-[10px] font-semibold uppercase text-copy-muted">Currency</span>
            <CurrencySelector />
          </div>

          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">
            {collection.igboName} · {collectionLabel}
          </p>
          <h1 className="product-title mt-2 text-3xl font-semibold leading-none sm:text-4xl">
            {product.colorName}
          </h1>
          <p className="mt-3 text-sm text-copy-muted">Complete two-piece set</p>
          <ProductPrice className="mt-4 block text-2xl font-semibold text-copy" />

          <div className={styles.options}>
            <ProductOptions product={product} colorOptions={colorOptions} />
          </div>

          <details className="group mt-5 border-y border-line py-4">
            <summary className="flex cursor-pointer list-none items-center justify-between text-xs font-semibold uppercase">
              Read More
              <span className="text-lg font-light group-open:rotate-45">+</span>
            </summary>
            <div className="grid gap-4 pt-4 text-sm leading-7 text-copy-muted">
              <p>{collection.description}</p>
              <p>A complete two-piece outfit with a coordinated top and tapered trousers, functional pockets and signature ỌNUỌRA detailing. Designed and made in Nigeria.</p>
              <p>{product.delivery}</p>
            </div>
          </details>

          <div className="mt-5 grid grid-cols-3 border-b border-line pb-5">
            {[
              { icon: PackageCheck, label: "Inventory checked" },
              { icon: Globe2, label: "Tracked delivery" },
              { icon: ShieldCheck, label: "Secure payment" }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="px-2 text-center">
                  <Icon className="mx-auto h-4 w-4 text-gold" />
                  <p className="mt-2 text-[9px] font-semibold uppercase text-copy-muted">{item.label}</p>
                </div>
              );
            })}
          </div>
        </aside>
      </section>

      <section className="container-luxe py-12 md:py-20">
        <div className="mb-7 flex items-end justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">Complete The Wardrobe</p>
            <h2 className="mt-2 text-2xl font-semibold md:text-3xl">You May Also Like</h2>
          </div>
          <Link href={`/collection#${collection.legacyHash}`} className="gold-focus hidden border-b border-copy/35 pb-1 text-[10px] font-semibold uppercase sm:block">
            Shop All
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-2.5 gap-y-7 sm:gap-x-5 sm:gap-y-9 lg:grid-cols-4">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} collectionOnly />
          ))}
        </div>
      </section>
    </main>
  );
}
