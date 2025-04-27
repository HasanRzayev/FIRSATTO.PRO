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

  const isActive = (path: string) => pathname === path ? "text-[#FF8C00]" : "hover:text-[#FF8C00]";

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
        className="text-white flex gap-2 md:hidden items-center px-4 py-2"
        onClick={toggleMenu}
        aria-label={t("menu")}
      >
        <span className="text-2xl">•••</span>
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 mt-2 w-[200px] bg-gray-800 text-white flex flex-col gap-4 py-4 px-6 z-10 max-h-80 overflow-y-auto">
          <Link href={`/${locale}`} className={`${isActive(`/${locale}`)} transition-colors`} aria-label={t("home")}>
            {t("home")}
          </Link>
          <Link href={`/${locale}/about`} className={`${isActive(`/${locale}/about`)} transition-colors`} aria-label={t("about")}>
            {t("about")}
          </Link>
          <Link href={`/${locale}/contact`} className={`${isActive(`/${locale}/contact`)} transition-colors`} aria-label={t("contact")}>
            {t("contact")}
          </Link>
          <Link 
            href={`/${locale}/ads`} 
            className={`${isActive(`/${locale}/ads`)} transition-colors`} 
            aria-label={t("createAds")}
            onClick={(e) => checkAuthAndNavigate(e, `/${locale}/ads`)}
          >
            {t("createAds")}
          </Link>
        </div>
      )}

      {/* Desktop menu */}
      <div className="hidden md:flex justify-center items-center gap-8 w-full">
        <Link href={`/${locale}`} className={`${isActive(`/${locale}`)} transition-colors`} aria-label={t("home")}>
          {t("home")}
        </Link>
        <Link href={`/${locale}/about`} className={`${isActive(`/${locale}/about`)} transition-colors`} aria-label={t("about")}>
          {t("about")}
        </Link>
        <Link href={`/${locale}/contact`} className={`${isActive(`/${locale}/contact`)} transition-colors`} aria-label={t("contact")}>
          {t("contact")}
        </Link>
        <Link 
          href={`/${locale}/ads`} 
          className={`${isActive(`/${locale}/ads`)} transition-colors`} 
          aria-label={t("createAds")}
          onClick={(e) => checkAuthAndNavigate(e, `/${locale}/ads`)}
        >
          {t("createAds")}
        </Link>
      </div>
    </div>
  );
}
