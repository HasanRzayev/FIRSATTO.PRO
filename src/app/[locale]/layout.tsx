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
      <body className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 min-h-screen text-foreground">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <header className="w-full glass-effect border-b border-white/20 h-20 sticky top-0 z-50 shadow-lg">
            <div className="container-max flex justify-between items-center px-6 h-full">
              <Link href={`/${locale}`} className="font-bold text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                🚴 FIRSATTO
              </Link>
              <Navigation locale={locale} />
              <div className="flex items-center gap-3">
                <UnreadReplyCount />
                <SaveIconButton />
                <LocaleSwitcher />
                <HeaderAuth />
              </div>
            </div>
          </header>

          <main className="container-max px-6 py-8 min-h-screen">{children}</main>

          <footer className="w-full bg-gradient-to-r from-slate-800 to-slate-900 text-white py-12 mt-16">
            <div className="container-max px-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
                <div className="col-span-1 md:col-span-2">
                  <h3 className="font-bold text-2xl mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    🚴 FIRSATTO
                  </h3>
                  <p className="text-gray-300 mb-4">
                    The ultimate bicycle marketplace. Buy, sell, and trade bikes worldwide. Connect with cycling enthusiasts and discover amazing bicycles.
                  </p>
                  <div className="flex space-x-4">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center hover:bg-blue-700 transition-colors cursor-pointer">
                      <span className="text-white font-bold">f</span>
                    </div>
                    <div className="w-10 h-10 bg-blue-400 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors cursor-pointer">
                      <span className="text-white font-bold">t</span>
                    </div>
                    <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center hover:bg-pink-700 transition-colors cursor-pointer">
                      <span className="text-white font-bold">i</span>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4">Quick Links</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><Link href={`/${locale}`} className="hover:text-blue-400 transition-colors">Home</Link></li>
                    <li><Link href={`/${locale}/about`} className="hover:text-blue-400 transition-colors">About</Link></li>
                    <li><Link href={`/${locale}/ads`} className="hover:text-blue-400 transition-colors">Create Ad</Link></li>
                    <li><Link href={`/${locale}/contact`} className="hover:text-blue-400 transition-colors">Contact</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-lg mb-4">Legal</h4>
                  <ul className="space-y-2 text-gray-300">
                    <li><Link href={`/${locale}/privacy`} className="hover:text-blue-400 transition-colors">Privacy Policy</Link></li>
                    <li><Link href={`/${locale}/terms`} className="hover:text-blue-400 transition-colors">Terms of Service</Link></li>
                    <li><Link href={`/${locale}/contact`} className="hover:text-blue-400 transition-colors">Support</Link></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
                <p>&copy; {new Date().getFullYear()} FIRSATTO. All rights reserved. Made with ❤️ for global connections.</p>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
