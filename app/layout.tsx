import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "tav — Search at the speed of thought",
  description: "Fast AI search engine powered by Cerebras and Tavily",
  openGraph: {
    title: "tav — Search at the speed of thought",
    description: "Fast AI search engine powered by Cerebras and Tavily",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body
        className={GeistSans.className}
        style={{ fontFamily: "var(--font-geist-sans), sans-serif" }}
      >
        {children}
      </body>
    </html>
  );
}
