import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from "next/script";
import { ThemeProvider } from "@/context/ThemeContext"; // 1. Importe ton nouveau Provider

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LuminaCode",
  description: "Exécuteur Python interactif",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <Script
          src="https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js"
          strategy="beforeInteractive"
        />
      </head>

      <body
        className={`
          ${geistSans.variable} 
          ${geistMono.variable} 
          antialiased 
          bg-[#050505] 
          text-white
        `}
      >
        {/* 2. Enveloppe tout le contenu avec ThemeProvider */}
        <ThemeProvider>
          <main className="min-h-screen">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  );
}