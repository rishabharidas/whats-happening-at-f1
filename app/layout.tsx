import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import dynamic from "next/dynamic";
import Footer from "@/components/Footer";

const NavigationBar = dynamic(() => import("@/components/NavigationBar"));

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "whatsHappening@F1",
  description: "get race data | f1 news | race results",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased max-w-full overflow-x-hidden`}
    >
      <body className="min-h-full w-full max-w-full overflow-x-hidden flex flex-col relative bg-[#0a0a0a] text-zinc-100 selection:bg-red-600 selection:text-white">
        <NavigationBar />
        <div className="pt-24 sm:pt-28 md:pt-32 w-full max-w-full overflow-x-hidden flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
