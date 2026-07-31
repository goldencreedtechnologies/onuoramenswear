"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { newArrivalsPromotion } from "@/data/phase-one-collections";

const OFFER_AUTO_OPENED_KEY = "onuora-current-offer-auto-opened";
const AUTO_OPEN_DELAY_MS = 8000;
const HOVER_OPEN_DELAY_MS = 650;

const campaignImages = [
  {
    src: "/brand/products/buttonless/nd1/nd1-studio-registered-source.png",
    alt: "Kharn wearing the cobalt Resort Collection set",
    className:
      "col-span-4 col-start-1 row-span-5 row-start-1 sm:col-span-5 sm:col-start-1 sm:row-span-8 sm:row-start-1"
  },
  {
    src: "/brand/products/buttonless/nd2/nd2-studio-registered-source.png",
    alt: "ỌNUỌRA Resort Collection studio portrait",
    className:
      "col-span-2 col-start-5 row-span-3 row-start-1 sm:col-span-3 sm:col-start-6 sm:row-span-4 sm:row-start-1"
  },
  {
    src: "/brand/products/buttonless/nd3/nd3-angle.webp",
    alt: "Burgundy Resort Collection outfit shown at an angle",
    className:
      "col-span-2 col-start-5 row-span-2 row-start-4 sm:col-span-4 sm:col-start-9 sm:row-span-4 sm:row-start-1"
  },
  {
    src: "/brand/products/button/ndb4/ndb4-mid.webp",
    alt: "Cowrie Collection outfit shown from mid length",
    className:
      "col-span-3 col-start-1 row-span-4 row-start-6 sm:col-span-4 sm:col-start-6 sm:row-span-4 sm:row-start-5"
  },
  {
    src: "/brand/products/button/ndb3/ndb3-angle.webp",
    alt: "Burgundy Cowrie Collection outfit shown at an angle",
    className:
      "col-span-3 col-start-4 row-span-4 row-start-6 sm:col-span-3 sm:col-start-10 sm:row-span-4 sm:row-start-5"
  }
];

export function LimitedOfferCarousel() {
  const [modalOpen, setModalOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoOpened = useRef(false);

  function clearHoverTimer() {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  }

  function clearAutoTimer() {
    if (autoTimer.current) {
      clearTimeout(autoTimer.current);
      autoTimer.current = null;
    }
  }

  function markAutoOpened() {
    autoOpened.current = true;
    clearAutoTimer();
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(OFFER_AUTO_OPENED_KEY, "true");
    }
  }

  function openAutomatically() {
    if (autoOpened.current) {
      return;
    }

    markAutoOpened();
    setModalOpen(true);
  }

  function openManually() {
    markAutoOpened();
    clearHoverTimer();
    setModalOpen(true);
  }

  function scheduleModal() {
    if (autoOpened.current || window.matchMedia("(hover: none)").matches) {
      return;
    }

    clearHoverTimer();
    hoverTimer.current = setTimeout(openAutomatically, HOVER_OPEN_DELAY_MS);
  }

  function leaveCampaign() {
    clearHoverTimer();
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleCampaignClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.closest("a, button")) {
      return;
    }
    openManually();
  }

  useEffect(() => {
    autoOpened.current = window.sessionStorage.getItem(OFFER_AUTO_OPENED_KEY) === "true";

    if (!autoOpened.current) {
      autoTimer.current = setTimeout(openAutomatically, AUTO_OPEN_DELAY_MS);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => {
      clearHoverTimer();
      clearAutoTimer();
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
        onClick={handleCampaignClick}
      >
        <div className="grid h-[76svh] min-h-[660px] max-h-[860px] grid-cols-6 grid-rows-9 gap-1 p-1 sm:h-[74svh] sm:min-h-[620px] sm:grid-cols-12 sm:grid-rows-8">
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
                sizes="(min-width: 640px) 42vw, 67vw"
                className="object-cover object-top transition duration-700 ease-out group-hover:brightness-[1.03]"
              />
            </div>
          ))}
        </div>

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/66 via-transparent to-black/5" />
        <div className="absolute inset-x-0 bottom-0">
          <div className="container-luxe flex items-end pb-8 sm:pb-10">
            <div className="text-white">
              <h2
                id="new-arrivals-heading"
                className="text-xl font-semibold uppercase sm:text-2xl"
              >
                Current Offer
              </h2>
              <button
                type="button"
                onClick={openManually}
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
            aria-label="Close Limited Offer"
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
              aria-label="Close Offer Details"
            >
              <X className="h-4 w-4" />
            </button>
            <p className="text-[10px] font-semibold uppercase text-[#a47a25]">Limited Offer</p>
            <h2
              id="limited-offer-title"
              className="mt-4 max-w-md text-3xl font-semibold leading-tight sm:text-4xl"
            >
              Buy Two Outfits And Receive 50% Off A Third Outfit.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-7 text-black/62">
              The discount applies to the lowest-priced qualifying outfit. Promotions do not stack, and shipping is excluded.
            </p>
            <Link
              href={newArrivalsPromotion.href}
              onClick={closeModal}
              className="gold-focus mt-8 inline-flex min-h-11 items-center justify-center gap-3 bg-black px-5 text-[10px] font-semibold uppercase text-white transition hover:bg-gold hover:text-black"
            >
              Shop Current Offer
              <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      ) : null}
    </>
  );
}
