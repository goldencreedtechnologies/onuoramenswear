export const metadata = {
  title: "Account"
};

export default function AccountPage() {
  return (
    <main className="bg-obsidian pt-28 text-ivory">
      <section className="container-luxe grid min-h-[70vh] place-items-center py-20">
        <div className="w-full max-w-md rounded-[35px] border border-gold/20 p-8">
          <p className="mb-5 text-xs font-bold uppercase tracking-[0] text-gold-soft">Client account</p>
          <h1 className="font-display text-5xl">Welcome back.</h1>
          <form className="mt-8 grid gap-4">
            <input placeholder="Email" className="gold-focus min-h-12 border border-ivory/10 bg-ivory/5 px-4 text-ivory placeholder:text-ivory/35" />
            <input placeholder="Password" type="password" className="gold-focus min-h-12 border border-ivory/10 bg-ivory/5 px-4 text-ivory placeholder:text-ivory/35" />
            <button className="gold-focus min-h-12 bg-gold px-5 text-xs font-bold uppercase tracking-[0] text-obsidian">Sign in</button>
          </form>
        </div>
      </section>
    </main>
  );
}
