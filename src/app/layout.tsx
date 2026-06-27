import { cookies } from 'next/headers';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import { AppShell } from "@/components/layout/app-shell";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { PrintProvider } from "@/components/print/print-provider";

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const sidebarState = cookieStore.get('sidebar:state')?.value;
  const initialSidebarOpen = sidebarState ? sidebarState === 'true' : true;

  return (
    <html lang="id" className="h-full" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="ivory"
          enableSystem={false}
          themes={['ivory', 'deep-space', 'emerald', 'ocean', 'corporate', 'pondok-classic']}
        >
          <PrintProvider>
            <AppProvider initialSidebarOpen={initialSidebarOpen}>
              <AppShell>
                {children}
              </AppShell>
              <Toaster />
            </AppProvider>
          </PrintProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
