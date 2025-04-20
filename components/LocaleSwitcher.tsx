"use client";
import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { routing } from "../src/i18n/routing";
import "flag-icons/css/flag-icons.min.css";

interface FlagIconProps {
    countryCode: string;
}

function FlagIcon({ countryCode = "" }: FlagIconProps) {
    if (countryCode === "en") {
        countryCode = "gb"; // Handle "en" as "gb" for flag icon
    }

    return (
        <span
            className={`fi fi-${countryCode} inline-block mr-2 rounded-full border-2 border-gray-200 bg-white w-[24px] h-[24px] text-[24px] shadow-inner`}
        />
    );
}

const LANGUAGE_SELECTOR_ID = 'language-selector';

const locales = routing.locales;

export const LocaleSwitcher = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [languages, setLanguages] = useState<{ key: string; name: string }[]>([]);
    const currentLocale = pathname.split("/")[1];
    const handleLanguageChange = (newLocale: string) => {
      if (newLocale === currentLocale) return;
  
      // URL'deki mevcut dil kodunu değiştirme işlemi
      const segments = pathname.split("/");
  
      // Eğer path içinde dil kodu varsa, onu değiştir
      if (segments.length > 1) {
          segments[1] = newLocale; // Yeni dili buraya yerleştir
      }
  
      // Yeni path'i oluşturuyoruz, sadece dil kısmını değiştiriyoruz
      const newPath = segments[0] + "/" + segments[1]; // "/de", "/en", "/az", vb.
      
      router.push(newPath); // Yeni path'e yönlendir
      setIsOpen(false); // Dropdown'u kapat
  };
  

    useEffect(() => {
        const setupLanguages = () => {
            setLanguages(
                locales.map((loc) => ({
                    key: loc,
                    name: loc.toUpperCase(),
                }))
            );
        };
        setupLanguages();
    }, []);

    return (
        <div className="flex items-center z-40">
            <div className="relative inline-block text-left">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    type="button"
                    className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    id={LANGUAGE_SELECTOR_ID}
                    aria-haspopup="true"
                    aria-expanded={isOpen}
                >
                    <FlagIcon countryCode={currentLocale} />
                    {currentLocale.toUpperCase()}
                    <svg
                        className="-mr-1 ml-2 h-5 w-5"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <path
                            fillRule="evenodd"
                            d="M10.293 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L10 12.586l3.293-3.293a1 1 0 011.414 1.414l-4 4z"
                            clipRule="evenodd"
                        />
                    </svg>
                </button>

                {isOpen && (
                    <div
                        className="origin-top-right absolute right-0 mt-2 w-96 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5"
                        role="menu"
                        aria-orientation="vertical"
                        aria-labelledby="language-selector"
                    >
                        <div className="py-1 grid grid-cols-2 gap-2" role="none">
                            {languages.map((language, index) => (
                                <button
                                    key={language.key}
                                    onClick={() => handleLanguageChange(language.key)}
                                    className={`${
                                        currentLocale === language.key
                                            ? "bg-gray-100 text-gray-900"
                                            : "text-gray-700"
                                    } block px-4 py-2 text-sm text-left items-center inline-flex hover:bg-gray-100 ${index % 2 === 0 ? 'rounded-r' : 'rounded-l'}`}
                                    role="menuitem"
                                >
                                    <FlagIcon countryCode={language.key} />
                                    <span className="truncate">{language.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
