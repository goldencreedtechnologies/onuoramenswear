import Image from "next/image";
import Link from "next/link";

export const metadata = {
  title: "Our Story",
  description: "The House of ỌNUỌRA: philosophy, Nigerian craftsmanship and permanent collections."
};

const collections = [
  {
    igbo: "Nkwọ",
    title: "Heritage Collection",
    image: "/brand/products/original/aja/aja-front.png",
    href: "/collection/heritage",
    buttonLabel: "Explore Heritage"
  },
  {
    igbo: "Ọzọ",
    title: "Cowrie Collection",
    image: "/brand/products/button/ndb2/ndb2-studio-registered-source.png",
    href: "/collection/cowrie",
    buttonLabel: "Explore Cowrie"
  },
  {
    igbo: "Uzọ",
    title: "Resort Collection",
    image: "/brand/products/buttonless/nd3/nd3-angle.png",
    href: "/collection/resort",
    buttonLabel: "Explore Resort"
  }
];

function StoryMonogram({ side = "right" }: { side?: "left" | "right" }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute top-1/2 -z-10 -translate-y-1/2 select-none font-semibold leading-none ${side === "right" ? "-right-24 md:right-[2%]" : "-left-24 md:left-[2%]"}`}
      style={{ fontSize: "clamp(15rem,31vw,31rem)", color: "transparent", WebkitTextStroke: "1px rgba(101,67,33,0.09)" }}
    >
      Ọ
    </span>
  );
}

function FounderMonogramField() {
  const monograms = [
    "right-[4%] top-[7%] rotate-[-9deg] text-[11rem] opacity-[0.045] md:text-[14rem]",
    "right-[25%] top-[43%] rotate-[7deg] text-[5rem] opacity-[0.035] md:text-[7rem]",
    "-right-[16%] bottom-[-16%] rotate-[13deg] text-[19rem] opacity-[0.055] md:text-[27rem]"
  ];

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden select-none text-[#9f751d]">
      {monograms.map((className) => (
        <span key={className} className={`absolute font-semibold leading-none ${className}`}>
          Ọ
        </span>
      ))}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className="overflow-hidden bg-page pt-[104px] text-copy">
      <section className="relative min-h-[390px] overflow-hidden bg-obsidian text-white sm:min-h-[440px] md:min-h-[520px]">
        <Image
          src="/brand/story-header.png"
          alt="The ỌNUỌRA house wearing contemporary African menswear in Nigeria"
          fill
          priority
          quality={94}
          sizes="100vw"
          className="object-cover object-[68%_center] md:object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/76 via-black/34 to-black/12" />
        <div className="container-luxe relative flex min-h-[390px] items-end pb-8 sm:min-h-[440px] md:min-h-[520px] md:pb-12">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">OUR STORY</p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl md:text-6xl">
              The House of ỌNUỌRA
            </h1>
            <p className="mt-2 max-w-lg text-sm leading-6 text-white/72 sm:mt-3">
              Contemporary African menswear shaped by identity, intention and Nigerian authorship.
            </p>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden bg-[#f5e6c8] py-11 text-[#171717] md:py-20" aria-labelledby="founder">
        <FounderMonogramField />
        <div className="container-luxe relative z-10 grid min-w-0 gap-7 lg:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] lg:items-center lg:gap-14">
          <div className="relative mx-auto aspect-[4/5] w-full max-w-[34rem] min-w-0 overflow-hidden bg-surface-subtle lg:mx-0">
            <Image
              src="/brand/onuora.png"
              alt="Ọnụọra Abuah, founder of ỌNUỌRA Menswear"
              fill
              quality={94}
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="scale-[1.06] object-cover object-[center_46%]"
            />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-[#9f751d]">The Founder</p>
            <h2 id="founder" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              The Founder
            </h2>
            <p className="mt-4 text-sm leading-7 text-black/66">
              ỌNUỌRA was founded by Ọnụọra Abuah, a Nigerian filmmaker and creative director whose work has long explored African identity, history and cultural expression. The brand extends that same philosophy into contemporary menswear, creating garments that combine craftsmanship, confidence and cultural meaning.
            </p>
          </div>
        </div>
      </section>

      <div className="relative">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-[#f5e6c8]/15 to-[#f5e6c8]/45" />
      <section className="relative isolate overflow-hidden py-11 md:py-20" aria-labelledby="brand-philosophy">
        <StoryMonogram side="right" />
        <div className="container-luxe relative z-10 grid min-w-0 gap-9 lg:grid-cols-[0.78fr_1.22fr] lg:items-center lg:gap-14">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase text-gold">Brand Philosophy</p>
            <h2 id="brand-philosophy" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Meaning Before Garment
            </h2>
            <p className="mt-4 text-sm leading-7 text-copy-muted">
              ỌNUỌRA is a contemporary menswear house rooted in Nigerian craftsmanship, cultural identity and timeless design. Every garment is created with intention, from the choice of fabric to the final stitch—bringing together refined tailoring and African heritage in a modern wardrobe.
            </p>
          </div>
          <div className="relative min-h-[430px] min-w-0 sm:min-h-[520px] lg:min-h-[600px]">
            <div className="absolute inset-y-0 left-0 w-[78%] overflow-hidden bg-surface-subtle shadow-[0_24px_60px_rgba(42,32,19,0.12)]">
              <Image src="/brand/tailor.png" alt="ỌNUỌRA tailor hand-finishing a monogrammed garment" fill quality={94} sizes="(min-width: 1024px) 45vw, 78vw" className="object-cover object-center" />
            </div>
            <div className="absolute bottom-[5%] right-0 aspect-[4/3] w-[54%] overflow-hidden border-[7px] border-[#faf7f0] bg-surface-subtle shadow-[0_20px_50px_rgba(42,32,19,0.16)] sm:border-[10px]">
              <Image src="/brand/packaging.jpg" alt="ỌNUỌRA garments prepared in branded protective packaging" fill quality={92} sizes="(min-width: 1024px) 32vw, 54vw" className="object-cover object-center" />
            </div>
          </div>
        </div>
      </section>

      <section className="relative isolate overflow-hidden py-12 md:py-20" aria-labelledby="permanent-collections">
        <StoryMonogram side="left" />
        <div className="container-luxe relative z-10 min-w-0">
          <p className="text-[10px] font-semibold uppercase text-gold">The Permanent Collections</p>
          <h2 id="permanent-collections" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Three Collections. One Philosophy.
          </h2>
          <p className="mt-4 text-[10px] font-semibold uppercase tracking-[0.12em] text-copy-muted">
            Heritage <span aria-hidden="true">•</span> Cowrie <span aria-hidden="true">•</span> Resorts
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-copy-muted">
            Three distinct expressions of the same design philosophy, each created for different occasions while sharing one commitment to craftsmanship and contemporary African style.
          </p>
          <div className="mt-7 grid min-w-0 gap-3 sm:grid-cols-3 md:gap-5">
            {collections.map((collection) => (
              <div key={collection.title} className="min-w-0">
                <Link href={collection.href} className="gold-focus group relative block aspect-[4/5] overflow-hidden bg-surface-subtle">
                  <Image src={collection.image} alt={collection.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.015]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="text-[9px] font-semibold uppercase text-gold-soft">{collection.igbo}</p>
                    <h3 className="mt-1 text-xl font-semibold">{collection.title}</h3>
                  </div>
                </Link>
                <Link href={collection.href} className="gold-focus mt-3 inline-flex min-h-10 max-w-full items-center justify-center border border-copy/30 px-4 text-center text-[10px] font-semibold uppercase transition hover:border-gold hover:bg-gold hover:text-obsidian">
                  {collection.buttonLabel}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      </div>
    </main>
  );
}
