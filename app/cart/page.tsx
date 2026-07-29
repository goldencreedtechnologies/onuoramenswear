import { CartClient } from "@/components/cart-client";

export const metadata = {
  title: "Shopping Bag"
};

export default function CartPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe py-10 md:py-14">
        <p className="text-[10px] font-semibold uppercase text-gold">Shopping bag</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Your selection.</h1>
        <CartClient />
      </section>
    </main>
  );
}
