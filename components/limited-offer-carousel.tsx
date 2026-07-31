"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const campaignImages = [
  {
    src: "/brand/products/buttonless/nd1/nd1-studio-registered-source.png",
    alt: "Resort Collection studio portrait",
    className: "col-span-4 row-span-5 sm:col-span-5 sm:row-span-8"
  },
  {
    src: "/brand/products/buttonless/nd2/nd2-studio-registered-source.png",
    alt: "Resort Collection studio portrait",
    className: "col-span-2 row-span-3 sm:col-span-3 sm:row-span-4"
  },
  {
    src: "/brand/products/buttonless/nd3/nd3-angle.webp",
    alt: "Resort Collection outfit",
    className: "col-span-2 row-span-2 sm:col-span-4 sm:row-span-4"
  },
  {
    src: "/brand/products/button/ndb4/ndb4-mid.webp",
    alt: "Cowrie Collection outfit",
    className: "col-span-3 row-span-4 sm:col-span-4 sm:row-span-4"
  },
  {
    src: "/brand/products/button/ndb3/ndb3-angle.webp",
    alt: "Cowrie Collection outfit",
    className: "col-span-3 row-span-4 sm:col-span-3 sm:row-span-4"
  }
];

export function LimitedOfferCarousel() {
  return (
    <section className="relative overflow-hidden bg-obsidian text-white" aria-labelledby="offer-heading">
      <div className="grid h-[68svh] min-h-[560px] max-h-[760px] grid-cols-6 grid-rows-9 gap-1 p-1 sm:h-[70svh] sm:min-h-[600px] sm:grid-cols-12 sm:grid-rows-8">
        {campaignImages.map((image) => (
          <div key={image.src} className={`relative overflow-hidden bg-[#f3eee6] ${image.className}`}>
            <Image
              src={image.src}
              alt={image.alt}
              fill
              quality={92}
              sizes="(min-width: 640px) 42vw, 67vw"
              className="object-cover object-top"
            />
          </div>
        ))}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/88 via-black/20 to-black/5" />
      <div className="absolute inset-x-0 bottom-0">
        <div className="container-luxe pb-8 sm:pb-12">
          <div className="max-w-xl">
            <p className="text-[10px] font-semibold uppercase text-gold-soft">Designed in Nigeria</p>
            <h2 id="offer-heading" className="mt-2 text-3xl font-semibold leading-tight sm:text-4xl">
              Delivered Worldwide
            </h2>
            <p className="mt-3 text-sm text-white/72">Prepared for Dispatch Within Three Working Days</p>
            <div className="mt-5 border-l border-gold pl-4">
              <p className="text-lg font-semibold">Buy Two Outfits</p>
              <p className="mt-1 text-lg font-semibold text-gold-soft">Receive 50% Off a Third Outfit</p>
              <p className="mt-2 text-xs text-white/58">Shipping calculated separately</p>
            </div>
            <Link
              href="/collection"
              className="gold-focus mt-6 inline-flex min-h-11 items-center gap-3 border border-white/55 px-5 text-[10px] font-semibold uppercase transition hover:bg-white hover:text-black"
            >
              Explore Collections
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
