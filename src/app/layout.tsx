import type { Metadata } from "next";
import { Inter, Manrope } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

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
  description: "High-Performance B2B AI Messaging",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${inter.variable} ${manrope.variable} h-full antialiased dark`}
      >
        <body className="h-full bg-[#0e0e0e] text-foreground font-sans">
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
