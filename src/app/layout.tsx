import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { OktProvider } from "@/klient/okt/kontekst";

// Selvhostet av next/font: nettleseren sender ingen forespørsler til Google (AD-17).
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

// Serif for display, display-sm, quote og chat-body (DESIGN.md). Kursiv trengs til bevissitat.
const sourceSerif = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Erfaringsgruven",
  description: "Finn erfaringene dine og koble dem til kravene i en stillingsannonse.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="nb"
      className={`${inter.variable} ${sourceSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <OktProvider>{children}</OktProvider>
        <Toaster />
      </body>
    </html>
  );
}
