import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { getStoreProducts } from "@/lib/backend/catalog";

export const metadata = {
  title: "Collections",
  description: "Explore ỌNUỌRA's limited-run stretch tailoring editions."
};

export default async function CollectionsPage() {
  const products = await getStoreProducts();

  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe py-20 md:py-28">
        <SectionHeading
          eyebrow="Collections"
          title="Choose the mood you want to carry."
          copy="A focused house collection organized by name, color, and occasion."
        />
        <div className="mb-10 flex flex-wrap gap-3 text-xs font-bold uppercase tracking-[0]">
          {["All", "Black", "Cream", "Burgundy", "Blue", "Forest", "White"].map((filter) => (
            <button key={filter} className="gold-focus rounded-full border border-gold/20 bg-panel px-4 py-2 text-copy-muted transition hover:border-gold hover:text-gold">
              {filter}
            </button>
          ))}
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {products.map((product, index) => (
            <ProductCard key={product.slug} product={product} priority={index < 2} />
          ))}
        </div>
      </section>
    </main>
  );
}
