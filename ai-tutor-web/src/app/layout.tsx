import type { Metadata } from "next";
import { geistSans, geistMono } from "./ui/fonts";
import "./globals.css";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Ringle Ai Tutor App",
  description: "Ai tutor helps to learn English",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.className} ${geistMono.className} antialiased`}
      >
        <Header />
        {children}
      </body>
    </html>
  );
}
