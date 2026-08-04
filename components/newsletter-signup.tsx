"use client";

import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";

const countries = [
  "Nigeria",
  "United Kingdom",
  "United States",
  "Canada",
  "Ghana",
  "South Africa",
  "France",
  "Germany",
  "Other"
];

type SubmissionState = "idle" | "submitting" | "submitted" | "error";

function SignupFields({ compact = false }: { compact?: boolean }) {
  const [state, setState] = useState<SubmissionState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const email = String(data.get("email") ?? "").trim();
    const country = String(data.get("country") ?? "").trim();
    if (!email || !country || state === "submitting") return;

    setState("submitting");
    setErrorMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, country })
      });
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result.error || "We could not save your signup. Please try again.");
      }

      window.sessionStorage.setItem("onuora-newsletter-seen", "true");
      setState("submitted");
      form.reset();
    } catch (error) {
      setState("error");
      setErrorMessage(error instanceof Error ? error.message : "We could not save your signup. Please try again.");
    }
  }

  if (state === "submitted") {
    return (
      <p className={cn("text-sm leading-6", compact ? "text-copy-muted" : "text-white/72")} role="status">
        Thank you. You are now part of the ỌNUỌRA Circle.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid w-full gap-3">
      <label className="grid gap-2 text-[9px] font-semibold uppercase tracking-[0.08em]">
        Email
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@example.com"
          className={cn(
            "min-h-12 w-full border px-4 text-sm font-normal normal-case outline-none",
            compact
              ? "border-line bg-page text-copy placeholder:text-copy-muted/60"
              : "border-white/24 bg-white/5 text-white placeholder:text-white/40"
          )}
        />
      </label>
      <label className="grid gap-2 text-[9px] font-semibold uppercase tracking-[0.08em]">
        Country
        <select
          name="country"
          required
          defaultValue=""
          className={cn(
            "min-h-12 w-full border px-4 text-sm font-normal normal-case outline-none",
            compact ? "border-line bg-page text-copy" : "border-white/24 bg-obsidian text-white"
          )}
        >
          <option value="" disabled>Select country</option>
          {countries.map((country) => (
            <option key={country} value={country}>{country}</option>
          ))}
        </select>
      </label>
      {state === "error" ? (
        <p className={cn("text-xs leading-5", compact ? "text-wine" : "text-gold-soft")} role="alert">
          {errorMessage}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={state === "submitting"}
        className={cn(
          "gold-focus min-h-12 w-full px-5 text-[10px] font-semibold uppercase transition disabled:cursor-wait disabled:opacity-60",
          compact
            ? "bg-obsidian text-white hover:bg-gold hover:text-obsidian"
            : "bg-gold text-obsidian hover:bg-white"
        )}
      >
        {state === "submitting" ? "Joining…" : "Join The Circle"}
      </button>
    </form>
  );
}

export function NewsletterForm() {
  return <SignupFields />;
}

export function NewsletterPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (pathname.startsWith("/checkout") || pathname.startsWith("/admin")) return;
    if (window.sessionStorage.getItem("onuora-newsletter-seen") === "true") return;

    const timer = window.setTimeout(() => setOpen(true), 10000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  function close() {
    window.sessionStorage.setItem("onuora-newsletter-seen", "true");
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] grid place-items-center bg-black/58 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Join the ỌNUỌRA Circle">
      <button type="button" className="absolute inset-0" onClick={close} aria-label="Close newsletter signup" />
      <section className="relative z-10 w-full max-w-[360px] bg-[#f7f3e8] p-6 text-copy shadow-2xl sm:max-w-md sm:p-8">
        <button
          type="button"
          onClick={close}
          className="gold-focus absolute right-3 top-3 grid h-12 w-12 place-items-center border border-copy/20 transition hover:bg-copy hover:text-white"
          aria-label="Close newsletter signup"
        >
          <X className="h-6 w-6" />
        </button>
        <p className="pr-12 text-[10px] font-semibold uppercase text-gold">Join The ỌNUỌRA Circle</p>
        <h2 className="mt-3 pr-12 text-2xl font-semibold leading-tight">Private Previews & First Access</h2>
        <p className="mt-3 text-sm leading-6 text-copy-muted">Receive collection notes, campaign releases and considered updates from the house.</p>
        <div className="mt-6">
          <SignupFields compact />
        </div>
      </section>
    </div>
  );
}
