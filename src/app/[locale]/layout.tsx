// LocaleLayout.tsx

import { ThemeModeScript } from "flowbite-react";
import HeaderAuth from "@/components/header-auth";
import Link from "next/link";
import SaveIconButton from "@/components/SaveIconButton";
import UnreadReplyCount from "@/components/UnreadReplyCount";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
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
  description: 'Firsatto - The Ultimate Bicycle Marketplace',
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
  const { locale } = params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} dir={dir(locale)} suppressHydrationWarning>
      <head>
        <ThemeModeScript />
      </head>
      <body className="bg-slate-50 dark:bg-slate-950 min-h-screen text-slate-900 dark:text-white selection:bg-indigo-500 selection:text-white">
        <NextIntlClientProvider locale={locale} messages={messages}>

          {/* Sticky Premium Header */}
          <header className="fixed w-full top-0 z-50 glass-effect border-b border-white/20 dark:border-slate-800 transition-all duration-300">
            <div className="container-max flex justify-between items-center px-4 sm:px-6 h-20">
              <Link href={`/${locale}`} className="flex items-center gap-2 group">
                <span className="text-3xl animate-bounce">🚴</span>
                <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent group-hover:to-purple-600 transition-all duration-300">
                  FIRSATTO
                </span>
              </Link>

              {/* Desktop Nav */}
              <div className="hidden lg:block">
                <Navigation locale={locale} />
              </div>

              {/* Actions & Mobile Menu Toggle */}
              <div className="flex items-center gap-3 sm:gap-4">
                <UnreadReplyCount />
                <SaveIconButton />
                <div className="hidden sm:block">
                  <LocaleSwitcher />
                </div>
                <HeaderAuth />

                {/* Mobile Menu Button (Hamburger) - Navigation component handles the menu content, but we can expose a trigger here if needed, 
                    or assume Navigation has the responsive logic. For now, we rely on Navigation's responsiveness. 
                    If Navigation is not responsive, we should double check it next.
                */}
              </div>
            </div>
          </header>

          {/* Main Content with padding for fixed header */}
          <main className="container-max px-4 sm:px-6 py-8 pt-28 min-h-screen animate-fade-in">
            {children}
          </main>

          {/* Premium Footer */}
          <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 pt-16 pb-8">
            <div className="container-max px-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">

                {/* Brand Column */}
                <div className="col-span-1 md:col-span-2 space-y-4">
                  <h3 className="font-extrabold text-2xl bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    🚴 FIRSATTO
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
                    The ultimate specific bicycle marketplace. Buy, sell, and trade bikes worldwide.
                    Join our community of cycling enthusiasts today.
                  </p>
                  <div className="flex space-x-4 pt-2">
                    {['twitter', 'facebook', 'instagram'].map((social) => (
                      <div key={social} className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1">
                        <span className="capitalize text-xs font-bold">{social[0]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Links */}
                <div>
                  <h4 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Quick Links</h4>
                  <ul className="space-y-3">
                    {['Home', 'About', 'Ads', 'Contact'].map((item) => (
                      <li key={item}>
                        <Link
                          href={`/${locale}/${item.toLowerCase() === 'home' ? '' : item.toLowerCase()}`}
                          className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h4 className="font-bold text-lg mb-6 text-slate-800 dark:text-white">Legal</h4>
                  <ul className="space-y-3">
                    {['Privacy Policy', 'Terms of Service', 'Support'].map((item) => (
                      <li key={item}>
                        <Link
                          href={`/${locale}/${item.toLowerCase().replace(/ /g, '-')}`}
                          className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors flex items-center gap-2 group"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 transition-opacity"></span>
                          {item}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-slate-200 dark:border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
                <p className="text-slate-500 dark:text-slate-500 text-sm">
                  &copy; {new Date().getFullYear()} FIRSATTO. All rights reserved.
                </p>
                <p className="text-slate-500 dark:text-slate-500 text-sm flex items-center gap-1">
                  Made with <span className="text-red-500 animate-pulse">❤️</span> for global connections
                </p>
              </div>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
