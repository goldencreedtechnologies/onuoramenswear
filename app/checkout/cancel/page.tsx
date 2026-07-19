import Link from "next/link";

export const metadata = {
  title: "Checkout Cancelled"
};

type CheckoutCancelPageProps = {
  searchParams: Promise<{ order_id?: string }>;
};

export default async function CheckoutCancelPage({ searchParams }: CheckoutCancelPageProps) {
  const { order_id } = await searchParams;

  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe grid min-h-[70vh] place-items-center py-14">
        <div className="max-w-2xl rounded-[26px] border border-gold/20 bg-panel p-5 text-center md:p-12">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Checkout cancelled</p>
          <h1 className="font-display text-4xl leading-[0.96] md:text-5xl">Your bag is still yours.</h1>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-copy-muted">
            No payment was taken. You can return to checkout when you are ready.
          </p>
          {order_id ? <p className="mt-5 break-all text-xs text-copy-muted">Order draft: {order_id}</p> : null}
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/checkout" className="gold-focus inline-flex min-h-10 items-center justify-center rounded-[3px] bg-gold px-4 py-2.5 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft">
              Return to checkout
            </Link>
            <Link href="/collections" className="gold-focus inline-flex min-h-10 items-center justify-center rounded-[3px] border border-gold/30 px-4 py-2.5 text-xs font-bold uppercase tracking-[0] text-copy transition hover:border-gold hover:text-gold">
              Keep shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
