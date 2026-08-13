import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { notFound } from "next/navigation";
import { getJournalArticle, journalArticles, type JournalArticle } from "@/data/journal-articles";

type EditorialImage = { src: string; alt: string; position?: string };

type ArticleEditorial = {
  introImage: EditorialImage;
  sectionImages: EditorialImage[];
  quote: { section: number; paragraph: number };
  treatment: "identity" | "craft" | "collections";
};

const editorialTreatments: Record<string, ArticleEditorial> = {
  "new-language-contemporary-african-menswear": {
    treatment: "identity",
    introImage: { src: "/brand/products/original/ndu/ndu-lifestyle.png", alt: "ỌNUỌRA menswear in an editorial setting", position: "object-top" },
    sectionImages: [
      { src: "/brand/products/buttonless/nd3/nd3-front.png", alt: "ỌNUỌRA Resort Collection model", position: "object-top" },
      { src: "/brand/products/original/ndu/ndu-front.png", alt: "ỌNUỌRA Heritage Collection model", position: "object-top" }
    ],
    quote: { section: 1, paragraph: 7 }
  },
  "inside-making-onuora-outfit": {
    treatment: "craft",
    introImage: { src: "/brand/tailor 2.PNG", alt: "Tailor cutting fabric for an ỌNUỌRA garment", position: "object-center" },
    sectionImages: [
      { src: "/brand/tailor.png", alt: "Hand finishing an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/products/buttonless/nd3/nd3-detail.png", alt: "Detail of an ỌNUỌRA garment", position: "object-center" },
      { src: "/brand/new-product-b.png", alt: "ỌNUỌRA garment in an editorial setting", position: "object-top" }
    ],
    quote: { section: 1, paragraph: 6 }
  },
  "permanent-collections": {
    treatment: "collections",
    introImage: { src: "/brand/products/original/aja/ajah-grid.png", alt: "The ỌNUỌRA Permanent Collections", position: "object-center" },
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

function EditorialImageFrame({ image, className = "" }: { image: EditorialImage; className?: string }) {
  return (
    <figure className={`relative overflow-hidden bg-[#e9dfcf] ${className}`}>
      <Image src={image.src} alt={image.alt} fill sizes="(min-width: 1280px) 42vw, (min-width: 768px) 45vw, 38vw" className={`object-cover ${image.position ?? "object-center"}`} />
      <figcaption className="absolute bottom-0 left-0 bg-[#171717]/78 px-2.5 py-1.5 text-[7px] font-semibold uppercase tracking-[0.13em] text-[#f7f3e8]">ỌNUỌRA Menswear</figcaption>
    </figure>
  );
}

function ArticleCopy({
  section,
  sectionIndex,
  quote,
  lead = false,
  columns = false
}: {
  section: JournalArticle["sections"][number];
  sectionIndex: number;
  quote: ArticleEditorial["quote"];
  lead?: boolean;
  columns?: boolean;
}) {
  return (
    <div className={`text-[13px] leading-5 text-copy-muted sm:text-[14px] sm:leading-6 ${columns ? "lg:columns-2 lg:gap-8" : ""}`}>
      {section.paragraphs.map((paragraph, paragraphIndex) => {
        const isQuote = quote.section === sectionIndex && quote.paragraph === paragraphIndex;
        const isOpening = lead && paragraphIndex === 0;

        if (isQuote) {
          return <blockquote key={paragraphIndex} className="my-4 break-inside-avoid border border-gold/45 bg-[#f8f0e2] p-4 font-display text-xl leading-[1.12] text-copy sm:p-5 sm:text-2xl"><span className="mr-1 text-gold">“</span>{paragraph}<span className="ml-1 text-gold">”</span></blockquote>;
        }

        return <p key={paragraphIndex} className={`break-inside-avoid ${paragraphIndex === 0 ? "mt-0" : "mt-3"} ${isOpening ? "first-letter:float-left first-letter:mr-1.5 first-letter:font-display first-letter:text-5xl first-letter:leading-[0.72] first-letter:text-gold sm:first-letter:text-6xl" : ""}`}>{paragraph}</p>;
      })}
    </div>
  );
}

function MagazineSection({ section, sectionIndex, editorial }: { section: JournalArticle["sections"][number]; sectionIndex: number; editorial: ArticleEditorial }) {
  const image = editorial.sectionImages[sectionIndex - 1] ?? editorial.sectionImages.at(-1);
  const imageFirst = editorial.treatment === "craft" ? sectionIndex % 2 === 1 : sectionIndex % 2 === 0;
  const isCollections = editorial.treatment === "collections";

  return (
    <section className="border-t border-copy/12 pt-6 sm:pt-8">
      <div className={`grid grid-cols-[minmax(0,1fr)_7.5rem] items-start gap-4 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-6 lg:grid-cols-[minmax(0,1.18fr)_minmax(17rem,0.62fr)] lg:gap-9 ${imageFirst ? "lg:[&>*:first-child]:order-2" : ""}`}>
        <div className="min-w-0">
          {section.heading ? <><div className="flex items-center gap-2.5"><span className="text-[8px] font-semibold tracking-[0.16em] text-gold">{String(sectionIndex).padStart(2, "0")}</span><span className="h-px w-8 bg-gold/80" /></div><h2 className={`${isCollections ? "text-3xl sm:text-4xl lg:text-5xl" : "text-2xl sm:text-3xl lg:text-[2.45rem]"} mt-2.5 font-display leading-[0.96] tracking-[-0.02em] text-copy`}>{section.heading}</h2></> : null}
          <div className={section.heading ? "mt-4" : ""}><ArticleCopy section={section} sectionIndex={sectionIndex} quote={editorial.quote} columns /></div>
        </div>
        {image ? <EditorialImageFrame image={image} className={`aspect-[3/4] min-h-36 sm:min-h-52 lg:min-h-[22rem] ${imageFirst ? "lg:order-1" : ""}`} /> : null}
      </div>
    </section>
  );
}

function CompactExplore() {
  return (
    <section className="border-t border-copy/12 pt-6 sm:pt-8">
      <div className="flex items-end justify-between gap-4"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold">The Permanent Collections</p><h2 className="mt-2 font-display text-2xl leading-none text-copy sm:text-3xl">Explore the Wardrobe</h2></div><Link href="/collection" className="gold-focus inline-flex min-h-9 items-center gap-1.5 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy">All collections <ArrowRight className="h-3.5 w-3.5" /></Link></div>
      <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
        {exploreCollections.map((collection) => <Link key={collection.href} href={collection.href} className="gold-focus group grid grid-cols-[3.75rem_1fr] overflow-hidden border border-copy/12 bg-[#f7f1e7] transition hover:border-gold/60 sm:grid-cols-[4.5rem_1fr]"><div className="relative min-h-[4.75rem] overflow-hidden"><Image src={collection.image} alt={collection.alt} fill sizes="72px" className="object-cover object-top transition duration-500 motion-safe:group-hover:scale-[1.03]" /></div><div className="flex min-w-0 items-center justify-between gap-1 p-2"><span className="text-[10px] font-semibold leading-3 text-copy sm:text-xs">{collection.name}</span><ArrowRight className="h-3 w-3 shrink-0 text-gold" /></div></Link>)}
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
      <section className="container-luxe py-7 sm:py-9 lg:py-11">
        <Link href="/journal" className="gold-focus inline-flex min-h-9 items-center gap-2 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy-muted transition hover:text-copy"><ArrowLeft className="h-3.5 w-3.5" />Back to Journal</Link>
        <div className="mt-5 overflow-hidden border border-copy/12 bg-[#fbf8f1]/75 shadow-[0_16px_45px_rgba(57,42,24,0.08)] lg:grid lg:grid-cols-[minmax(0,0.9fr)_minmax(24rem,0.8fr)]">
          <div className="flex min-w-0 flex-col justify-between p-6 sm:p-8 lg:p-10 xl:p-12"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold">{article.category}</p><h1 className="mt-3 max-w-3xl font-display text-[2.55rem] leading-[0.91] tracking-[-0.035em] text-copy sm:text-6xl xl:text-[4.65rem]">{article.title}</h1><p className="mt-4 max-w-xl text-[14px] leading-6 text-copy-muted sm:text-[15px]">{article.subtitle}</p></div><div className="mt-6 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 border-t border-copy/12 pt-3 text-[8px] font-semibold uppercase tracking-[0.12em] text-copy-muted"><span>ỌNUỌRA Journal</span><span aria-hidden="true">•</span><span>Editorial Feature</span><span aria-hidden="true">•</span><span>By the House of ỌNUỌRA</span></div></div>
          <EditorialImageFrame image={{ src: article.image, alt: article.imageAlt, position: "object-top" }} className="aspect-[4/3] min-h-[17rem] border-t border-copy/12 lg:min-h-[29rem] lg:border-l lg:border-t-0" />
        </div>
      </section>

      <article className="border-y border-copy/12 bg-[#fbf8f1]/54 py-7 sm:py-9 lg:py-11">
        <div className="container-luxe space-y-7 sm:space-y-9">
          <section className="grid grid-cols-[minmax(0,1fr)_7.5rem] items-start gap-4 border-b border-copy/12 pb-6 sm:grid-cols-[minmax(0,1fr)_11rem] sm:gap-6 sm:pb-8 lg:grid-cols-[minmax(0,1.18fr)_minmax(17rem,0.62fr)] lg:gap-9">
            <ArticleCopy section={opening} sectionIndex={0} quote={editorial.quote} lead columns />
            <EditorialImageFrame image={editorial.introImage} className="aspect-[3/4] min-h-36 sm:min-h-52 lg:min-h-[22rem]" />
          </section>
          {article.sections.slice(1).map((section, index) => <MagazineSection key={section.heading ?? index} section={section} sectionIndex={index + 1} editorial={editorial} />)}
          <CompactExplore />
        </div>
      </article>

      <section className="border-t border-copy/10 bg-obsidian py-9 text-ivory sm:py-10"><div className="container-luxe grid gap-5 sm:grid-cols-[1fr_auto] sm:items-end"><div><p className="text-[8px] font-semibold uppercase tracking-[0.16em] text-gold-soft">Client Services</p><h2 className="mt-2 font-display text-2xl leading-[1.02] sm:text-3xl">A considered wardrobe begins with a conversation.</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-ivory/65">Our Client Services team is available for sizing, delivery and wardrobe guidance.</p></div><Link href="/contact" className="gold-focus inline-flex min-h-10 items-center justify-center gap-2.5 border border-gold/60 px-4 text-[8px] font-semibold uppercase tracking-[0.12em] text-gold-soft transition hover:bg-gold hover:text-obsidian">Contact Client Services <ArrowRight className="h-3.5 w-3.5" /></Link></div></section>
    </main>
  );
}
