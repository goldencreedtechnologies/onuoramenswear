import { notFound } from "next/navigation";
import { CurrencyConverter } from "@/components/currency-converter";
import { ProductGallery } from "@/components/product-gallery";
import { ProductOptions } from "@/components/product-options";
import { ProductCard } from "@/components/product-card";
import { getStoreProductBySlug, getStoreProducts } from "@/lib/backend/catalog";

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

  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: `${product.name}, ${product.meaning}. ${product.story}`
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getStoreProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const related = (await getStoreProducts()).filter((item) => item.slug !== product.slug).slice(0, 3);

  return (
    <main
      className="pt-24"
      style={
        {
          backgroundColor: product.palette,
          color: product.pageText,
          "--product-text": product.pageText,
          "--product-muted": product.pageMuted,
          "--product-panel": product.pagePanel
        } as React.CSSProperties
      }
    >
      <section className="container-luxe grid gap-10 py-12 md:grid-cols-[1.02fr_0.98fr] md:py-20">
        <ProductGallery images={product.images} productName={product.name} darkPage={product.darkPage} />
        <aside className="md:sticky md:top-28 md:self-start">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0] text-gold">{product.edition}</p>
          <h1 className="product-title font-display text-6xl leading-[0.9] md:text-8xl">{product.name}</h1>
          <p className="mt-4 text-xl" style={{ color: product.pageMuted }}>{product.meaning}</p>
          <p className="mt-8 text-3xl font-semibold">{product.price}</p>
          <CurrencyConverter priceUsd={100} accentText={product.pageText} panelText={product.pageMuted} />
          <ProductOptions product={product} />
          <div className="mt-8 divide-y divide-gold/20 border-y border-gold/25 text-sm">
            {[
              ["Fabric", "Smooth, breathable 4-way stretch fabric with a tailored drape."],
              ["Fit", "Designed to flex with the body while maintaining a sharp silhouette."],
              ["Shipping", "Tracked UK and international fulfilment with premium client care."],
              ["Care", "Gentle wash, dry flat, cool iron inside out."],
            ].map(([title, text]) => (
              <details key={title} className="group py-5">
                <summary className="cursor-pointer list-none font-bold uppercase tracking-[0]">{title}</summary>
                <p className="mt-3 leading-7" style={{ color: product.pageMuted }}>{text}</p>
              </details>
            ))}
          </div>
        </aside>
      </section>

      <section className="py-20 md:py-28" style={{ backgroundColor: product.pagePanel, color: product.pageText }}>
          <div className="container-luxe grid gap-10 md:grid-cols-[0.85fr_1.15fr] md:items-center">
            <div>
              <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">{product.storyKicker}</p>
              <h2 className="font-display text-5xl leading-[0.95] md:text-7xl">{product.storyTitle}</h2>
            </div>
            <p className="text-base leading-8" style={{ color: product.pageMuted }}>
              {product.story}
            </p>
          </div>
        </section>

      <section className="container-luxe py-20 md:py-28">
        <div className="mb-10 flex items-end justify-between gap-8">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0] text-gold">Complete the wardrobe</p>
            <h2 className="font-display text-5xl">You may also like</h2>
          </div>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {related.map((item) => (
            <ProductCard key={item.slug} product={item} />
          ))}
        </div>
      </section>
    </main>
  );
}
