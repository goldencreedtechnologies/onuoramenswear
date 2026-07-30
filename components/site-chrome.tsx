"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { MiniCartDrawer } from "@/components/mini-cart-drawer";
import { Navigation } from "@/components/navigation";
import { CurrencyProvider } from "@/components/currency-provider";

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) {
    return children;
  }

  return (
    <CurrencyProvider>
      <Navigation />
      {children}
      <Footer />
      <MiniCartDrawer />
    </CurrencyProvider>
  );
}
