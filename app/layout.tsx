import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "RealGrowthHQ — Personal Brand Growth Portal",
  description: "Your personal brand growth portal",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} style={{ backgroundColor: '#0A0A0A' }}>
      <body className="min-h-full text-[#F0F0F0]" style={{ backgroundColor: '#0A0A0A', color: '#F0F0F0' }}>{children}</body>
    </html>
  );
}
