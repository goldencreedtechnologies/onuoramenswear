"use client";

import { FormEvent, useState } from "react";

type ContactFormProps = { defaultEnquiry: string; inputClass: string };

export function ContactForm({ defaultEnquiry, inputClass }: ContactFormProps) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName: form.get("fullName"), email: form.get("email"), phone: form.get("phone"), enquiry: form.get("enquiry"), message: form.get("message") })
    });
    if (!response.ok) {
      setStatus("error");
      return;
    }
    event.currentTarget.reset();
    setStatus("sent");
  }

  return (
    <form onSubmit={submit} className="grid min-w-0 gap-4">
      <div className="grid min-w-0 gap-4 sm:grid-cols-2">
        <label className="grid min-w-0 gap-2 text-[10px] font-semibold uppercase">Name<input name="fullName" autoComplete="name" required className={inputClass} /></label>
        <label className="grid min-w-0 gap-2 text-[10px] font-semibold uppercase">Email<input name="email" type="email" autoComplete="email" required className={inputClass} /></label>
      </div>
      <label className="grid min-w-0 gap-2 text-[10px] font-semibold uppercase">Phone<input name="phone" type="tel" autoComplete="tel" className={inputClass} /></label>
      <label className="grid min-w-0 gap-2 text-[10px] font-semibold uppercase">Enquiry<select name="enquiry" defaultValue={defaultEnquiry} className={inputClass}><option>Product and sizing</option><option>Order support</option><option>Shipping & Delivery</option><option>Large Order / Delivery Quote</option><option>Styling</option><option>ỌNUỌRA Circle</option></select></label>
      <label className="grid min-w-0 gap-2 text-[10px] font-semibold uppercase">Message<textarea name="message" required className={`${inputClass} min-h-40 py-4`} /></label>
      <button type="submit" disabled={status === "sending"} className="gold-focus min-h-12 bg-obsidian px-5 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian disabled:opacity-60">{status === "sending" ? "Sending…" : "Send enquiry"}</button>
      {status === "sent" ? <p className="text-xs leading-5 text-gold">Thank you. Client Care has received your enquiry.</p> : null}
      {status === "error" ? <p className="text-xs leading-5 text-wine">We could not send your enquiry. Please try again.</p> : null}
    </form>
  );
}
