import type { Metadata } from "next";
import { Playfair_Display, Outfit, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import Providers from "@/components/providers";

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
});

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
});

export const metadata: Metadata = {
  title: "RashtraKosh | AI Policy Advisor & Intelligence",
  description: "Advanced analytics platform for the Indian Union Budget",
};

export const dynamic = "force-dynamic";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <body className="antialiased font-sans">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
