import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import { ThemeProvider } from "next-themes";
import { StoreProvider } from "@/lib/store";
import { RegisterSW } from "@/components/app/register-sw";
import "./globals.css";

export const metadata: Metadata = {
  title: "Guiguel | Gestão de Manutenção",
  description: "Ordens de serviço, cronograma, mapa da fábrica, estoque e equipe em um só lugar.",
  manifest: "/manifest.webmanifest",
  icons: { icon: "/icon-192.png", apple: "/icon-180.png" },
  appleWebApp: { capable: true, title: "Guiguel" },
};
export const viewport: Viewport = { themeColor: "#ffffff", viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" suppressHydrationWarning className={GeistSans.variable}>
      <body className="min-h-dvh">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <StoreProvider>{children}</StoreProvider>
        </ThemeProvider>
        <RegisterSW />
      </body>
    </html>
  );
}
