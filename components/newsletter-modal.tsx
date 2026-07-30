"use client";

import { FormEvent, useEffect, useState } from "react";
import { X } from "lucide-react";

const DISMISSAL_KEY = "onuora-newsletter-dismissed-until";
const DISMISSAL_DAYS = 14;

function dismissedUntil() {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(DISMISSAL_KEY) ?? 0);
}

export function NewsletterModal() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [country, setCountry] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");

  useEffect(() => {
    if (dismissedUntil() > Date.now()) return;

    let opened = false;
    const reveal = () => {
      if (opened || dismissedUntil() > Date.now()) return;
      opened = true;
      setOpen(true);
      window.removeEventListener("scroll", onScroll);
    };
    const onScroll = () => {
      if (window.scrollY > Math.min(360, window.innerHeight * 0.35)) reveal();
    };
    const timer = window.setTimeout(reveal, 6000);

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function dismiss() {
    const until = Date.now() + DISMISSAL_DAYS * 24 * 60 * 60 * 1000;
    window.localStorage.setItem(DISMISSAL_KEY, String(until));
    setOpen(false);
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country })
      });

      if (!response.ok) throw new Error("Unable to subscribe");
      setStatus("success");
      window.setTimeout(dismiss, 1400);
    } catch {
      setStatus("error");
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center p-4 sm:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={dismiss}
        aria-label="Close Newsletter"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="newsletter-title"
        className="relative w-full max-w-lg bg-[#f7f3e8] px-6 py-8 text-[#171717] shadow-2xl sm:px-10 sm:py-10"
      >
        <button
          type="button"
          onClick={dismiss}
          className="gold-focus absolute right-4 top-4 grid h-10 w-10 place-items-center border border-black/20 transition hover:border-black hover:bg-black hover:text-white"
          aria-label="Close Newsletter"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] font-semibold uppercase text-[#a47a25]">ỌNUỌRA Circle</p>
        <h2 id="newsletter-title" className="mt-4 text-3xl font-semibold leading-tight sm:text-4xl">
          Join The ỌNUỌRA Circle
        </h2>
        <p className="mt-4 max-w-md text-sm leading-7 text-black/62">
          Receive private previews, fit notes and first access to new releases.
        </p>
        <form onSubmit={submit} className="mt-7 grid gap-4">
          <label className="grid gap-2 text-[10px] font-semibold uppercase">
            Email
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="gold-focus h-12 border border-black/20 bg-transparent px-4 text-sm normal-case outline-none"
            />
          </label>
          <label className="grid gap-2 text-[10px] font-semibold uppercase">
            Country / Region
            <input
              type="text"
              required
              autoComplete="country-name"
              value={country}
              onChange={(event) => setCountry(event.target.value)}
              className="gold-focus h-12 border border-black/20 bg-transparent px-4 text-sm normal-case outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === "submitting" || status === "success"}
            className="gold-focus mt-2 min-h-12 bg-black px-5 text-xs font-semibold uppercase text-white transition hover:bg-gold hover:text-black disabled:opacity-60"
          >
            {status === "submitting" ? "Joining…" : status === "success" ? "Welcome To The Circle" : "Join The Circle"}
          </button>
          {status === "error" ? (
            <p className="text-xs text-wine">We could not save your details. Please try again.</p>
          ) : null}
        </form>
      </section>
    </div>
  );
}
