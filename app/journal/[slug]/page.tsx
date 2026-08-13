import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getJournalArticle, journalArticles, type JournalArticle } from "@/data/journal-articles";

type EditorialImage = {
  src: string;
  alt: string;
  position?: string;
};

type ArticleEditorial = {
  introImage: EditorialImage;
  sectionImages: EditorialImage[];
  quote: { section: number; paragraph: number };
  treatment: "identity" | "craft" | "collections";
};

const editorialTreatments: Record<string, ArticleEditorial> = {
  "new-language-contemporary-african-menswear": {
    treatment: "identity",
    introImage: {
      src: "/brand/products/original/ndu/ndu-lifestyle.png",
      alt: "ỌNUỌRA menswear in an editorial setting",
      position: "object-top"
    },
    sectionImages: [
      { src: "/brand/new-product-nb(back).png", alt: "ỌNUỌRA menswear editorial portrait", position: "object-top" },
      { src: "/brand/products/buttonless/nd3/nd3-angle.png", alt: "ỌNUỌRA Resort Collection look", position: "object-top" },
      { src: "/brand/final-hero.png", alt: "ỌNUỌRA menswear collection", position: "object-center" }
    ],
    quote: { section: 1, paragraph: 7 }
  },
  "inside-making-onuora-outfit": {
    treatment: "craft",
    introImage: {
      src: "/brand/tailor 2.PNG",
      alt: "Tailor cutting fabric for an ỌNUỌRA garment",
      position: "object-center"
    },
    sectionImages: [
      { src: "/brand/tailor.png", alt: "Hand finishing an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/products/buttonless/nd3/nd3-detail.png", alt: "Detail of an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/DSC06185.jpg", alt: "ỌNUỌRA craftsmanship detail", position: "object-center" },
      { src: "/brand/products/original/aja/aja-mid.png", alt: "ỌNUỌRA Heritage Collection tailoring", position: "object-top" }
    ],
    quote: { section: 1, paragraph: 6 }
  },
  "permanent-collections": {
    treatment: "collections",
    introImage: {
      src: "/brand/products/original/aja/ajah-grid.png",
      alt: "The ỌNUỌRA Permanent Collections",
      position: "object-center"
    },
    sectionImages: [
      { src: "/brand/products/original/aja/aja-front.png", alt: "Heritage Collection", position: "object-top" },
      { src: "/brand/products/button/ndb4/ndb4-mid.png", alt: "Cowrie Collection", position: "object-top" },
      { src: "/brand/products/buttonless/nd3/nd3-angle.png", alt: "Resort Collection", position: "object-top" },
      { src: "/brand/new-product-b.png", alt: "ỌNUỌRA collection editorial", position: "object-top" },
      { src: "/brand/Heritage.jpg", alt: "ỌNUỌRA collection campaign", position: "object-center" }
    ],
    quote: { section: 4, paragraph: 2 }
  }
};

const exploreCollections = [
  {
    href: "/collection/heritage",
    name: "Heritage Collection",
    image: "/brand/products/original/aja/aja-front.png",
    alt: "Heritage Collection forest outfit"
  },
  {
    href: "/collection/cowrie",
    name: "Cowrie Collection",
    image: "/brand/products/button/ndb4/ndb4-mid.png",
    alt: "Cowrie Collection burgundy outfit"
  },
  {
    href: "/collection/resort",
    name: "Resort Collection",
    image: "/brand/products/buttonless/nd3/nd3-angle.png",
    alt: "Resort Collection outfit"
  }
] as const;

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

function EditorialImageFrame({ image, className = "" }: { image: EditorialImage; className?: string }) {
  return (
    <figure className={`relative overflow-hidden bg-[#e9dfcf] shadow-[0_18px_45px_rgba(57,42,24,0.10)] ${className}`}>
      <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 44vw, (min-width: 768px) 48vw, 100vw" className={`object-cover ${image.position ?? "object-center"}`} />
      <figcaption className="absolute bottom-0 left-0 bg-[#171717]/78 px-3 py-2 text-[8px] font-semibold uppercase tracking-[0.13em] text-[#f7f3e8]">
        ỌNUỌRA Menswear
      </figcaption>
    </figure>
  );
}

function ArticleCopy({
  section,
  sectionIndex,
  quote,
  lead = false
}: {
  section: JournalArticle["sections"][number];
  sectionIndex: number;
  quote: ArticleEditorial["quote"];
  lead?: boolean;
}) {
  return (
    <div className="text-[15px] leading-7 text-copy-muted md:text-base md:leading-7">
      {section.paragraphs.map((paragraph, paragraphIndex) => {
        const isQuote = quote.section === sectionIndex && quote.paragraph === paragraphIndex;
        const isOpening = lead && paragraphIndex === 0;

        if (isQuote) {
          return (
            <blockquote key={paragraphIndex} className="my-7 border-y border-gold/45 py-5 font-display text-2xl leading-[1.15] text-copy md:my-9 md:text-3xl">
              <span className="mr-2 text-gold">“</span>{paragraph}<span className="ml-1 text-gold">”</span>
            </blockquote>
          );
        }

        return (
          <p
            key={paragraphIndex}
            className={`${paragraphIndex === 0 ? "mt-0" : "mt-4"} ${isOpening ? "first-letter:float-left first-letter:mr-2 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.72] first-letter:text-gold md:first-letter:text-7xl" : ""}`}
          >
            {paragraph}
          </p>
        );
      })}
    </div>
  );
}

function sectionId(section: JournalArticle["sections"][number], index: number) {
  return section.heading ? section.heading.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : `opening-${index + 1}`;
}

function ArticleContents({ article }: { article: JournalArticle }) {
  return (
    <aside className="border-y border-copy/12 py-5 lg:sticky lg:top-28 lg:border-b-0 lg:border-t-0 lg:border-l lg:py-0 lg:pl-7">
      <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">In This Article</p>
      <ol className="mt-4 space-y-3">
        {article.sections.map((section, index) => (
          <li key={section.heading ?? index}>
            <a href={`#${sectionId(section, index)}`} className="gold-focus flex items-start gap-2 text-[11px] leading-4 text-copy-muted transition hover:text-copy">
              <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold" aria-hidden="true" />
              {section.heading ?? "Introduction"}
            </a>
          </li>
        ))}
      </ol>
    </aside>
  );
}

function MagazineSection({
  section,
  sectionIndex,
  editorial
}: {
  section: JournalArticle["sections"][number];
  sectionIndex: number;
  editorial: ArticleEditorial;
}) {
  const image = editorial.sectionImages[Math.max(0, sectionIndex - 1)] ?? editorial.sectionImages.at(-1);
  const chapterNumber = String(sectionIndex).padStart(2, "0");
  const isCollections = editorial.treatment === "collections";
  const imageFirst = editorial.treatment === "craft" ? sectionIndex % 2 === 1 : sectionIndex % 2 === 0;

  return (
    <section id={sectionId(section, sectionIndex)} className="scroll-mt-32 border-t border-copy/12 pt-8 md:pt-10">
      <div className={`grid gap-6 lg:gap-9 ${isCollections ? "lg:grid-cols-[minmax(0,0.92fr)_minmax(21rem,0.78fr)]" : "lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.62fr)]"} lg:items-start`}>
        <div className={`min-w-0 ${imageFirst ? "lg:order-2" : ""}`}>
          {section.heading ? (
            <>
              <div className="flex items-center gap-3"><span className="text-[9px] font-semibold tracking-[0.16em] text-gold">{chapterNumber}</span><span className="h-px w-10 bg-gold/80" /></div>
              <h2 className={`${isCollections ? "text-4xl md:text-5xl" : "text-3xl md:text-[2.5rem]"} mt-3 font-display leading-[0.96] tracking-[-0.02em] text-copy`}>{section.heading}</h2>
            </>
          ) : null}
          <div className={section.heading ? "mt-5 max-w-2xl" : "max-w-2xl"}>
            <ArticleCopy section={section} sectionIndex={sectionIndex} quote={editorial.quote} />
          </div>
        </div>
        {image ? (
          <EditorialImageFrame
            image={image}
            className={`${isCollections ? "aspect-[4/5]" : editorial.treatment === "craft" ? "aspect-[5/6]" : "aspect-[4/3]"} ${imageFirst ? "lg:order-1" : ""}`}
          />
        ) : null}
      </div>
    </section>
  );
}

function RelatedReading({ article }: { article: JournalArticle }) {
  const related = journalArticles.filter((candidate) => candidate.slug !== article.slug);

  return (
    <section className="border-t border-copy/12 pt-8 md:pt-10">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">From the Journal</p><h2 className="mt-2 font-display text-3xl leading-none text-copy">Related Reading</h2></div><Link href="/journal" className="gold-focus inline-flex min-h-10 items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy">All articles <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        {related.map((relatedArticle) => (
          <Link key={relatedArticle.slug} href={`/journal/${relatedArticle.slug}`} className="gold-focus group grid grid-cols-[6rem_1fr] overflow-hidden border border-copy/12 bg-[#fbf8f1]/80 transition hover:border-gold/60">
            <div className="relative min-h-28 overflow-hidden"><Image src={relatedArticle.image} alt={relatedArticle.imageAlt} fill sizes="96px" className="object-cover object-top transition duration-500 motion-safe:group-hover:scale-[1.035]" /></div>
            <div className="flex min-w-0 flex-col justify-between p-3"><p className="text-[8px] font-semibold uppercase tracking-[0.14em] text-gold">{relatedArticle.category}</p><h3 className="mt-2 font-display text-lg leading-[1.02] text-copy">{relatedArticle.title}</h3><span className="mt-3 inline-flex items-center gap-1 text-[9px] font-semibold uppercase tracking-[0.1em] text-copy-muted">Read article <ArrowRight className="h-3 w-3" /></span></div>
          </Link>
        ))}
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
    <main className="relative overflow-x-hidden bg-[linear-gradient(180deg,#f8f4eb_0%,#f3ebde_50%,#faf7ef_100%)] pt-[104px] text-copy">
      <section className="container-luxe relative py-8 md:py-11 lg:py-14">
        <Link href="/journal" className="gold-focus inline-flex min-h-10 items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy"><ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />Back to Journal</Link>
        <div className="mt-6 overflow-hidden border border-copy/12 bg-[#fbf8f1]/70 shadow-[0_20px_55px_rgba(57,42,24,0.08)] lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(23rem,0.78fr)]">
          <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12">
            <div>
              <p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">{article.category}</p>
              <h1 className="mt-4 max-w-3xl font-display text-[2.7rem] leading-[0.92] tracking-[-0.035em] text-copy sm:text-6xl xl:text-[4.7rem]">{article.title}</h1>
              <p className="mt-5 max-w-xl text-[15px] leading-6 text-copy-muted md:text-base md:leading-7">{article.subtitle}</p>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-copy/12 pt-4 text-[9px] font-semibold uppercase tracking-[0.12em] text-copy-muted"><span>ỌNUỌRA Journal</span><span aria-hidden="true">•</span><span>Editorial Feature</span><span aria-hidden="true">•</span><span>By the House of ỌNUỌRA</span></div>
          </div>
          <EditorialImageFrame image={{ src: article.image, alt: article.imageAlt, position: "object-top" }} className="aspect-[4/3] min-h-[18rem] border-t border-copy/12 lg:min-h-[32rem] lg:border-l lg:border-t-0" />
        </div>
      </section>

      <article className="relative border-y border-copy/12 bg-[#fbf8f1]/54 py-9 md:py-12 lg:py-14">
        <div aria-hidden="true" className="pointer-events-none absolute right-3 top-16 z-0 h-24 w-24 opacity-[0.09] sm:right-8 sm:h-32 sm:w-32 xl:right-[5%] xl:top-28 xl:h-48 xl:w-48"><Image src="/brand/onuora-mark-gold.png" alt="" fill sizes="192px" className="object-contain" /></div>
        <div className="container-luxe relative z-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_13.5rem] lg:gap-11">
          <div className="min-w-0 space-y-9 md:space-y-11">
            <section id={sectionId(opening, 0)} className="scroll-mt-32 border-b border-copy/12 pb-9 md:pb-11">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(17rem,0.65fr)] lg:items-start lg:gap-9">
                <div className="max-w-2xl"><ArticleCopy section={opening} sectionIndex={0} quote={editorial.quote} lead /></div>
                <EditorialImageFrame image={editorial.introImage} className={editorial.treatment === "craft" ? "aspect-[5/4]" : "aspect-[4/5]"} />
              </div>
            </section>

            {article.sections.slice(1).map((section, index) => <MagazineSection key={section.heading ?? index} section={section} sectionIndex={index + 1} editorial={editorial} />)}
            <RelatedReading article={article} />
          </div>
          <ArticleContents article={article} />
        </div>
      </article>

      <section className="border-t border-copy/12 bg-[#eee3d0]/58 py-9 md:py-11">
        <div className="container-luxe">
          <div className="flex flex-col gap-4 border-b border-copy/12 pb-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold">The Permanent Collections</p><h2 className="mt-2 font-display text-3xl leading-none text-copy md:text-4xl">Explore the Wardrobe</h2></div><Link href="/collection" className="gold-focus inline-flex min-h-10 items-center gap-2 text-[9px] font-semibold uppercase tracking-[0.12em] text-copy transition hover:text-gold">Explore all <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" /></Link></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3 md:mt-6 md:gap-4">
            {exploreCollections.map((collection) => <Link key={collection.href} href={collection.href} className="gold-focus group relative grid min-h-32 grid-cols-[7.5rem_1fr] overflow-hidden bg-obsidian text-ivory shadow-[0_12px_30px_rgba(36,26,15,0.12)] sm:block sm:min-h-0 sm:aspect-[4/5]"><div className="relative h-full min-h-32 overflow-hidden sm:absolute sm:inset-0"><Image src={collection.image} alt={collection.alt} fill sizes="(min-width: 640px) 30vw, 120px" className="object-cover object-top transition duration-500 motion-safe:group-hover:scale-[1.025]" /></div><div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-obsidian/80 via-obsidian/10 to-transparent" /><div className="relative z-10 flex min-w-0 items-end justify-between gap-3 p-3.5 sm:absolute sm:inset-x-0 sm:bottom-0 sm:p-4"><span className="text-sm font-semibold leading-5">{collection.name}</span><ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" /></div></Link>)}
          </div>
        </div>
      </section>

      <section className="border-t border-copy/10 bg-obsidian py-10 text-ivory md:py-12"><div className="container-luxe grid gap-6 md:grid-cols-[1fr_auto] md:items-end"><div><p className="text-[9px] font-semibold uppercase tracking-[0.16em] text-gold-soft">Client Services</p><h2 className="mt-3 font-display text-3xl leading-[1.02] md:text-4xl">A considered wardrobe begins with a conversation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/65">Our Client Services team is available for sizing, delivery and wardrobe guidance.</p></div><Link href="/contact" className="gold-focus inline-flex min-h-11 items-center justify-center gap-3 border border-gold/60 px-5 text-[9px] font-semibold uppercase tracking-[0.12em] text-gold-soft transition hover:bg-gold hover:text-obsidian">Contact Client Services <ArrowRight className="h-4 w-4" aria-hidden="true" /></Link></div></section>
    </main>
  );
}
