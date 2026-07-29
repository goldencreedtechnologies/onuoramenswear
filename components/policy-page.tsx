import Link from "next/link";
import { ArrowRight } from "lucide-react";

export type PolicySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

export function PolicyPage({
  eyebrow,
  title,
  introduction,
  effectiveDate,
  sections
}: {
  eyebrow: string;
  title: string;
  introduction: string;
  effectiveDate: string;
  sections: PolicySection[];
}) {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <header className="border-b border-line">
        <div className="container-luxe grid gap-7 py-12 md:grid-cols-[1fr_0.65fr] md:items-end md:py-16">
          <div>
            <p className="text-[10px] font-semibold uppercase text-gold">{eyebrow}</p>
            <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight sm:text-4xl md:text-5xl">
              {title}
            </h1>
          </div>
          <div>
            <p className="text-sm leading-7 text-copy-muted">{introduction}</p>
            <p className="mt-4 text-[10px] font-semibold uppercase text-copy-muted">
              Effective {effectiveDate}
            </p>
          </div>
        </div>
      </header>

      <section className="container-luxe grid gap-10 py-12 lg:grid-cols-[220px_minmax(0,760px)] lg:justify-between lg:py-16">
        <nav className="lg:sticky lg:top-[128px] lg:self-start" aria-label={`${title} sections`}>
          <p className="text-[10px] font-semibold uppercase text-gold">On this page</p>
          <div className="mt-4 flex flex-col border-t border-line">
            {sections.map((section, index) => (
              <a
                key={section.title}
                href={`#policy-${index + 1}`}
                className="gold-focus border-b border-line py-3 text-xs text-copy-muted transition hover:text-copy"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div>
          {sections.map((section, index) => (
            <article
              key={section.title}
              id={`policy-${index + 1}`}
              className="scroll-mt-32 border-t border-line py-8 first:border-t-0 first:pt-0"
            >
              <p className="text-[10px] font-semibold text-gold">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h2 className="mt-2 text-xl font-semibold sm:text-2xl">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="text-sm leading-7 text-copy-muted">
                    {paragraph}
                  </p>
                ))}
              </div>
              {section.bullets?.length ? (
                <ul className="mt-5 space-y-3 border-l border-gold/50 pl-5 text-sm leading-7 text-copy-muted">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
          <div className="mt-5 border-t border-line pt-7">
            <p className="text-sm leading-7 text-copy-muted">
              Questions about this policy can be directed to ONUORA Client Care.
            </p>
            <Link
              href="/contact"
              className="gold-focus mt-5 inline-flex items-center gap-2 border-b border-copy/35 pb-1 text-[10px] font-semibold uppercase"
            >
              Contact client care
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
