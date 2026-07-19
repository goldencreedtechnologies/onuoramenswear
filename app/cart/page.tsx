import { CartClient } from "@/components/cart-client";

export const metadata = {
  title: "Cart"
};

export default function CartPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe py-14 md:py-14">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Bag</p>
        <h1 className="font-display text-4xl md:text-5xl">Your edit awaits.</h1>
        <CartClient />
      </section>
    </main>
  );
}
