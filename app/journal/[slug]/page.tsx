import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { journalArticles, getJournalArticle } from "@/data/journal-articles";

type JournalArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getJournalArticle(slug);

  if (!article) return {};

  return {
    title: article.title,
    description: article.subtitle,
    alternates: { canonical: `/journal/${article.slug}` }
  };
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getJournalArticle(slug);

  if (!article) notFound();

  return (
    <main className="relative overflow-hidden bg-[linear-gradient(180deg,#fbf8f2_0%,#f4eee6_58%,#faf8f4_100%)] pt-[104px] text-copy">
      <section className="container-luxe relative pb-12 pt-9 md:pb-18 md:pt-14">
        <Link href="/journal" className="gold-focus inline-flex min-h-11 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-copy-muted transition hover:text-copy">
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
          Back to Journal
        </Link>

        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,0.7fr)] lg:items-end lg:gap-14">
          <div className="max-w-3xl">
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">{article.category}</p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.06] sm:text-5xl md:text-6xl">{article.title}</h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-copy-muted md:text-lg">{article.subtitle}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle lg:aspect-[5/4]">
            <Image src={article.image} alt={article.imageAlt} fill priority sizes="(min-width: 1024px) 42vw, 100vw" className="object-cover object-top" />
          </div>
        </div>
      </section>

      <article className="container-luxe relative pb-14 md:pb-20">
        <div className="max-w-3xl border-t border-copy/12 pt-10 md:pt-14">
          {article.sections.map((section, index) => (
            <section key={section.heading ?? index} className={index === 0 ? "" : "mt-10 border-t border-copy/10 pt-8 md:mt-12 md:pt-10"}>
              {section.heading ? <h2 className="font-display text-2xl font-semibold leading-[1.15] tracking-[-0.02em] md:text-3xl">{section.heading}</h2> : null}
              <div className={section.heading ? "mt-4 space-y-3 text-[15px] leading-6 text-copy-muted md:text-base md:leading-7" : "space-y-3 text-[15px] leading-6 text-copy-muted md:text-base md:leading-7"}>
                {section.paragraphs.map((paragraph, paragraphIndex) => <p key={paragraphIndex}>{paragraph}</p>)}
              </div>
            </section>
          ))}
        </div>
        <div aria-hidden="true" className="pointer-events-none relative mx-auto mt-10 h-36 w-36 opacity-40 mix-blend-screen md:absolute md:bottom-20 md:right-10 md:mt-0 md:h-64 md:w-64 lg:right-20">
          <Image src="/brand/onuora-mark-gold.png" alt="" fill priority sizes="(min-width: 768px) 256px, 144px" className="object-contain" />
        </div>
      </article>

      <section className="border-y border-copy/10 bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe grid gap-7 md:grid-cols-[1fr_auto] md:items-end">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold-soft">Client Services</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">A considered wardrobe begins with a conversation.</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-ivory/65">Our Client Services team is available for sizing, delivery and wardrobe guidance.</p>
          </div>
          <Link href="/contact" className="gold-focus inline-flex min-h-12 items-center justify-center gap-3 border border-gold/60 px-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-gold-soft transition hover:bg-gold hover:text-obsidian">
            Contact Client Services <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section className="container-luxe py-12 md:py-16">
        <div className="flex flex-col gap-4 border-b border-copy/12 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">The Permanent Collections</p>
            <h2 className="mt-2 text-3xl font-semibold md:text-4xl">Explore the Wardrobe</h2>
          </div>
          <Link href="/collection" className="gold-focus inline-flex min-h-11 items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-copy transition hover:text-gold">
            Explore Collections <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>
    </main>
  );
}
