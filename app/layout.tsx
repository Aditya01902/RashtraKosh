import type { Metadata } from "next";
import { Playfair_Display, Outfit, JetBrains_Mono } from 'next/font/google';
import "./globals.css";
import { Navbar } from "@/components/navigation/Navbar";
import Providers from "@/components/providers";
import Script from "next/script";

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
  title: "RashtraKosh | Chanakya AI Policy Advisor",
  description: "Advanced analytics platform for the Indian Union Budget",
};


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${outfit.variable} ${jetbrains.variable}`}>
      <head>
        <Script src="https://js.puter.com/v2/" strategy="beforeInteractive" />
      </head>
      <body className="antialiased font-sans">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
