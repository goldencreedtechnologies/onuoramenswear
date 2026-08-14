import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, ChevronDown } from "lucide-react";
import { notFound } from "next/navigation";
import { getJournalArticle, journalArticles, type JournalArticle } from "@/data/journal-articles";

type EditorialImage = { src: string; alt: string; position?: string };

type ArticleEditorial = {
  sectionImages: EditorialImage[];
  quote: { section: number; paragraph: number };
  treatment: "identity" | "craft" | "collections";
};

const editorialTreatments: Record<string, ArticleEditorial> = {
  "new-language-contemporary-african-menswear": {
    treatment: "identity",
    sectionImages: [
      { src: "/brand/products/buttonless/nd3/nd3-front.png", alt: "ỌNUỌRA Resort Collection model", position: "object-top" },
      { src: "/brand/products/original/ndu/ndu-front.png", alt: "ỌNUỌRA Heritage Collection model", position: "object-top" }
    ],
    quote: { section: 1, paragraph: 7 }
  },
  "inside-making-onuora-outfit": {
    treatment: "craft",
    sectionImages: [
      { src: "/brand/tailor.png", alt: "Hand finishing an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/products/buttonless/nd3/nd3-detail.png", alt: "Detail of an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/new-product-b.png", alt: "ỌNUỌRA garment in an editorial setting", position: "object-top" }
    ],
    quote: { section: 1, paragraph: 5 }
  },
  "permanent-collections": {
    treatment: "collections",
    sectionImages: [
      { src: "/brand/products/original/aja/aja-front.png", alt: "Heritage Collection", position: "object-top" },
      { src: "/brand/products/button/ndb4/ndb4-front.png", alt: "Cowrie Collection", position: "object-top" },
      { src: "/brand/products/buttonless/nd3/nd3-front.png", alt: "Resort Collection", position: "object-top" },
      { src: "/brand/new-product-b.png", alt: "ỌNUỌRA collection editorial", position: "object-top" }
    ],
    quote: { section: 4, paragraph: 2 }
  }
};

const exploreCollections = [
  { href: "/collection/heritage", name: "Heritage", image: "/brand/products/original/aja/aja-front.png", alt: "Heritage Collection forest outfit" },
  { href: "/collection/cowrie", name: "Cowrie", image: "/brand/products/button/ndb4/ndb4-front.png", alt: "Cowrie Collection outfit" },
  { href: "/collection/resort", name: "Resort", image: "/brand/products/buttonless/nd3/nd3-front.png", alt: "Resort Collection outfit" }
] as const;

type JournalArticlePageProps = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return journalArticles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getJournalArticle(slug);
  if (!article) return {};

  return { title: article.title, description: article.subtitle, alternates: { canonical: `/journal/${article.slug}` } };
}

function EditorialImageFrame({ image, className = "", priority = false }: { image: EditorialImage; className?: string; priority?: boolean }) {
  return (
    <figure className={`relative overflow-hidden bg-[#e9dfcf] ${className}`}>
      <Image src={image.src} alt={image.alt} fill priority={priority} sizes="(min-width: 1280px) 34vw, (min-width: 1024px) 31vw, 100vw" className={`object-cover ${image.position ?? "object-center"}`} />
      <figcaption className="absolute bottom-0 left-0 bg-[#171717]/78 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.13em] text-[#f7f3e8]">ỌNUỌRA Menswear</figcaption>
    </figure>
  );
}

function EditorialDivider() {
  return (
    <div aria-hidden="true" className="flex items-center gap-2.5 py-1">
      <span className="h-px flex-1 bg-gold/45" />
      <Image src="/brand/onuora-mark-gold.png" alt="" width={13} height={18} />
      <span className="h-px flex-1 bg-gold/45" />
    </div>
  );
}

function ArticleCopy({ section, sectionIndex, quote, lead = false }: { section: JournalArticle["sections"][number]; sectionIndex: number; quote: ArticleEditorial["quote"]; lead?: boolean }) {
  return (
    <div className="text-[13px] leading-[1.58] text-copy-muted sm:text-[14px]">
      {section.paragraphs.map((paragraph, paragraphIndex) => {
        const isQuote = quote.section === sectionIndex && quote.paragraph === paragraphIndex;
        const isOpening = lead && paragraphIndex === 0;

        if (isQuote) {
          return (
            <blockquote key={paragraphIndex} className="my-4 border border-gold/35 bg-[#faf3e6] p-4 font-display text-xl leading-[1.12] text-copy sm:float-right sm:mb-3 sm:ml-5 sm:mt-0 sm:w-[14.25rem] sm:text-[1.6rem]">
              <span className="block text-2xl leading-none text-gold">“</span>{paragraph}<span className="mt-3 block h-px w-6 bg-gold/70" /><span className="mt-2 block font-sans text-[7px] font-semibold uppercase tracking-[0.14em] text-copy-muted">House of ỌNUỌRA</span>
            </blockquote>
          );
        }

        return <p key={paragraphIndex} className={`break-inside-avoid ${paragraphIndex === 0 ? "mt-0" : "mt-2.5"} ${isOpening ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.68] first-letter:text-gold sm:first-letter:text-7xl" : ""}`}>{paragraph}</p>;
      })}
    </div>
  );
}

function ArticleSection({ section, sectionIndex, editorial }: { section: JournalArticle["sections"][number]; sectionIndex: number; editorial: ArticleEditorial }) {
  const image = editorial.sectionImages[sectionIndex - 1] ?? editorial.sectionImages.at(-1);
  const imageFirst = editorial.treatment === "craft" ? sectionIndex % 2 === 0 : sectionIndex % 2 === 1;
  const hideMobileImage = editorial.treatment === "identity" && sectionIndex === 1;

  return (
    <>
      <section id={`mobile-section-${sectionIndex}`} className="scroll-mt-24 pt-4 lg:hidden">
        <EditorialDivider />
        <div className="pt-4">
          {section.heading ? <><p className="text-[7px] font-semibold uppercase tracking-[0.16em] text-gold">{String(sectionIndex).padStart(2, "0")}</p><h2 className="mt-1.5 font-display text-[1.7rem] leading-[0.94] tracking-[-0.02em] text-copy">{section.heading}</h2></> : null}
          {!hideMobileImage && image ? <EditorialImageFrame image={image} className={`${imageFirst ? "float-left mr-3" : "float-right ml-3"} mt-2.5 mb-2 aspect-[3/4] w-[40%] max-w-[9.5rem]`} /> : null}
          <div className="mt-3"><ArticleCopy section={section} sectionIndex={sectionIndex} quote={editorial.quote} /></div>
          <div className="clear-both" />
        </div>
      </section>
      <section id={`section-${sectionIndex}`} className="hidden scroll-mt-28 pt-5 sm:pt-6 lg:block">
        <EditorialDivider />
        <div className="pt-5 sm:pt-6 lg:grid lg:grid-cols-[minmax(0,1.16fr)_minmax(13rem,0.78fr)] lg:gap-7 xl:gap-9">
          <div className={imageFirst ? "lg:order-2" : ""}>
            {image ? <EditorialImageFrame image={image} className="mb-4 aspect-[5/4] sm:aspect-[16/11] lg:mb-0 lg:h-full lg:min-h-[19rem] lg:aspect-auto" /> : null}
          </div>
          <div className={`min-w-0 ${imageFirst ? "lg:order-1" : ""}`}>
            {section.heading ? <><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold">{String(sectionIndex).padStart(2, "0")}</p><h2 className="mt-2 font-display text-[2rem] leading-[0.95] tracking-[-0.025em] text-copy sm:text-[2.35rem]">{section.heading}</h2></> : null}
            <div className="mt-4"><ArticleCopy section={section} sectionIndex={sectionIndex} quote={editorial.quote} /></div>
            <div className="clear-both" />
          </div>
        </div>
      </section>
    </>
  );
}

function MobileArticleContents({ article }: { article: JournalArticle }) {
  const sections = article.sections.filter((section) => section.heading);

  return (
    <details className="group border border-copy/12 bg-[#faf5eb] lg:hidden">
      <summary className="gold-focus flex min-h-10 cursor-pointer list-none items-center justify-between gap-4 px-3.5 text-[8px] font-semibold uppercase tracking-[0.14em] text-copy [&::-webkit-details-marker]:hidden">
        In This Article <ChevronDown className="h-3.5 w-3.5 text-gold transition group-open:rotate-180" />
      </summary>
      <nav className="border-t border-copy/10 px-3.5 py-3" aria-label="Article sections">
        <ol className="grid gap-2">
          {sections.map((section) => {
            const index = article.sections.indexOf(section);
            return <li key={section.heading}><a href={`#mobile-section-${index}`} className="gold-focus flex items-center gap-2 text-[10px] leading-4 text-copy-muted transition hover:text-copy"><span className="h-1 w-1 rounded-full bg-gold" />{section.heading}</a></li>;
          })}
        </ol>
      </nav>
    </details>
  );
}

function ArticleSidebar({ article }: { article: JournalArticle }) {
  const related = journalArticles.find((candidate) => candidate.slug !== article.slug) ?? journalArticles[0];
  const toc = article.sections.filter((section) => section.heading);

  return (
    <aside className="hidden min-w-0 lg:block" aria-label="Article details">
      <div className="sticky top-[7.5rem] space-y-7 border-l border-copy/10 pl-5 xl:pl-6">
        <section>
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-copy">In This Article</p>
          <nav className="mt-3 border-y border-copy/10 py-2.5" aria-label="Article sections">
            <ol className="space-y-2.5">
              {toc.map((section) => {
                const sectionIndex = article.sections.indexOf(section);
                return <li key={section.heading}><a href={`#section-${sectionIndex}`} className="gold-focus group flex items-start gap-2 text-[9px] leading-4 text-copy-muted transition hover:text-copy"><span className="mt-[0.34rem] h-1 w-1 shrink-0 rounded-full bg-gold group-hover:scale-125" />{section.heading}</a></li>;
              })}
            </ol>
          </nav>
        </section>
        <section>
          <p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-copy">Related Reading</p>
          <Link href={`/journal/${related.slug}`} className="gold-focus group mt-3 block border border-copy/12 bg-[#faf5eb] p-2.5 transition hover:border-gold/55">
            <div className="relative aspect-[16/9] overflow-hidden bg-[#e9dfcf]"><Image src={related.image} alt={related.imageAlt} fill sizes="190px" className="object-cover object-center transition duration-500 group-hover:scale-[1.03]" /></div>
            <p className="mt-3 text-[7px] font-semibold uppercase tracking-[0.14em] text-gold">{related.category}</p>
            <h2 className="mt-1 font-display text-lg leading-[0.98] text-copy">{related.title}</h2>
            <p className="mt-2 text-[9px] leading-4 text-copy-muted">{related.subtitle}</p>
            <span className="mt-3 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy">Read article <ArrowRight className="h-3 w-3 text-gold" /></span>
          </Link>
        </section>
      </div>
    </aside>
  );
}

function CompactExplore() {
  return (
    <section className="border border-gold/25 bg-[#faf3e6] px-4 py-3.5 sm:px-5">
      <div className="grid gap-3 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="flex items-center gap-3"><Image src="/brand/onuora-mark-gold.png" alt="" width={19} height={28} /><div><p className="font-display text-base leading-none text-copy">Explore the Permanent Collections</p><p className="mt-1 text-[8px] text-copy-muted">Timeless staples. Modern expression.</p></div></div>
        <div className="grid grid-cols-3 gap-2 border-t border-copy/10 pt-3 sm:border-l sm:border-t-0 sm:pl-4 sm:pt-0">
          {exploreCollections.map((collection) => <Link key={collection.href} href={collection.href} className="gold-focus group flex min-w-0 items-center gap-1 text-[9px] font-semibold text-copy transition hover:text-gold sm:gap-2"><span className="relative h-6 w-6 shrink-0 overflow-hidden sm:h-7 sm:w-7"><Image src={collection.image} alt="" fill sizes="28px" className="object-cover object-top" /></span><span className="truncate">{collection.name}</span><ArrowRight className="h-3 w-3 shrink-0" /></Link>)}
        </div>
      </div>
    </section>
  );
}

function MoreFromJournal() {
  return (
    <section className="border-t border-copy/12 pt-6 sm:pt-7">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold">Journal</p><h2 className="mt-2 font-display text-2xl leading-none text-copy sm:text-3xl">More From the Journal</h2></div><Link href="/journal" className="gold-focus inline-flex items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy">View all articles <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      <div className="mt-4 grid gap-2.5 sm:grid-cols-3 sm:gap-3">
        {journalArticles.map((related) => <Link key={related.slug} href={`/journal/${related.slug}`} className="gold-focus group grid grid-cols-[4.25rem_1fr] gap-2 border border-copy/10 bg-[#fbf8f1] p-2 transition hover:border-gold/55 sm:grid-cols-[5.25rem_1fr] sm:gap-3 sm:p-2.5"><div className="relative aspect-[4/5] overflow-hidden bg-[#e9dfcf]"><Image src={related.image} alt={related.imageAlt} fill sizes="110px" className="object-cover object-center transition duration-500 group-hover:scale-[1.03]" /></div><div className="min-w-0"><p className="text-[7px] font-semibold uppercase tracking-[0.13em] text-gold">{related.category}</p><h3 className="mt-1 font-display text-[0.92rem] leading-[0.96] text-copy sm:text-base">{related.title}</h3><p className="mt-1.5 line-clamp-2 text-[9px] leading-4 text-copy-muted sm:mt-2">{related.subtitle}</p><span className="mt-1.5 inline-flex items-center gap-1 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy sm:mt-2">Read <ArrowRight className="h-3 w-3 text-gold" /></span></div></Link>)}
      </div>
    </section>
  );
}

export default async function JournalArticlePage({ params }: JournalArticlePageProps) {
  const { slug } = await params;
  const article = getJournalArticle(slug);
  if (!article) notFound();

  const editorial = editorialTreatments[article.slug] ?? editorialTreatments["new-language-contemporary-african-menswear"];
  const opening = article.sections[0];

  return (
    <main className="overflow-x-hidden bg-[linear-gradient(180deg,#f8f4eb_0%,#f3ebde_52%,#faf7ef_100%)] pt-[104px] text-copy">
      <section className="container-luxe py-4 sm:py-9 lg:py-11">
        <Link href="/journal" className="gold-focus sr-only min-h-9 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy lg:inline-flex"><ArrowLeft className="h-3.5 w-3.5" />Back to Journal</Link>
        <div className="mb-2.5 flex min-h-8 items-center justify-center bg-obsidian px-4 text-gold lg:hidden"><span className="font-display text-base tracking-[0.18em]">JOURNAL</span></div>
        <div className="overflow-hidden border border-copy/12 bg-[#fbf8f1]/75 shadow-[0_16px_45px_rgba(57,42,24,0.08)] lg:mt-5 lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.8fr)]">
          <div className="flex min-w-0 flex-col justify-between p-4 sm:p-8 lg:p-10 xl:p-12"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold">{article.category}</p><h1 className="mt-2 max-w-3xl font-display text-[1.82rem] leading-[0.91] tracking-[-0.035em] text-copy min-[480px]:text-[2.25rem] sm:mt-3 sm:text-6xl xl:text-[4.65rem]">{article.title}</h1><p className="mt-3 max-w-xl text-[12px] leading-5 text-copy-muted min-[480px]:text-[13px] sm:mt-4 sm:text-[15px] sm:leading-6">{article.subtitle}</p></div><div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-copy/12 pt-2.5 text-[7px] font-semibold uppercase tracking-[0.11em] text-copy-muted sm:mt-6 sm:gap-x-2.5 sm:gap-y-1.5 sm:pt-3 sm:text-[8px] sm:tracking-[0.12em]"><span>ỌNUỌRA Journal</span><span aria-hidden="true">•</span><span>Editorial Feature</span><span aria-hidden="true">•</span><span>By the House of ỌNUỌRA</span></div></div>
          <EditorialImageFrame image={{ src: article.image, alt: article.imageAlt, position: "object-top" }} priority className="aspect-[2/1] min-h-[10.5rem] border-t border-copy/12 sm:aspect-[16/9] sm:min-h-[13rem] lg:min-h-[29rem] lg:aspect-[4/3] lg:border-l lg:border-t-0" />
        </div>
      </section>

      <article className="border-y border-copy/12 bg-[#fbf8f1]/54 py-5 sm:py-9 lg:py-11">
        <div className="container-luxe grid gap-5 lg:grid-cols-[minmax(0,1fr)_12rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_13rem] xl:gap-10">
          <div className="min-w-0 space-y-5 sm:space-y-7">
            <section className="pb-1"><ArticleCopy section={opening} sectionIndex={0} quote={editorial.quote} lead /></section>
            {article.sections.slice(1).map((section, index) => <ArticleSection key={section.heading ?? index} section={section} sectionIndex={index + 1} editorial={editorial} />)}
            <MobileArticleContents article={article} />
            <CompactExplore />
          </div>
          <ArticleSidebar article={article} />
          <div className="lg:col-span-2"><MoreFromJournal /></div>
        </div>
      </article>

      <section className="border-t border-copy/10 bg-obsidian py-9 text-ivory sm:py-10"><div className="container-luxe grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold-soft">Client Services</p><h2 className="mt-2 font-display text-2xl leading-[1.02] sm:text-3xl">A considered wardrobe begins with a conversation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/65">Our Client Services team is available for sizing, delivery and wardrobe guidance.</p></div><Link href="/contact" className="gold-focus inline-flex min-h-10 items-center justify-center gap-2.5 border border-gold/60 px-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-gold-soft transition hover:bg-gold hover:text-obsidian">Contact Client Services <ArrowRight className="h-3.5 w-3.5" /></Link></div></section>
    </main>
  );
}
