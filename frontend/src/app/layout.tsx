import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { VectorProvider } from "@/context/VectorContext";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VECTOR: AI Procurement Negotiation Assistant",
  description: "Analyze supplier quotes, compare with market benchmarks, and draft counteroffers offline using multi-agent intelligence.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#05070f] text-slate-200 font-sans selection:bg-cyan-500/30 selection:text-cyan-200 overflow-x-hidden">
        <VectorProvider>
          <Navbar />
          <main className="flex-1 w-full max-w-7xl mx-auto p-4 md:p-8">
            {children}
          </main>
        </VectorProvider>
      </body>
    </html>
  );
}
