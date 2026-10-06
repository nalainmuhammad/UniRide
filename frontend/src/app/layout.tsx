import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "UniRide — Smart Campus Transport Management",
  description:
    "UniRide is an intelligent campus transport management platform featuring real-time GPS tracking, QR-based attendance, AI-powered route optimization, and seamless fleet management for universities.",
  keywords: "UniRide, campus transport, university bus tracking, smart fleet management, QR attendance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  );
}
