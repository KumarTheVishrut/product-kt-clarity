import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "KT Agent — Product Knowledge Transfer",
  description: "AI-powered Universal Product KT Deconstruction Framework using Google Gemini",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
