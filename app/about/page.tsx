import Image from "next/image";
import { ArrowRight, Globe2, Move3D, Scissors, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { craftSteps } from "@/data/catalog";

export const metadata = {
  title: "Our Heritage",
  description: "The story, mission, craft, and stretch-fit philosophy behind ỌNUỌRA."
};

const principles = [
  {
    icon: Scissors,
    title: "African craft",
    text: "Made in Nigeria with a clear respect for line, finish, and the meaning carried by dress."
  },
  {
    icon: Move3D,
    title: "Freedom in form",
    text: "Stretch construction keeps the silhouette composed while the body remains free."
  },
  {
    icon: Globe2,
    title: "A global wardrobe",
    text: "Designed for men moving between cultures, cities, ceremonies, and everyday life."
  },
  {
    icon: ShieldCheck,
    title: "Considered finish",
    text: "Every garment is inspected so the house signature arrives with confidence."
  }
];

export default function AboutPage() {
  return (
    <main className="bg-page pt-[104px] text-copy">
      <section className="relative min-h-[690px] overflow-hidden bg-obsidian text-white md:min-h-[760px]">
        <Image
          src="/brand/Heritage.jpg"
          alt="The ỌNUỌRA house wearing contemporary African menswear in Nigeria"
          fill
          priority
          loading="eager"
          quality={94}
          sizes="100vw"
          className="object-cover object-[50%_25%]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/26 to-black/8" />
        <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-white/16 to-transparent" />
        <div className="container-luxe relative flex min-h-[690px] items-end pb-12 md:min-h-[760px] md:pb-16">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Our Heritage</p>
            <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
              The Voice Of The People, Cut For Now.
            </h1>
            <p className="mt-4 max-w-lg text-sm leading-6 text-white/72">
              ỌNUỌRA creates for men across Africa and the diaspora who refuse to choose between
              cultural presence, modern comfort, and a global point of view.
            </p>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-luxe grid gap-9 md:grid-cols-[0.72fr_1.28fr] md:gap-16">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">Brand Story</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Meaning Before Garment.
            </h2>
          </div>
          <div className="grid gap-5 text-sm leading-7 text-copy-muted sm:grid-cols-2">
            <p>
              ỌNUỌRA is an Igbo expression of communal voice and identity. That idea guides a
              house where every name, colour, and gold mark carries intention before it becomes
              clothing.
            </p>
            <p>
              The original silhouette brought the visual authority of African occasion wear into
              an easier stretch-tailored form. The Cowrie and Resort collections extend that language through structured and
              collarless silhouettes made for contemporary movement.
            </p>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-panel-muted py-12 md:py-16">
        <div className="container-luxe">
          <header className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold">About ỌNUỌRA</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Identity Should Move With The Body.
            </h2>
          </header>
          <div className="mt-9 grid gap-px bg-line sm:grid-cols-2 lg:grid-cols-4">
            {principles.map((principle) => {
              const Icon = principle.icon;
              return (
                <article key={principle.title} className="min-h-56 bg-page p-6">
                  <Icon className="h-5 w-5 text-gold" aria-hidden="true" />
                  <h3 className="mt-10 text-lg font-semibold">{principle.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-copy-muted">{principle.text}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-luxe grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-stretch">
          <div className="relative min-h-[500px] overflow-hidden bg-surface-subtle">
            <Image
              src="/brand/founder.png"
              alt="The Founder Of ỌNUỌRA Menswear"
              fill
              quality={94}
              sizes="(min-width: 1024px) 55vw, 100vw"
              className="object-cover object-top"
            />
          </div>
          <div className="flex flex-col justify-center bg-obsidian p-7 text-ivory sm:p-10 lg:p-12">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">From The Founder</p>
            <blockquote className="mt-5 text-2xl font-semibold leading-snug sm:text-3xl">
              “We are building more than an outfit. We are giving modern men a way to wear where
              they come from without compromising how they need to move.”
            </blockquote>
            <p className="mt-6 text-sm leading-7 text-white/58">
              The house is led by a belief that African design can be culturally rooted,
              technically modern, and internationally fluent at the same time.
            </p>
          </div>
        </div>
      </section>

      <section className="bg-[#f5e6c8] py-14 text-[#171717] md:py-20">
        <div className="container-luxe grid gap-8 md:grid-cols-[0.7fr_1.3fr] md:items-start">
          <div>
            <p className="text-[10px] font-semibold uppercase text-[#9f751d]">Our Mission</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">Carry Heritage Forward.</h2>
          </div>
          <p className="max-w-3xl text-base leading-8 text-black/66">
            To create precise, comfortable menswear that strengthens confidence, celebrates
            African authorship, supports skilled making at home, and belongs naturally in wardrobes
            from Lagos to London, New York, Paris, and beyond.
          </p>
        </div>
      </section>

      <section className="bg-obsidian py-14 text-ivory md:py-20">
        <div className="container-luxe">
          <header className="mb-8 max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Craftsmanship</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight md:text-4xl">
              Craft Is The Quiet Proof.
            </h2>
          </header>
          <div className="grid gap-px bg-white/12 md:grid-cols-3">
            {craftSteps.slice(0, 3).map((step, index) => (
              <article key={step.label} className="min-h-64 bg-obsidian p-7">
                <p className="text-[10px] font-semibold text-gold">0{index + 1}</p>
                <h3 className="mt-16 text-xl font-semibold">{step.label}</h3>
                <p className="mt-3 text-sm leading-6 text-white/55">{step.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-px grid gap-px bg-white/12 md:grid-cols-2">
            {craftSteps.slice(3).map((step, index) => (
              <article key={step.label} className="min-h-56 bg-obsidian p-7">
                <p className="text-[10px] font-semibold text-gold">0{index + 4}</p>
                <h3 className="mt-14 text-xl font-semibold">{step.label}</h3>
                <p className="mt-3 max-w-lg text-sm leading-6 text-white/55">{step.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="container-luxe flex flex-col items-start justify-between gap-6 border-b border-line pb-10 sm:flex-row sm:items-end">
          <div className="max-w-2xl">
            <p className="text-[10px] font-semibold uppercase text-gold">The next chapter</p>
            <h2 className="mt-3 text-3xl font-semibold leading-tight">
              Choose The Silhouette That Speaks For You.
            </h2>
          </div>
          <Link
            href="/collection"
            className="gold-focus inline-flex min-h-11 items-center gap-3 bg-obsidian px-5 text-[10px] font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
          >
            Explore the Collection
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </main>
  );
}
