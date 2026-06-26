import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/app-shell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SIM-PPDS - Pondok Pesantren Digital System",
  description: "Sistem Manajemen & ERP Terpadu Pondok Pesantren Modern",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="h-full">
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground`}>
        <AppProvider>
          <AppShell>
            {children}
          </AppShell>
        </AppProvider>
      </body>
    </html>
  );
}
