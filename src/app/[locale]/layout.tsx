// LocaleLayout.tsx

import { ThemeModeScript } from "flowbite-react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import SaveIconButton from "@/components/SaveIconButton";
import UnreadReplyCount from "@/components/UnreadReplyCount";
import {LocaleSwitcher} from "@/components/LocaleSwitcher";
import Navigation from "@/components/Navigation"; // Import the Navigation component
import { dir } from "i18next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { routing } from "../../i18n/routing";
import { getMessages } from "next-intl/server";
import "./globals.css";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params; // params-ı asinxron şəkildə gözləyirik

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="bg-background text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="w-full flex justify-center border-b border-b-foreground/10 h-16 bg-[#1E90FF]">
            <div className="w-full max-w-5xl flex justify-between items-center px-5 text-sm">
              <Link href={`/${locale}`} className="font-semibold text-white text-base">
                FIRSATTO
              </Link>
              <Navigation locale={locale} /> {/* Use the Navigation component here */}
              <div className="flex items-center gap-4">
                <LocaleSwitcher lang={locale} />
                <UnreadReplyCount />
                <SaveIconButton />
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
