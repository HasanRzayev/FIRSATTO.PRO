"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

export default function Navigation({ locale }: { locale: string }) {
  const pathname = usePathname();
  const t = useTranslations();
  const [menuOpen, setMenuOpen] = useState(false); // State to handle menu visibility

  const toggleMenu = () => setMenuOpen(!menuOpen); // Toggle the menu visibility

  // Function to check if the link is active
  const isActive = (path: string) => pathname === path ? "text-[#FF8C00]" : "hover:text-[#FF8C00]";

  return (
    <div className="flex justify-between items-center w-full relative">
      {/* 3 dots button for small screens (left-aligned), for large screens (hidden) */}
      <button
        className="text-white flex gap-2 md:hidden items-center px-4 py-2"
        onClick={toggleMenu}
        aria-label={t("menu")}
      >
        <span className="text-2xl">•••</span> {/* 3 horizontal dots */}
      </button>

      {/* Menu dropdown */}
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
          <Link href={`/${locale}/ads`} className={`${isActive(`/${locale}/ads`)} transition-colors`} aria-label={t("createAds")}>
            {t("createAds")}
          </Link>
        </div>
      )}

      {/* For larger screens, display the navigation links centered */}
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
        <Link href={`/${locale}/ads`} className={`${isActive(`/${locale}/ads`)} transition-colors`} aria-label={t("createAds")}>
          {t("createAds")}
        </Link>
      </div>
    </div>
  );
}
