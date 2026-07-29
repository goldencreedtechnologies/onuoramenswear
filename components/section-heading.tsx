import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  copy?: string;
  light?: boolean;
  className?: string;
  href?: string;
  linkLabel?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  copy,
  light,
  className,
  href,
  linkLabel = "View all"
}: SectionHeadingProps) {
  return (
    <div className={cn("mb-7 flex items-end justify-between gap-6", className)}>
      <div className="max-w-2xl">
        <p
          className={cn(
            "mb-2 text-[9px] font-bold uppercase tracking-[0.12em]",
            light ? "text-gold-soft" : "text-gold"
          )}
        >
          {eyebrow}
        </p>
        <h2
          className={cn(
            "text-2xl font-semibold leading-tight text-balance sm:text-3xl",
            light ? "text-ivory" : "text-copy"
          )}
        >
          {title}
        </h2>
        {copy ? (
          <p className={cn("mt-3 max-w-xl text-sm leading-6", light ? "text-white/55" : "text-copy-muted")}>
            {copy}
          </p>
        ) : null}
      </div>
      {href ? (
        <Link
          href={href}
          className={cn(
            "gold-focus hidden shrink-0 items-center gap-2 border-b pb-1 text-[10px] font-bold uppercase tracking-[0.08em] sm:inline-flex",
            light ? "border-white/40 text-white" : "border-copy/35 text-copy"
          )}
        >
          {linkLabel}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      ) : null}
    </div>
  );
}
