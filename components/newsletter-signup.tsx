"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/cn";

const dismissedKey = "onuora-circle-dismissed-until-2026-v3";
const seenKey = "onuora-circle-seen-2026-v3";
const dismissalDuration = 14 * 24 * 60 * 60 * 1000;

type NewsletterFormProps = {
  variant?: "light" | "dark";
  compact?: boolean;
  onSuccess?: () => void;
};

export function NewsletterForm({
  variant = "light",
  compact = false,
  onSuccess
}: NewsletterFormProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("loading");
    setMessage("");

    const response = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: String(form.get("email") ?? ""),
        country: String(form.get("country") ?? ""),
        source: compact ? "modal" : "homepage"
      })
    });
    const result = await response.json().catch(() => null);

    if (!response.ok) {
      setStatus("error");
      setMessage(result?.error ?? "Unable to join right now. Please try again.");
      return;
    }

    event.currentTarget.reset();
    setStatus("success");
    setMessage("Welcome to the ỌNUỌRA Circle.");
    onSuccess?.();
  }

  const fieldClass = cn(
    "gold-focus min-h-12 border px-4 text-sm outline-none transition",
    variant === "dark"
      ? "border-white/25 bg-transparent text-white placeholder:text-white/42 focus:border-gold"
      : "border-line bg-page text-copy placeholder:text-copy-muted/60 focus:border-copy"
  );

  if (status === "success") {
    return (
      <div className="flex min-h-12 items-center gap-3 text-sm" role="status">
        <Check className="h-4 w-4 text-gold" />
        {message}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3" aria-label="Join the ỌNUỌRA Circle">
      <div className={cn("grid gap-3", !compact && "sm:grid-cols-2")}>
        <label className="sr-only" htmlFor={compact ? "circle-modal-email" : "circle-email"}>
          Email
        </label>
        <input
          id={compact ? "circle-modal-email" : "circle-email"}
          name="email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          required
          className={fieldClass}
        />
        <label className="sr-only" htmlFor={compact ? "circle-modal-country" : "circle-country"}>
          Country or region
        </label>
        <input
          id={compact ? "circle-modal-country" : "circle-country"}
          name="country"
          autoComplete="country-name"
          placeholder="Country / Region"
          required
          className={fieldClass}
        />
      </div>
      <button
        type="submit"
        disabled={status === "loading"}
        className={cn(
          "gold-focus inline-flex min-h-12 items-center justify-center gap-3 px-5 text-[10px] font-semibold uppercase transition disabled:cursor-not-allowed disabled:opacity-55",
          variant === "dark"
            ? "bg-white text-black hover:bg-gold"
            : "bg-obsidian text-white hover:bg-gold hover:text-obsidian"
        )}
      >
        {status === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Join The Circle
        {status !== "loading" ? <ArrowRight className="h-4 w-4" /> : null}
      </button>
      {status === "error" ? (
        <p className={cn("text-xs", variant === "dark" ? "text-gold-soft" : "text-wine")} role="alert">
          {message}
        </p>
      ) : null}
    </form>
  );
}

export function NewsletterModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const dismissedUntil = Number(window.localStorage.getItem(dismissedKey) ?? 0);
    if (
      dismissedUntil > Date.now() ||
      window.sessionStorage.getItem(seenKey) === "true"
    ) {
      return;
    }

    let shown = false;
    const show = () => {
      if (shown) return;
      shown = true;
      window.sessionStorage.setItem(seenKey, "true");
      setOpen(true);
      window.removeEventListener("scroll", handleScroll);
    };
    const handleScroll = () => {
      if (window.scrollY > Math.min(480, window.innerHeight * 0.35)) show();
    };
    const timer = window.setTimeout(show, 6000);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  function dismiss() {
    window.localStorage.setItem(dismissedKey, String(Date.now() + dismissalDuration));
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={dismiss}
        aria-label="Close newsletter"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="circle-modal-title"
        className="relative w-full max-w-md bg-page p-7 text-copy shadow-2xl sm:p-9"
      >
        <button
          type="button"
          onClick={dismiss}
          className="gold-focus absolute right-3 top-3 grid h-10 w-10 place-items-center text-copy transition hover:bg-surface-subtle"
          aria-label="Close newsletter"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="text-[10px] font-semibold uppercase text-gold">Private Access</p>
        <h2 id="circle-modal-title" className="mt-3 pr-10 text-3xl font-semibold leading-tight">
          Join The ỌNUỌRA Circle.
        </h2>
        <p className="mt-4 text-sm leading-6 text-copy-muted">
          Receive private previews, fit notes, and first access to future releases.
        </p>
        <div className="mt-7">
          <NewsletterForm compact onSuccess={dismiss} />
        </div>
      </section>
    </div>
  );
}
