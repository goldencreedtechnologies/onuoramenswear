"use client";

import { FormEvent, useState } from "react";

type TrackingResult = {
  orderNumber: string;
  trackingId: string;
  statusLabel: string;
  updatedAt: string;
  deliveryMethod: string;
};

export function TrackingLookup() {
  const [trackingId, setTrackingId] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<TrackingResult | null>(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function lookup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    setResult(null);

    const response = await fetch("/api/tracking", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trackingId, email })
    });
    const body = await response.json().catch(() => null);
    setLoading(false);

    if (!response.ok) {
      setMessage(body?.error ?? "We could not retrieve tracking information right now.");
      return;
    }

    setResult(body.tracking);
  }

  return (
    <div className="border border-line bg-panel-muted p-5 sm:p-7">
      <form onSubmit={lookup} className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-copy-muted">
          Tracking ID
          <input value={trackingId} onChange={(event) => setTrackingId(event.target.value)} placeholder="TRK-2026-00000001" autoComplete="off" required className="gold-focus min-h-12 border border-line bg-page px-4 text-sm font-normal normal-case text-copy" />
        </label>
        <label className="grid gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-copy-muted">
          Email used at checkout
          <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" autoComplete="email" required className="gold-focus min-h-12 border border-line bg-page px-4 text-sm font-normal normal-case text-copy" />
        </label>
        <button disabled={loading} className="gold-focus min-h-12 bg-obsidian px-5 text-[10px] font-semibold uppercase tracking-[0.08em] text-ivory transition hover:bg-gold hover:text-obsidian disabled:cursor-wait disabled:opacity-60 sm:col-span-2">
          {loading ? "Checking order" : "Track your order"}
        </button>
      </form>
      {message ? <p role="alert" className="mt-4 text-sm text-copy-muted">{message}</p> : null}
      {result ? (
        <div className="mt-6 border-t border-line pt-5 text-sm leading-7 text-copy-muted" aria-live="polite">
          <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-gold">Current status</p>
          <p className="mt-2 text-xl font-semibold text-copy">{result.statusLabel}</p>
          <dl className="mt-4 grid gap-2 sm:grid-cols-2">
            <div><dt className="text-xs font-semibold text-copy">Order number</dt><dd>{result.orderNumber}</dd></div>
            <div><dt className="text-xs font-semibold text-copy">Tracking ID</dt><dd>{result.trackingId}</dd></div>
            <div><dt className="text-xs font-semibold text-copy">Delivery method</dt><dd>{result.deliveryMethod}</dd></div>
            <div><dt className="text-xs font-semibold text-copy">Last updated</dt><dd>{new Date(result.updatedAt).toLocaleDateString()}</dd></div>
          </dl>
        </div>
      ) : null}
    </div>
  );
}
