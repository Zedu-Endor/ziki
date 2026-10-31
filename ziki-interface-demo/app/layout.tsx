import localFont from "next/font/local";
import { DemoProvider } from "@/demo/provider";
import "./globals.css";
import "@/demo/demo.css";
import "@/components/homepage/homepage.css";
import "@/demo/workspace.css";

const inter = localFont({ src: "./fonts/inter-latin.woff2", variable: "--font-inter", weight: "100 900", display: "swap" });
const manrope = localFont({ src: "./fonts/manrope-latin.woff2", variable: "--font-manrope", weight: "400 800" });
const dmSans = localFont({ src: "./fonts/dm-sans-latin.woff2", variable: "--font-dm-sans", weight: "400 700" });
const geistMono = localFont({ src: "./fonts/geist-mono-latin.woff2", variable: "--font-geist-mono", weight: "100 900" });
export const metadata = { title: "Ziki · Complete Interface Demo", description: "Independent Ziki interface demo with sample data. No production systems are connected.", robots: { index: false, follow: false } };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en" className="overflow-x-clip" suppressHydrationWarning><body className={`${inter.variable} ${manrope.variable} ${dmSans.variable} ${geistMono.variable} min-h-screen overflow-x-clip antialiased`}><DemoProvider>{children}</DemoProvider></body></html>;
}
