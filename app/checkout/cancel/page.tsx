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
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe grid min-h-[72vh] place-items-center py-14">
        <div className="max-w-2xl text-center">
          <p className="text-[10px] font-semibold uppercase text-gold">Checkout cancelled</p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Your selection is still in the bag.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-copy-muted">
            No payment was taken. Return whenever you are ready.
          </p>
          {order_id ? (
            <p className="mt-4 break-all text-[10px] text-copy-muted">Order draft {order_id}</p>
          ) : null}
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link
              href="/checkout"
              className="gold-focus inline-flex min-h-12 items-center justify-center bg-obsidian px-6 text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian"
            >
              Return to checkout
            </Link>
            <Link
              href="/collection"
              className="gold-focus inline-flex min-h-12 items-center justify-center border border-copy px-6 text-xs font-semibold uppercase hover:bg-copy hover:text-white"
            >
              Keep shopping
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
