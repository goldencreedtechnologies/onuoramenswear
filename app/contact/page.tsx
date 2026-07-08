import { Cta } from "@/components/cta";

export const metadata = {
  title: "Contact",
  description: "Contact ỌNUỌRA for sizing, styling, orders, and membership support."
};

export default function ContactPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe grid gap-12 py-20 md:grid-cols-[0.9fr_1.1fr] md:py-28">
        <div>
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold">Client care</p>
          <h1 className="font-display text-6xl leading-[0.9] text-balance md:text-8xl">We are here to help you arrive well.</h1>
          <p className="mt-8 max-w-lg text-base leading-8 text-copy-muted">
            Ask about sizing, delivery, styling, custom care, or ỌNUỌRA Circle access.
          </p>
          <div className="mt-8">
            <Cta href="mailto:orders@onuoramenswear.com">Email client care</Cta>
          </div>
        </div>
        <form className="grid gap-4 rounded-[35px] border border-gold/20 bg-panel-muted p-6 md:p-8">
          {["Name", "Email", "Phone"].map((label) => (
            <label key={label} className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
              {label}
              <input className="gold-focus min-h-12 border border-gold/15 bg-panel px-4 text-base font-normal normal-case" />
            </label>
          ))}
          <label className="grid gap-2 text-xs font-bold uppercase tracking-[0]">
            Message
            <textarea className="gold-focus min-h-36 border border-gold/15 bg-panel p-4 text-base font-normal normal-case" />
          </label>
          <button className="gold-focus min-h-12 bg-obsidian px-5 text-xs font-bold uppercase tracking-[0] text-ivory transition hover:bg-charcoal">
            Send message
          </button>
        </form>
      </section>
    </main>
  );
}
