"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Cta } from "@/components/cta";

const HERO_VIDEO = "/brand/Hero%20Video.mp4";

export function HomepageHero() {
  const [videoReady, setVideoReady] = useState(false);
  const [videoActive, setVideoActive] = useState(false);
  const timerRef = useRef<number | null>(null);
  const waitingForVideoRef = useRef(false);

  useEffect(() => {
    const activate = () => {
      if (videoReady) {
        setVideoActive(true);
        return;
      }
      waitingForVideoRef.current = true;
    };

    timerRef.current = window.setTimeout(activate, 8000);
    return () => {
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
    };
  }, [videoReady]);

  function handleVideoReady() {
    setVideoReady(true);
    if (waitingForVideoRef.current) setVideoActive(true);
  }

  return (
    <section className="relative min-h-[min(560px,calc(100svh-100px))] overflow-hidden bg-[#f4eee6] text-[#171717] sm:min-h-[min(680px,calc(100svh-72px))] md:min-h-[min(820px,calc(100svh-72px))]">
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/brand/final-hero.png"
          alt="ỌNUỌRA models wearing contemporary African menswear"
          fill
          priority
          quality={95}
          sizes="100vw"
          className="home-hero-image object-cover object-[72%_center] sm:object-cover sm:object-[50%_16%]"
        />
        <video
          className={`home-hero-video absolute inset-0 h-full w-full object-cover object-[72%_center] sm:object-[50%_16%] ${videoActive ? "opacity-100" : "opacity-0"}`}
          src={HERO_VIDEO}
          muted
          autoPlay={videoActive}
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          onCanPlay={handleVideoReady}
        />
        <div className={`absolute inset-0 bg-black/24 transition-opacity duration-700 ${videoActive ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,232,0)_0%,rgba(247,243,232,.05)_42%,rgba(247,243,232,.58)_78%,rgba(247,243,232,.82)_100%)] sm:bg-[linear-gradient(90deg,rgba(247,243,232,.62)_0%,rgba(247,243,232,.24)_36%,rgba(247,243,232,0)_64%)]" />
        <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/28 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-white via-white/55 to-transparent sm:hidden" aria-hidden="true" />
      </div>

      <div className="container-luxe relative flex min-h-[min(560px,calc(100svh-100px))] items-end pb-6 pt-32 sm:min-h-[min(680px,calc(100svh-72px))] sm:pb-10 md:min-h-[min(820px,calc(100svh-72px))] md:pb-14">
        <div className="max-w-xl">
          <p className="text-[10px] font-semibold uppercase text-[#9f751d]">Designed And Made In Nigeria</p>
          <h1 className="mt-1.5 text-4xl font-semibold leading-[1.04] text-balance sm:text-5xl md:text-6xl">
            Contemporary African Menswear
          </h1>
          <p className="mt-3 max-w-md text-sm leading-6 text-black/68 sm:mt-4">
            Designed With Purpose. Crafted To Last.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 sm:mt-7">
            <Cta href="/collection" variant="dark">
              Explore Collections
            </Cta>
            <Cta href="/about" variant="ghost">
              Our Story
            </Cta>
          </div>
        </div>
      </div>

      <Link href="/collection" className="sr-only focus:not-sr-only">Explore Collections</Link>
    </section>
  );
}
