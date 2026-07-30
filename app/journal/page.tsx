import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { journalPosts } from "@/data/catalog";

export const metadata = {
  title: "Journal",
  description: "Editorial notes on African identity, styling, craft, and modern masculinity."
};

const journalImages = [
  "/brand/new-product-nb.png",
  "/brand/new-product-btn/new-design-b-black.png",
  "/brand/new-product-b.png"
];

export default function JournalPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="container-luxe py-12 md:py-16">
        <p className="text-[10px] font-semibold uppercase text-gold">Journal</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          Notes On Craft, Identity, And The Modern African Wardrobe.
        </h1>
      </section>
      <section className="container-luxe grid gap-x-5 gap-y-12 pb-16 md:grid-cols-3 md:pb-24">
        {journalPosts.map((post, index) => (
          <article key={post.title} className="group">
            <div className="relative aspect-[4/5] overflow-hidden bg-surface-subtle">
              <Image
                src={journalImages[index]}
                alt=""
                fill
                sizes="(min-width: 768px) 33vw, 100vw"
                className="object-cover object-top transition duration-700 group-hover:scale-[1.015]"
              />
            </div>
            <p className="mt-4 text-[10px] font-semibold uppercase text-gold">{post.tag}</p>
            <h2 className="mt-2 text-xl font-semibold leading-tight">{post.title}</h2>
            <p className="mt-3 text-sm leading-6 text-copy-muted">{post.excerpt}</p>
            <Link
              href="/contact"
              className="gold-focus mt-5 inline-flex items-center gap-2 text-[10px] font-semibold uppercase underline underline-offset-4"
            >
              Read with the house
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
