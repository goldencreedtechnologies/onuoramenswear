import { journalPosts } from "@/data/catalog";

export const metadata = {
  title: "Journal",
  description: "Editorial notes on African luxury, styling, craft, and modern masculinity."
};

export default function JournalPage() {
  return (
    <main className="bg-obsidian pt-28 text-ivory">
      <section className="container-luxe py-14 md:py-14">
        <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Journal</p>
        <h1 className="max-w-4xl font-display text-4xl leading-[0.94] text-balance md:text-5xl">
          Notes from the house of modern African tailoring.
        </h1>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {journalPosts.map((post) => (
            <article key={post.title} className="rounded-[26px] border border-gold/20 p-5 transition hover:border-gold/50">
              <p className="mb-8 text-xs font-bold uppercase tracking-[0] text-gold-soft">{post.tag}</p>
              <h2 className="font-display text-3xl leading-tight">{post.title}</h2>
              <p className="mt-5 text-sm leading-7 text-ivory/62">{post.excerpt}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
