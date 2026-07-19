import Link from "next/link";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";

export const metadata = {
  title: "Payment Received"
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id } = await searchParams;

  return (
    <main className="bg-page pt-28 text-copy">
      <ClearCartOnMount />
      <section className="container-luxe grid min-h-[70vh] place-items-center py-14">
        <div className="max-w-2xl rounded-[26px] border border-gold/20 bg-panel p-5 text-center md:p-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Payment received</p>
          <h1 className="font-display text-4xl leading-[0.96] md:text-5xl">Your order is in motion.</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-copy-muted">
            Thank you for choosing ỌNUỌRA. Your payment is being confirmed by Stripe, and your order will move into fulfilment once the payment webhook is received.
          </p>
          {session_id ? <p className="mt-5 break-all text-xs text-copy-muted">Stripe session: {session_id}</p> : null}
          <Link href="/collections" className="gold-focus mt-8 inline-flex min-h-10 items-center justify-center rounded-[3px] bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft">
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
