"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client"; // BURADAN İSTİFADƏ EDİRİK

export default function Navigation({ locale }: { locale: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const isActive = (path: string) => pathname === path ? "text-blue-600 font-semibold bg-white/20" : "text-gray-800 hover:text-blue-600 hover:bg-white/20 transition-all duration-200";

  // Burada click zamanı supabase yoxlaması edirik
  const checkAuthAndNavigate = async (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    const supabase = createClient(); // Sənin utils-dən gələn supabase client
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      e.preventDefault();
      router.push(`/${locale}/sign-in`);
    }
    // session varsa keçid normal davam edir
  };

  return (
    <div className="flex justify-between items-center w-full relative">
      {/* Mobile menu button */}
      <button
        className="text-gray-800 flex gap-2 md:hidden items-center px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
        onClick={toggleMenu}
        aria-label={t("menu")}
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-2 w-[250px] bg-white/95 backdrop-blur-md rounded-lg shadow-xl flex flex-col gap-1 py-4 px-6 z-10 border border-white/20">
          <Link href={`/${locale}`} className={`${isActive(`/${locale}`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("home")}>
            {t("home")}
          </Link>
          <Link href={`/${locale}/about`} className={`${isActive(`/${locale}/about`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("about")}>
            {t("about")}
          </Link>
          <Link href={`/${locale}/contact`} className={`${isActive(`/${locale}/contact`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("contact")}>
            {t("contact")}
          </Link>
          <Link 
            href={`/${locale}/ads`} 
            className={`${isActive(`/${locale}/ads`)} px-4 py-3 rounded-lg transition-all duration-200`} 
            aria-label={t("createAds")}
            onClick={(e) => checkAuthAndNavigate(e, `/${locale}/ads`)}
          >
            {t("createAds")}
          </Link>
        </div>
      )}

      {/* Desktop menu */}
      <div className="hidden md:flex justify-center items-center gap-2 w-full">
        <Link href={`/${locale}`} className={`${isActive(`/${locale}`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("home")}>
          {t("home")}
        </Link>
        <Link href={`/${locale}/about`} className={`${isActive(`/${locale}/about`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("about")}>
          {t("about")}
        </Link>
        <Link href={`/${locale}/contact`} className={`${isActive(`/${locale}/contact`)} px-4 py-3 rounded-lg transition-all duration-200`} aria-label={t("contact")}>
          {t("contact")}
        </Link>
        <Link 
          href={`/${locale}/ads`} 
          className={`${isActive(`/${locale}/ads`)} px-4 py-3 rounded-lg transition-all duration-200`} 
          aria-label={t("createAds")}
          onClick={(e) => checkAuthAndNavigate(e, `/${locale}/ads`)}
        >
          {t("createAds")}
        </Link>
      </div>
    </div>
  );
}
