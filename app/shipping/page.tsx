export const metadata = {
  title: "Shipping"
};

export default function ShippingPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe max-w-4xl py-20 md:py-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Delivery</p>
        <h1 className="font-display text-6xl md:text-8xl">Global dispatch, clearly stated.</h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {["UK 1-2 working days", "US 4-7 working days", "International 5-10 working days"].map((item) => (
            <div key={item} className="rounded-[35px] border border-gold/20 bg-panel p-6 text-sm font-bold uppercase tracking-[0]">{item}</div>
          ))}
        </div>
      </section>
    </main>
  );
}
