import type { Metadata } from "next";
import "./globals.css";
import "./button-radius.css";
import { SiteChrome } from "@/components/site-chrome";

export const metadata: Metadata = {
  title: {
    default: "ỌNUỌRA Menswear | Contemporary African Menswear",
    template: "%s | ỌNUỌRA Menswear"
  },
  description:
    "Contemporary African menswear designed and made in Nigeria for a global wardrobe.",
  metadataBase: new URL("https://onuoramenswear.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" data-scroll-behavior="smooth">
      <body
        style={
          {
            "--font-sans":
              'Manrope, Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
            "--font-serif":
              'Cormorant Garamond, Georgia, Cambria, "Times New Roman", serif'
          } as React.CSSProperties
        }
      >
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
