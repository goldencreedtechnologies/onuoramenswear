import type { Metadata } from "next";
import "./globals.css";
import { SiteChrome } from "@/components/site-chrome";
import { ThemeProvider } from "@/components/theme-provider";

export const metadata: Metadata = {
  title: {
    default: "Onuora | Luxury Nigerian Stretch Menswear",
    template: "%s | Onuora"
  },
  description:
    "Modern African stretch tailoring for men who carry heritage, confidence, and ease.",
  metadataBase: new URL("https://onuoramenswear.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://onuoramenswear.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function(){
                try {
                  var mode = localStorage.getItem('onuora-theme') || 'system';
                  var dark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  document.documentElement.dataset.theme = mode === 'system' ? (dark ? 'dark' : 'light') : mode;
                  document.documentElement.dataset.themeMode = mode;
                } catch(e) {
                  document.documentElement.dataset.theme = 'light';
                  document.documentElement.dataset.themeMode = 'system';
                }
              })();
            `
          }}
        />
      </head>
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
        <ThemeProvider>
          <SiteChrome>{children}</SiteChrome>
        </ThemeProvider>
      </body>
    </html>
  );
}
