"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { newArrivalsPromotion } from "@/data/phase-one-collections";

const campaignImages = [
  {
    src: "/brand/products/buttonless/nd1/nd1-studio-registered.webp",
    alt: "Kharn wearing the cobalt buttonless New Design",
    className:
      "col-span-7 col-start-1 row-span-6 row-start-1 sm:col-span-5 sm:col-start-1"
  },
  {
    src: "/brand/products/button/ndb2/ndb2-studio-registered.webp",
    alt: "Edson wearing the earth button New Design",
    className:
      "col-span-5 col-start-8 row-span-3 row-start-1 sm:col-span-3 sm:col-start-6"
  },
  {
    src: "/brand/products/buttonless/nd3/nd3-studio-registered.webp",
    alt: "Charlie wearing the burgundy buttonless New Design",
    className:
      "col-span-5 col-start-8 row-span-3 row-start-4 sm:col-span-4 sm:col-start-9 sm:row-start-1"
  },
  {
    src: "/brand/products/button/ndb5/ndb5-studio-registered.webp",
    alt: "Idris wearing the royal purple button New Design",
    className:
      "hidden sm:col-span-7 sm:col-start-6 sm:row-span-3 sm:row-start-4 sm:block"
  }
];

export function LimitedOfferCarousel() {
  const [modalOpen, setModalOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissedDuringHover = useRef(false);

  function clearHoverTimer() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function scheduleModal() {
    if (dismissedDuringHover.current || window.matchMedia("(hover: none)").matches) {
      return;
    }

    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setModalOpen(true), 650);
  }

  function leaveCampaign() {
    clearHoverTimer();
    dismissedDuringHover.current = false;
  }

  function closeModal() {
    dismissedDuringHover.current = true;
    setModalOpen(false);
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearHoverTimer();
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <>
      <section
        className="relative overflow-hidden bg-obsidian"
        aria-labelledby="new-arrivals-heading"
        onMouseEnter={scheduleModal}
        onMouseLeave={leaveCampaign}
      >
        <div className="grid h-[66svh] min-h-[500px] max-h-[760px] grid-cols-12 grid-rows-6 gap-1 p-1 sm:min-h-[560px]">
          {campaignImages.map((image) => (
            <div
              key={image.src}
              className={`group relative overflow-hidden bg-[#f3eee6] ${image.className}`}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                quality={92}
                sizes="(min-width: 640px) 42vw, 60vw"
                className="object-cover object-top transition duration-700 ease-out group-hover:scale-[1.018]"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/5" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-luxe flex items-end pb-8 sm:pb-10">
            <div className="text-white">
              <h2
                id="new-arrivals-heading"
                className="text-xl font-semibold uppercase sm:text-2xl"
              >
                New Arrivals
              </h2>
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="gold-focus pointer-events-auto mt-3 inline-flex items-center gap-2 border-b border-white/70 pb-1 text-[10px] font-semibold uppercase transition hover:border-gold hover:text-gold"
              >
                Shop the Offer
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {modalOpen ? (
        <div className="fixed inset-0 z-[120] grid place-items-center p-4 sm:p-8">
          <button
            type="button"
            className="absolute inset-0 bg-black/58 backdrop-blur-sm"
            onClick={closeModal}
            aria-label="Close limited offer"
          />
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="limited-offer-title"
            className="relative w-full max-w-lg bg-[#f7f3e8] px-6 py-8 text-[#171717] shadow-2xl sm:px-10 sm:py-10"
          >
            <button
              type="button"
              onClick={closeModal}
              className="gold-focus absolute right-4 top-4 grid h-10 w-10 place-items-center border border-black/20 transition hover:border-black hover:bg-black hover:text-white"
              aria-label="Close offer details"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-semibold uppercase text-[#a47a25]">Limited Offer</p>
            <h2
              id="limited-offer-title"
              className="mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl"
            >
              Buy any 2 outfits and get 50% off the 3rd.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-black/62">
              Offer repeats on every eligible order with discounts automatically applied before
              payment.
            </p>
            <Link
              href={newArrivalsPromotion.href}
              onClick={closeModal}
              className="gold-focus mt-8 inline-flex min-h-11 items-center justify-center gap-3 bg-black px-5 text-[10px] font-semibold uppercase text-white transition hover:bg-gold hover:text-black"
            >
              Shop New Designs
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      ) : null}
    </>
  );
}
