import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata = {
  title: "CryptoGuide — Automotive Cybersecurity Platform",
  description:
    "Choose appropriate cryptographic mechanisms for automotive cybersecurity use cases and understand the reasoning, risks, hardware impact, and post-quantum migration path.",
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

export const viewport = {
  colorScheme: "dark",
  themeColor: "#02050a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
