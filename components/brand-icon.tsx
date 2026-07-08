import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

type BrandIconProps = {
  type: "heritage" | "stretch" | "craft" | "shipping" | "limited" | "secure" | "fabric";
  className?: string;
};

const paths: Record<BrandIconProps["type"], ReactNode> = {
  heritage: (
    <>
      <path d="M24 11c7 4 12 5 12 5v10c0 8-5 13-12 16-7-3-12-8-12-16V16s5-1 12-5Z" />
      <path d="M18 27c2-5 10-5 12 0M18 20h12M24 17v16" />
    </>
  ),
  stretch: (
    <>
      <path d="M15 14h18l3 9-4 16H16l-4-16 3-9Z" />
      <path d="M18 25h12M11 31 5 25l6-6M37 19l6 6-6 6" />
    </>
  ),
  craft: (
    <>
      <path d="M12 35 35 12M30 12l6 6M10 38l8-2-6-6-2 8Z" />
      <path d="M29 30c4 0 7 3 7 7M18 16c2 2 4 2 6 0" />
    </>
  ),
  shipping: (
    <>
      <path d="M10 17h21v14H10V17ZM31 22h6l4 5v4H31v-9Z" />
      <path d="M16 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM35 36a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" />
      <path d="M15 12c7-4 15-4 22 0" />
    </>
  ),
  limited: (
    <>
      <path d="M24 8 11 15v18l13 7 13-7V15L24 8Z" />
      <path d="M19 24h10M24 19v10M16 15l8 5 8-5" />
    </>
  ),
  secure: (
    <>
      <path d="M13 22h22v17H13V22Z" />
      <path d="M18 22v-5a6 6 0 0 1 12 0v5M24 28v5" />
      <path d="M17 38h14" />
    </>
  ),
  fabric: (
    <>
      <path d="M12 34c10-3 18-10 24-23 2 14-2 24-12 28-5 2-9 0-12-5Z" />
      <path d="M18 31c4-5 8-9 15-14M15 22c5 1 8 4 9 9M25 15c2 4 5 6 10 7" />
    </>
  )
};

export function BrandIcon({ type, className }: BrandIconProps) {
  return (
    <svg className={cn("h-11 w-11 text-gold", className)} viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <circle cx="24" cy="24" r="22" fill="currentColor" opacity="0.1" />
      <circle cx="24" cy="24" r="21" stroke="currentColor" opacity="0.35" />
      <g stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        {paths[type]}
      </g>
    </svg>
  );
}
