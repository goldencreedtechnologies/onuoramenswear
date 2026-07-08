import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
  className?: string;
};

export function SectionHeading({ eyebrow, title, copy, light, className }: SectionHeadingProps) {
  return (
    <div className={cn("mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-3xl">
        <p className={cn("mb-4 text-xs font-bold uppercase tracking-[0]", light ? "text-gold-soft" : "text-gold")}>
          {eyebrow}
        </p>
        <h2 className={cn("font-display text-4xl leading-[0.98] text-balance md:text-6xl", light ? "text-ivory" : "text-copy")}>
          {title}
        </h2>
      </div>
      {copy ? (
        <p className={cn("max-w-md text-base leading-8", light ? "text-ivory/70" : "text-copy-muted")}>{copy}</p>
      ) : null}
    </div>
  );
}
