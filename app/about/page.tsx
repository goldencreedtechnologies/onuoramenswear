import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, Scissors } from "lucide-react";

export const metadata = {
  title: "Our Story",
  description: "The House of ỌNUỌRA: philosophy, Nigerian craftsmanship and permanent collections."
};

const collections = [
  {
    igbo: "Nkwọ",
    title: "Heritage Collection",
    image: "/brand/products/original/aja/aja-front.webp",
    href: "/collection#original"
  },
  {
    igbo: "Ọzọ",
    title: "Cowrie Collection",
    image: "/brand/products/button/ndb2/ndb2-studio-registered-source.png",
    href: "/collection#with-button"
  },
  {
    igbo: "Uzọ",
    title: "Resort Collection",
    image: "/brand/products/buttonless/nd3/nd3-angle.webp",
    href: "/collection#without-button"
  }
];

export default function AboutPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="relative min-h-[390px] overflow-hidden bg-obsidian text-white sm:min-h-[440px] md:min-h-[520px]">
        <Image
          src="/brand/hero.jpg"
          alt="The ỌNUỌRA house wearing contemporary African menswear in Nigeria"
          fill
          priority
          quality={94}
          sizes="100vw"
          className="object-cover object-[50%_28%]"
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

      <section className="py-11 md:py-20" aria-labelledby="brand-philosophy">
        <div className="container-luxe grid gap-7 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-14">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">Brand Philosophy</p>
            <h2 id="brand-philosophy" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Meaning Before Garment.
            </h2>
            <div className="mt-4 grid gap-4 text-sm leading-7 text-copy-muted">
              <p>
                ỌNUỌRA is an Igbo expression of communal voice and identity. That idea guides a house where every line, colour and signature mark carries intention.
              </p>
              <p>
                We create for men who want cultural presence and contemporary clarity in the same wardrobe—pieces that feel considered at work, in transit and at celebration.
              </p>
            </div>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden bg-surface-subtle">
            <Image
              src="/brand/Founder-img.png"
              alt="Founder of ỌNUỌRA Menswear"
              fill
              quality={94}
              sizes="(min-width: 1024px) 52vw, 100vw"
              className="object-cover object-top"
            />
          </div>
        </div>
      </section>

      <section className="bg-obsidian py-12 text-ivory md:py-20" aria-labelledby="nigerian-craftsmanship">
        <div className="container-luxe">
          <header className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Nigerian Craftsmanship</p>
            <h2 id="nigerian-craftsmanship" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Craft Is The Quiet Proof.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/58">
              Each outfit is developed and finished in Nigeria with attention to proportion, construction and the details that make the house recognisable.
            </p>
          </header>
          <div className="mt-8 grid gap-px bg-white/12 sm:grid-cols-3">
            {[
              { icon: Scissors, title: "Considered Cut", copy: "Silhouettes are balanced for clarity, comfort and presence." },
              { icon: BadgeCheck, title: "Precise Finish", copy: "Seams, pockets and house marks are checked before dispatch." },
              { icon: Globe2, title: "Made For The World", copy: "Nigerian authorship expressed through a globally fluent wardrobe." }
            ].map((item) => {
              const Icon = item.icon;
              return (
                <article key={item.title} className="min-h-52 bg-obsidian p-6 md:p-8">
                  <Icon className="h-5 w-5 text-gold" />
                  <h3 className="mt-10 text-lg font-semibold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/55">{item.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20" aria-labelledby="permanent-collections">
        <div className="container-luxe">
          <p className="text-[10px] font-semibold uppercase text-gold">The Permanent Collections</p>
          <h2 id="permanent-collections" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
            Three Collections. One Philosophy.
          </h2>
          <div className="mt-7 grid gap-3 sm:grid-cols-3 md:gap-5">
            {collections.map((collection) => (
              <Link key={collection.title} href={collection.href} className="gold-focus group relative aspect-[4/5] overflow-hidden bg-surface-subtle">
                <Image src={collection.image} alt={collection.title} fill sizes="(min-width: 640px) 33vw, 100vw" className="object-cover object-top transition duration-700 group-hover:scale-[1.015]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                  <p className="text-[9px] font-semibold uppercase text-gold-soft">{collection.igbo}</p>
                  <h3 className="mt-1 text-xl font-semibold">{collection.title}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#f5e6c8] py-12 text-[#171717] md:py-20" aria-labelledby="worn-worldwide">
        <div className="container-luxe grid gap-7 md:grid-cols-[0.75fr_1.25fr] md:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#9f751d]">The House</p>
            <h2 id="worn-worldwide" className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Designed in Nigeria. Worn Worldwide.
            </h2>
          </div>
          <div>
            <p className="max-w-3xl text-base leading-8 text-black/66">
              From Lagos to London, Accra to New York, ỌNUỌRA belongs in wardrobes shaped by movement, ceremony and modern African confidence.
            </p>
            <Link href="/collection" className="gold-focus mt-7 inline-flex min-h-12 items-center gap-3 bg-obsidian px-6 text-[10px] font-semibold uppercase text-white transition hover:bg-gold hover:text-obsidian">
              Explore Collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
