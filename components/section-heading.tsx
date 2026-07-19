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
    <div className={cn("mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between", className)}>
      <div className="max-w-2xl">
        <p className={cn("mb-3 text-[11px] font-bold uppercase tracking-[0]", light ? "text-gold-soft" : "text-gold")}>
          {eyebrow}
        </p>
        <h2 className={cn("font-display text-3xl leading-[1.02] text-balance md:text-5xl", light ? "text-ivory" : "text-copy")}>
          {title}
        </h2>
      </div>
      {copy ? (
        <p className={cn("max-w-sm text-sm leading-7", light ? "text-ivory/70" : "text-copy-muted")}>{copy}</p>
      ) : null}
    </div>
  );
}
