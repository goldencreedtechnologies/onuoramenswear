import Link from "next/link";
import { Check } from "lucide-react";
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
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <ClearCartOnMount />
      <section className="container-luxe grid min-h-[72vh] place-items-center py-14">
        <div className="max-w-2xl text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold text-obsidian">
            <Check className="h-5 w-5" />
          </span>
          <p className="mt-6 text-[10px] font-semibold uppercase text-gold">Payment received</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Your order is in motion.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-copy-muted">
            Thank you for choosing ỌNUỌRA. Stripe is confirming the payment and the house will
            begin fulfilment as soon as that confirmation arrives.
          </p>
          {session_id ? (
            <p className="mt-4 break-all text-[10px] text-copy-muted">Session {session_id}</p>
          ) : null}
          <Link
            href="/collection"
            className="gold-focus mt-7 inline-flex min-h-12 items-center justify-center bg-obsidian px-6 text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
