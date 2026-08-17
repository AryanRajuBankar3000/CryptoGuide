import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "CryptoGuide — Cryptographic Algorithm Recommendation Engine",
  description:
    "Context-aware cryptographic algorithm recommendation engine for automotive systems. Get intelligent recommendations for Secure Boot, OTA, V2X, SecOC, and more — with post-quantum migration guidance.",
  keywords: [
    "cryptography",
    "automotive security",
    "post-quantum",
    "algorithm recommendation",
    "ISO 21434",
    "AUTOSAR SecOC",
    "V2X",
  ],
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
