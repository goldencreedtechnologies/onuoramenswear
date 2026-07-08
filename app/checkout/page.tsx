export const metadata = {
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe grid gap-8 py-20 md:grid-cols-[1fr_420px] md:py-28">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Secure checkout</p>
          <h1 className="font-display text-6xl md:text-8xl">Finish with confidence.</h1>
          <form className="mt-10 grid gap-4">
            {["Email", "Full name", "Address", "City", "Country"].map((label) => (
              <label key={label} className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
                {label}
                <input className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case" />
              </label>
            ))}
          </form>
        </div>
        <aside className="h-fit rounded-[35px] border border-gold/20 bg-obsidian p-7 text-ivory">
          <h2 className="font-display text-4xl">Private order summary</h2>
          <p className="mt-5 text-sm leading-7 text-ivory/62">
            Stripe, WooCommerce, taxes, and shipping logic can be wired here when the store backend is connected.
          </p>
          <button className="gold-focus mt-8 min-h-12 w-full bg-gold px-5 text-xs font-bold uppercase tracking-[0] text-obsidian transition hover:bg-gold-soft">
            Place order
          </button>
        </aside>
      </section>
    </main>
  );
}
