import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/cn";

type CtaProps = {
  href: string;
  children: React.ReactNode;
  variant?: "gold" | "dark" | "light" | "ghost";
  className?: string;
};

export function Cta({ href, children, variant = "dark", className }: CtaProps) {
  return (
    <Link
      href={href}
      className={cn(
        "gold-focus group inline-flex min-h-11 items-center justify-center gap-3 rounded-[2px] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] transition duration-300",
        variant === "gold" && "bg-gold text-obsidian hover:bg-gold-soft",
        variant === "dark" && "bg-obsidian text-ivory hover:bg-charcoal",
        variant === "light" && "bg-ivory text-obsidian hover:bg-white",
        variant === "ghost" && "border border-current/40 text-current hover:border-current",
        className
      )}
    >
      {children}
      <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" />
    </Link>
  );
}
