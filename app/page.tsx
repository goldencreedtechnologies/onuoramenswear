import { BrandIcon } from "@/components/brand-icon";
import { Cta } from "@/components/cta";
import { EditorialLookbookCarousel } from "@/components/editorial-lookbook-carousel";
import { ProductCard } from "@/components/product-card";
import { SectionHeading } from "@/components/section-heading";
import { craftSteps, journalPosts, trustSignals, valuePillars } from "@/data/catalog";
import { getStoreProducts } from "@/lib/backend/catalog";

const iconMap = ["heritage", "stretch", "shipping", "limited"] as const;
const trustIconMap = ["secure", "shipping", "craft", "stretch", "fabric"] as const;

export default async function HomePage() {
  const products = await getStoreProducts();

  return (
    <main className="bg-page text-copy">
      <section className="grain relative isolate min-h-[86svh] overflow-hidden bg-obsidian pt-28 text-ivory">
        <div
          className="absolute inset-0 -z-10 bg-cover bg-[center_28%] opacity-72"
          style={{
            backgroundImage:
              "linear-gradient(90deg, rgb(31 31 31 / 92%), rgb(31 31 31 / 56%) 48%, rgb(31 31 31 / 16%)), url('https://onuoramenswear.com/wp-content/uploads/2025/11/97495CD6-4501-4C8D-BAC1-E73430AAE7D2-scaled.jpg')"
          }}
        />
        <div className="container-luxe grid min-h-[calc(86svh-7rem)] items-end gap-5 pb-10 md:grid-cols-[minmax(0,1fr)_260px]">
          <div className="max-w-3xl pb-4">
            <h1 className="reveal reveal-delay-1 font-display text-4xl leading-[0.96] text-balance md:text-5xl lg:text-6xl">
              Shop Nigerian-Made Stretch Menswear.
            </h1>
            <p className="reveal reveal-delay-2 mt-6 max-w-xl text-sm leading-7 text-ivory/76 md:mt-8 md:text-base">
              Onuora brings heritage, stretch-fit comfort, and modern masculine presence into one
              clean silhouette. Handmade in Nigeria, refined for the global wardrobe.
            </p>
            <div className="reveal reveal-delay-3 mt-8 flex flex-wrap gap-3">
              <Cta href="/collections">Shop the collection</Cta>
              <Cta href="/about" variant="ghost">Discover the craft</Cta>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-gold/15 bg-panel py-0">
        <div className="container-luxe grid divide-y divide-gold/15 md:grid-cols-4 md:divide-x md:divide-y-0">
          {valuePillars.map((pillar, index) => (
            <div key={pillar.title} className="rounded-[26px] p-5">
              <BrandIcon type={iconMap[index]} className="mb-5 h-8 w-8" />
              <h2 className="text-sm font-bold uppercase tracking-[0] text-copy">{pillar.title}</h2>
              <p className="mt-3 text-sm leading-7 text-copy-muted">{pillar.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-page py-12 md:py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Featured collections"
            title="Six signatures. One inheritance."
            copy="Each edition carries a name, a color story, and a modern masculine mood."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {products.slice(0, 6).map((product, index) => (
              <ProductCard key={product.slug} product={product} priority={index < 2} />
            ))}
          </div>
        </div>
      </section>

      <section className="overflow-hidden bg-obsidian py-3 text-ivory">
        <div className="marquee-track flex w-[200%] gap-5 whitespace-nowrap text-xs font-bold uppercase tracking-[0] text-gold-soft/85">
          {Array.from({ length: 2 }).map((_, loop) => (
            <div key={loop} className="flex gap-5">
              <span>Handmade in Nigeria</span>
              <span>Premium stretch tailoring</span>
              <span>Limited runs</span>
              <span>Global dispatch</span>
              <span>Modern African luxury</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe grid gap-5 md:grid-cols-[0.9fr_1.1fr] md:items-center">
          <div className="min-h-[420px] rounded-[26px] bg-cover bg-[center_35%]" style={{ backgroundImage: "url('https://onuoramenswear.com/wp-content/uploads/2025/11/IMG_5179-scaled-e1764315433440.png')" }} />
          <div>
            <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">The craftsmanship process</p>
            <h2 className="font-display text-4xl leading-[0.96] text-balance md:text-5xl">Cut for heritage. Engineered for movement.</h2>
            <p className="mt-5 max-w-xl text-sm leading-7 text-ivory/70">
              Onuora begins with the familiar elegance of African menswear, then removes the discomfort:
              breathable stretch fabric, clean proportion, gold embroidery, and a silhouette that moves
              through ceremony, work, travel, and evening.
            </p>
            <div className="mt-7 grid gap-4 md:grid-cols-3">
              {craftSteps.slice(0, 3).map((step, index) => (
                <div key={step.label} className="rounded-[26px] border border-gold/20 p-5 md:min-h-[190px]">
                  <BrandIcon type={index === 1 ? "fabric" : index === 2 ? "craft" : "heritage"} className="mb-5 h-7 w-7" />
                  <span className="text-xs font-bold text-gold-soft">0{index + 1}</span>
                  <h3 className="mt-2 font-display text-2xl">{step.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-ivory/58">{step.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {craftSteps.slice(3).map((step, index) => (
                <div key={step.label} className="rounded-[26px] border border-gold/20 p-5 md:min-h-[180px]">
                  <BrandIcon type={index === 0 ? "craft" : "fabric"} className="mb-5 h-7 w-7" />
                  <span className="text-xs font-bold text-gold-soft">0{index + 4}</span>
                  <h3 className="mt-2 font-display text-2xl">{step.label}</h3>
                  <p className="mt-3 text-sm leading-6 text-ivory/58">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-panel-muted py-12 md:py-16">
        <div className="container-luxe">
          <EditorialLookbookCarousel products={products} />
        </div>
      </section>

      <section className="bg-page py-12 md:py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Client confidence"
            title="Luxury should feel certain before checkout."
            copy="Trust moves closer to the purchase moment with fit help, shipping clarity, and material proof."
          />
          <div className="grid gap-5 md:grid-cols-5">
            {trustSignals.map((signal, index) => (
              <div key={signal.title} className="rounded-[26px] border border-gold/20 bg-transparent p-5">
                <BrandIcon type={trustIconMap[index]} className="mb-8 h-8 w-8" />
                <p className="text-sm font-bold uppercase tracking-[0] text-copy">{signal.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe">
          <SectionHeading
            eyebrow="Journal"
            title="The house speaks beyond the product."
            copy="Editorial content builds authority, SEO depth, and emotional memory."
            light
          />
          <div className="grid gap-5 md:grid-cols-3">
            {journalPosts.map((post) => (
              <article key={post.title} className="rounded-[26px] border border-gold/15 p-5 transition hover:border-gold/60">
                <p className="mb-7 text-xs font-bold uppercase tracking-[0] text-gold-soft">{post.tag}</p>
                <h3 className="font-display text-3xl leading-tight">{post.title}</h3>
                <p className="mt-5 text-sm leading-7 text-ivory/62">{post.excerpt}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="grain relative overflow-hidden bg-obsidian py-14 text-ivory md:py-16">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-28"
          style={{ backgroundImage: "url('/brand/onuora-mark-gold.png')" }}
        />
        <div className="container-luxe relative max-w-3xl">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Onuora Circle</p>
          <h2 className="font-display text-4xl leading-[1] text-balance md:text-5xl">Step into the Circle.</h2>
          <p className="mt-5 text-sm leading-7 text-ivory/74 md:text-base">
            Early access to limited drops, private styling notes, member-only previews,
            and stories from the artisans shaping the next expression of African luxury.
          </p>
          <div className="mt-8">
            <Cta href="/contact">Join the Circle</Cta>
          </div>
        </div>
      </section>
    </main>
  );
}
