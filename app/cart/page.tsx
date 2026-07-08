import { Cta } from "@/components/cta";

export const metadata = {
  title: "Cart"
};

export default function CartPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe py-20 md:py-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Bag</p>
        <h1 className="font-display text-6xl md:text-8xl">Your edit awaits.</h1>
        <div className="mt-12 grid gap-8 md:grid-cols-[1fr_380px]">
          <div className="rounded-[35px] border border-gold/20 bg-panel-muted p-8">
            <p className="text-copy-muted">Your cart preview is ready for ecommerce integration.</p>
          </div>
          <aside className="rounded-[35px] border border-gold/20 bg-obsidian p-7 text-ivory">
            <h2 className="font-display text-4xl">Order summary</h2>
            <div className="my-7 space-y-4 text-sm text-ivory/70">
              <div className="flex justify-between"><span>Subtotal</span><span>$0</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>Calculated at checkout</span></div>
            </div>
            <Cta href="/checkout">Continue to checkout</Cta>
          </aside>
        </div>
      </section>
    </main>
  );
}
