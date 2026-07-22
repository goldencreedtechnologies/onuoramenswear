"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return children;
  }

  return (
    <>
      <Navigation />
      {children}
      <Footer />
    </>
  );
}
