import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { journalPosts } from "@/data/catalog";

export const metadata = {
  title: "Editorial Journal",
  description: "Behind the collections, African craftsmanship and ỌNUỌRA campaigns."
};

const journalImages = [
  "/brand/new-product-nb.png",
  "/brand/new-product-b(back).png",
  "/brand/products/original/aja/ajah-grid.png"
];

const journalDestinations = ["/about#story", "/about", "/collection/heritage"];

const categories = ["Behind the Collections", "African Craftsmanship", "Campaigns"];

export default function JournalPage() {
  const entries = journalPosts.slice(0, 3).map((post, index) => ({
    ...post,
    category: categories[index],
    image: journalImages[index],
    href: journalDestinations[index]
  }));
  const [featured, ...remaining] = entries;

  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="container-luxe pb-8 pt-10 md:pb-12 md:pt-16">
        <p className="text-[10px] font-semibold uppercase text-gold">EDITORIAL</p>
        <h1 className="mt-2 text-4xl font-semibold leading-tight md:text-6xl">Journal</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-copy-muted">
          Notes from the house on collections, craft and contemporary African menswear.
        </p>
      </section>

      {featured ? (
        <section className="container-luxe pb-12 md:pb-16">
          <article className="group grid gap-5 md:grid-cols-[1.3fr_0.7fr] md:items-center md:gap-10">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-subtle sm:aspect-[16/10]">
              <Image
                src={featured.image}
                alt=""
                fill
                priority
                sizes="(min-width: 768px) 66vw, 100vw"
                className="object-cover object-top transition duration-700 group-hover:scale-[1.015]"
              />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase text-gold">{featured.category}</p>
              <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">{featured.title}</h2>
              <p className="mt-4 text-sm leading-7 text-copy-muted">{featured.excerpt}</p>
              <Link href={featured.href} className="gold-focus mt-6 inline-flex items-center gap-2 border-b border-copy-muted/35 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-copy-muted transition hover:border-gold hover:text-copy" aria-label={`Read ${featured.title}`}>
                View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        </section>
      ) : null}

      <section className="container-luxe grid gap-10 pb-16 md:grid-cols-2 md:gap-6 md:pb-24">
        {remaining.map((post) => (
          <article key={post.category} className="group grid gap-4 sm:grid-cols-[0.8fr_1.2fr] sm:items-center md:block">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-subtle">
              <Image
                src={post.image}
                alt=""
                fill
                sizes="(min-width: 768px) 50vw, 42vw"
                className="object-cover object-top transition duration-700 group-hover:scale-[1.015]"
              />
            </div>
            <div className="md:pt-4">
              <p className="text-[10px] font-semibold uppercase text-gold">{post.category}</p>
              <h2 className="mt-2 text-xl font-semibold leading-tight">{post.title}</h2>
              <p className="mt-3 text-sm leading-6 text-copy-muted">{post.excerpt}</p>
              <Link href={post.href} className="gold-focus mt-4 inline-flex items-center gap-2 border-b border-copy-muted/35 pb-1 text-[10px] font-semibold uppercase tracking-[0.06em] text-copy-muted transition hover:border-gold hover:text-copy" aria-label={`Read ${post.title}`}>
                View <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}
