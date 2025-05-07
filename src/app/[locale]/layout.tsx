// LocaleLayout.tsx

import { ThemeModeScript } from "flowbite-react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import SaveIconButton from "@/components/SaveIconButton";
import UnreadReplyCount from "@/components/UnreadReplyCount";
import { LocaleSwitcher } from "@/components/LocaleSwitcher"; // Fixed import name
import Navigation from "@/components/Navigation";
import { dir } from "i18next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { getMessages } from "next-intl/server";
import "./globals.css";
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Firsatto',
  description: 'Firsatto',
  verification: {
    google: 'sxvnxLsm1HWt9Tt2BY0wDTE21XrGVpXzZJ7PDurB660'
  }
}
export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = params; // Removed await since params is synchronous

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="bg-[#F0F8FF] text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="w-full flex justify-center border-b border-b-foreground/10 h-20 bg-[#1E90FF] sticky top-0 z-50">
            <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
              <Link href={`/${locale}`} className="font-semibold text-white text-base">
                FIRSATTO
              </Link>
              <Navigation locale={locale} />
              <div className="flex items-center gap-4 ml-auto"> {/* Flex container to align items */}
                <UnreadReplyCount />
                <SaveIconButton /> {/* SaveIconButton next to UnreadReplyCount */}
                <LocaleSwitcher />
                <HeaderAuth />
              </div>
            </div>
          </header>

          <main className="w-full max-w-5xl mx-auto p-5">{children}</main>

          <footer className="w-full border-t border-t-foreground/10 py-6 mt-10 bg-[#2F4F4F]">
            <div className="max-w-5xl mx-auto px-5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white">
              <p>&copy; {new Date().getFullYear()} FIRSATTO. All rights reserved.</p>
              <div className="flex gap-4">
                <Link href={`/${locale}/privacy`} className="hover:text-[#1E90FF] transition-colors">
                  Privacy Policy
                </Link>
                <Link href={`/${locale}/terms`} className="hover:text-[#1E90FF] transition-colors">
                  Terms of Service
                </Link>
                <Link href={`/${locale}/contact`} className="hover:text-[#1E90FF] transition-colors">
                  Contact
                </Link>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
