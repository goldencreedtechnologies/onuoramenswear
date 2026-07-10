import { CartClient } from "@/components/cart-client";

export const metadata = {
  title: "Cart"
};

export default function CartPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe py-20 md:py-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Bag</p>
        <h1 className="font-display text-6xl md:text-8xl">Your edit awaits.</h1>
        <CartClient />
      </section>
    </main>
  );
}
