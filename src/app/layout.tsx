import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RepFit Dashboard",
  description: "High-Performance B2B Editorial Dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${manrope.variable} h-full antialiased dark`}
    >
      <body className="flex h-full bg-background text-foreground font-sans">
        <Sidebar />
        <main className="flex-1 overflow-y-auto w-full">
          <div className="mx-auto max-w-7xl px-8 lg:px-12 py-10 w-full h-full">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
