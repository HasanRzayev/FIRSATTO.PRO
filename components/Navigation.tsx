 
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation"; // Importing usePathname from next/navigation
import { useTranslations } from "next-intl"; // Importing useTranslations hook

export default function Navigation({ locale }: { locale: string }) {
  const pathname = usePathname(); // Using usePathname to get the current path
  const t = useTranslations(); // Get translations for the Navigation namespace

 
  const isActive = (path: string) => pathname === path ? "text-[#FF8C00]" : "hover:text-[#FF8C00]";

  return (
    <nav className="hidden md:flex gap-6 text-white font-medium">
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
    </nav>
  );
}
