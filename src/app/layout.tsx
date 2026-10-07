import type { Metadata, Viewport } from "next";
import { Fraunces, Outfit } from "next/font/google";
import { AppProvider } from "@/lib/store";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "TravelMate — Find people who travel like you",
  description:
    "Discover compatible travel groups, create your own group, or find the perfect guide for your next adventure.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#214c38",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${fraunces.variable} antialiased bg-paper text-ink`}>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
