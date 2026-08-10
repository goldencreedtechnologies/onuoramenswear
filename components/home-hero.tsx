"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Cta } from "@/components/cta";

export function HomeHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const videoActive = videoReady;

  useEffect(() => {
    if (!videoActive) return;
    void videoRef.current?.play().catch(() => undefined);
  }, [videoActive]);

  return (
    <section
      data-home-hero
      data-video-active={videoActive}
      className="relative min-h-[400px] overflow-hidden bg-[#f4eee6] text-[#171717] sm:min-h-[680px] md:min-h-[820px]"
    >
      <Image
        src="/brand/final-hero.png"
        alt="ỌNUỌRA models wearing contemporary African menswear"
        fill
        priority
        quality={95}
        sizes="100vw"
        className={`home-hero-image object-contain object-[center_86px] transition-opacity duration-700 ease-out sm:object-cover sm:object-[50%_16%] ${videoActive ? "opacity-0" : "opacity-100"}`}
      />
      <video
        ref={videoRef}
        aria-hidden="true"
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        onCanPlay={() => setVideoReady(true)}
        className={`home-hero-video pointer-events-none absolute inset-0 h-full w-full object-contain object-[center_86px] transition-opacity duration-700 ease-out sm:object-cover sm:object-[50%_center] ${videoActive ? "opacity-100" : "opacity-0"}`}
      >
          <source src="/brand/hero-video.mp4" type="video/mp4" />
      </video>
      <div className={`home-hero-video-overlay pointer-events-none absolute inset-0 bg-gradient-to-b from-black/34 via-black/28 to-black/48 transition-opacity duration-700 ease-out ${videoActive ? "opacity-100" : "opacity-0"}`} />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[58%] bg-gradient-to-t from-white/90 via-white/42 to-transparent sm:hidden" />
      <div className={`home-hero-light-gradient pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(247,243,232,0)_0%,rgba(247,243,232,.05)_42%,rgba(247,243,232,.58)_78%,rgba(247,243,232,.82)_100%)] transition-opacity duration-700 ease-out sm:bg-[linear-gradient(90deg,rgba(247,243,232,.62)_0%,rgba(247,243,232,.24)_36%,rgba(247,243,232,0)_64%)] ${videoActive ? "opacity-0" : "opacity-100"}`} />
      <div className="home-hero-top-gradient pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-white/28 to-transparent" />
      <div className="container-luxe relative z-10 flex min-h-[400px] items-end pb-6 pt-32 sm:min-h-[680px] sm:pb-10 md:min-h-[820px] md:pb-14">
        <div className={videoActive ? "w-full max-w-xl text-left text-white sm:w-auto" : "w-full max-w-xl text-left sm:w-auto"}>
          <p className={`text-[10px] font-semibold uppercase ${videoActive ? "text-gold-soft" : "text-[#9f751d]"}`}>Designed And Made In Nigeria</p>
          <h1 className={`mt-1.5 text-4xl font-semibold leading-[1.04] text-balance sm:text-5xl md:text-6xl ${videoActive ? "text-white" : "text-[#171717]"}`}>
            Contemporary African Menswear
          </h1>
          <p className={`mt-2 max-w-md text-sm leading-6 sm:mt-4 ${videoActive ? "text-white/82" : "text-black/68"}`}>
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
    </section>
  );
}
