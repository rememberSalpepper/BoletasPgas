import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import Navbar from "@/components/navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Pgas - Escáner de Boletas",
  description: "Escanea tus boletas y expórtalas a Excel de manera fácil y rápida",
  //icons: {
    //icon: 'images/logo.png',
  //},
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="fixed inset-0 bg-animated -z-20"></div>
            <Navbar />
            {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

