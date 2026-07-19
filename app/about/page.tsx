import Image from "next/image";
import { SectionHeading } from "@/components/section-heading";
import { craftSteps } from "@/data/catalog";

export const metadata = {
  title: "Heritage",
  description: "The story, craft, and stretch-fit philosophy behind ỌNUỌRA."
};

export default function AboutPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe grid gap-5 py-12 md:grid-cols-[0.9fr_1.1fr] md:items-end md:py-16">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Our heritage</p>
          <h1 className="font-display text-4xl leading-[0.94] text-balance md:text-5xl">The voice of the people, cut for now.</h1>
        </div>
        <p className="max-w-xl text-sm leading-7 text-copy-muted">
          ỌNUỌRA was created for men across Africa and the diaspora who want to dress sharply
          without rigid fabrics, repeated alterations, or compromise between culture and comfort.
        </p>
      </section>
      <section className="bg-obsidian py-12 text-ivory md:py-16">
        <div className="container-luxe">
          <SectionHeading eyebrow="Process" title="Craft is the quiet proof." light />
          <div className="grid gap-5 md:grid-cols-5">
            {craftSteps.map((step, index) => (
              <div key={step.label} className="rounded-[26px] border border-gold/20 p-5">
                <p className="text-xs font-bold text-gold-soft">0{index + 1}</p>
                <h2 className="mt-6 font-display text-2xl">{step.label}</h2>
                <p className="mt-3 text-sm leading-7 text-ivory/62">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="container-luxe grid gap-5 py-12 md:grid-cols-2 md:py-16">
        <Image
          src="https://onuoramenswear.com/wp-content/uploads/2025/12/onu-ora.png"
          alt="Onuora fabric and brand story"
          width={900}
          height={1100}
          className="min-h-[420px] rounded-[26px] object-cover"
        />
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Behind the fabric</p>
          <h2 className="font-display text-4xl leading-[1] md:text-5xl">Movement is part of the luxury.</h2>
          <p className="mt-5 text-sm leading-7 text-copy-muted">
            The stretch-fit idea is simple: a garment should hold its shape while allowing the
            body to breathe, sit, reach, walk, and arrive. That is the difference between costume
            and clothing you live in.
          </p>
        </div>
      </section>
    </main>
  );
}
