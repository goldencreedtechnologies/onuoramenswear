import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Globe2, PackageCheck } from "lucide-react";
import { newArrivalsPromotion } from "@/data/phase-one-collections";

const campaignImages = [
  {
    src: "/brand/products/buttonless/nd1/nd1-studio-registered.webp",
    alt: "Blue Resort Collection outfit",
    className: "col-span-7 row-span-6"
  },
  {
    src: "/brand/products/button/ndb2/ndb2-studio-registered.webp",
    alt: "Brown Cowrie Collection outfit",
    className: "col-span-5 row-span-3"
  },
  {
    src: "/brand/products/buttonless/nd3/nd3-studio-registered.webp",
    alt: "Burgundy Resort Collection outfit",
    className: "col-span-5 row-span-3"
  }
];

export function LimitedOfferCarousel() {
  return (
    <section className="bg-obsidian text-white" aria-labelledby="current-offer-heading">
      <div className="grid lg:grid-cols-[1.12fr_0.88fr]">
        <div className="grid min-h-[500px] grid-cols-12 grid-rows-6 gap-1 p-1 lg:min-h-[620px]">
          {campaignImages.map((image) => (
            <div key={image.src} className={`relative overflow-hidden bg-[#f3eee6] ${image.className}`}>
              <Image
                src={image.src}
                alt={image.alt}
                fill
                quality={92}
                sizes="(min-width: 1024px) 36vw, 60vw"
                className="object-contain object-center"
              />
            </div>
          ))}
        </div>

        <div className="flex items-center px-6 py-12 sm:px-10 lg:px-14 lg:py-16">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Current Offer</p>
            <h2 id="current-offer-heading" className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
              Buy Two.
              <span className="mt-1 block text-white/72">Receive 50% Off A Third Outfit.</span>
            </h2>
            <p className="mt-5 text-sm leading-7 text-white/58">
              The discount applies to the lowest-priced qualifying outfit. Promotions do not
              stack, and delivery is charged separately.
            </p>

            <div className="mt-8 grid gap-4 border-y border-white/14 py-6 sm:grid-cols-2">
              <div className="flex gap-3">
                <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-semibold uppercase">Three Working Days</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">Prepared for dispatch.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Globe2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
                <div>
                  <p className="text-xs font-semibold uppercase">Worldwide Delivery</p>
                  <p className="mt-1 text-xs leading-5 text-white/50">Tracked to supported destinations.</p>
                </div>
              </div>
            </div>

            <Link
              href={newArrivalsPromotion.href}
              className="gold-focus mt-8 inline-flex min-h-11 items-center gap-3 bg-white px-5 text-[10px] font-semibold uppercase text-black transition hover:bg-gold"
            >
              Shop The Offer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
