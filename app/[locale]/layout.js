import { Inter, JetBrains_Mono } from "next/font/google";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';

import "../globals.css";

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

export default async function RootLayout({ children, params }) {
  const { locale } = await params;
  
  if (!routing.locales.includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const messages = await getMessages();
  const dir = locale === 'ur' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`dark ${inter.variable} ${jetbrainsMono.variable}`}
    >
      <body className="antialiased bg-background text-foreground">
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
