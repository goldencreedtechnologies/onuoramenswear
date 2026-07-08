import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";

type CtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "dark" | "light" | "ghost";
  className?: string;
};

export function Cta({ href, children, variant = "gold", className }: CtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "gold-focus group inline-flex min-h-12 items-center justify-center gap-3 rounded-[3px] px-5 py-3 text-xs font-bold uppercase tracking-[0] transition duration-300 hover:-translate-y-0.5",
        variant === "gold" && "bg-gold text-obsidian hover:bg-gold-soft",
        variant === "dark" && "bg-obsidian text-ivory hover:bg-charcoal",
        variant === "light" && "bg-panel text-copy hover:bg-panel-muted",
        variant === "ghost" && "border border-current/25 text-current hover:border-current/50",
        className
      )}
    >
      {children}
      <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </Link>
  );
}
