import { journalPosts } from "@/data/catalog";

export const metadata = {
  title: "Journal",
  description: "Editorial notes on African luxury, styling, craft, and modern masculinity."
};

export default function JournalPage() {
  return (
    <main className="bg-obsidian pt-28 text-ivory">
      <section className="container-luxe py-20 md:py-28">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Journal</p>
        <h1 className="max-w-4xl font-display text-6xl leading-[0.9] text-balance md:text-8xl">
          Notes from the house of modern African tailoring.
        </h1>
        <div className="mt-16 grid gap-5 md:grid-cols-3">
          {journalPosts.map((post) => (
            <article key={post.title} className="rounded-[35px] border border-gold/20 p-7 transition hover:border-gold/50">
              <p className="mb-12 text-xs font-bold uppercase tracking-[0] text-gold-soft">{post.tag}</p>
              <h2 className="font-display text-4xl leading-tight">{post.title}</h2>
              <p className="mt-5 text-sm leading-7 text-ivory/62">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
