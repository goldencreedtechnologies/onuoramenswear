import { TrackingLookup } from "@/components/tracking-lookup";

export const metadata = {
  title: "Track Your Order",
  description: "Check the current status of your ỌNUỌRA Menswear order."
};

export default function TrackingPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe py-12 md:py-18">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-gold">Order Tracking</p>
        <h1 className="mt-3 text-4xl font-semibold leading-tight md:text-6xl">Track Your Order</h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-copy-muted">Enter the tracking ID from your order confirmation together with the email address used at checkout.</p>
        <div className="mt-8 max-w-3xl"><TrackingLookup /></div>
      </section>
    </main>
  );
}
