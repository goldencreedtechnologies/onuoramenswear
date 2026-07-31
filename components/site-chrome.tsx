"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/footer";
import { MiniCartDrawer } from "@/components/mini-cart-drawer";
import { Navigation } from "@/components/navigation";
import { CurrencyProvider } from "@/components/currency-provider";
import { NewsletterPopup } from "@/components/newsletter-signup";

function WhatsAppButton() {
  return (
    <a
      href="https://wa.me/2349029786545?text=Hello%20ONUORA%20Menswear%2C%20I%20would%20like%20some%20assistance."
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with ỌNUỌRA on WhatsApp"
      className="gold-focus fixed bottom-5 right-5 z-[90] inline-flex min-h-12 items-center gap-2 rounded-full border border-obsidian/15 bg-gold px-4 text-[10px] font-bold uppercase tracking-[0.08em] text-obsidian shadow-[0_12px_36px_rgb(0_0_0/0.18)] transition hover:-translate-y-0.5 hover:bg-obsidian hover:text-gold sm:bottom-6 sm:right-6"
    >
      <svg viewBox="0 0 24 24" aria-hidden="true" className="h-5 w-5 fill-current">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.173.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.67-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479s1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.227 1.36.195 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.981.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.002-5.45 4.436-9.884 9.892-9.884a9.83 9.83 0 0 1 7.021 2.91 9.82 9.82 0 0 1 2.898 7.02c-.003 5.45-4.445 9.884-9.927 9.884m8.413-18.297A11.81 11.81 0 0 0 12.055 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.9 11.9 0 0 0 5.689 1.448h.005c6.558 0 11.894-5.335 11.897-11.893a11.82 11.82 0 0 0-3.489-8.413Z" />
      </svg>
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

export function SiteChrome({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === "/admin" || pathname.startsWith("/admin/");

  if (isAdmin) return children;

  return (
    <CurrencyProvider>
      <Navigation />
      {children}
      <Footer />
      <MiniCartDrawer />
      <NewsletterPopup />
      <WhatsAppButton />
    </CurrencyProvider>
  );
}
