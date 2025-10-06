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
      className={`fi fi-${countryCode} inline-block mr-2 rounded-full border-2 border-gray-200 bg-white w-[20px] h-[20px] text-[20px] shadow-inner`}
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
  const currentLocale = pathname?.split('/')[1] || 'en';

  const handleLanguageChange = (newLocale: string) => {
    if (newLocale === currentLocale) return;

    const segments = pathname?.split('/') || [];
    
    if (segments.length > 1) {
      segments[1] = newLocale;
    }

    const newPath = segments.join('/');
    router.push(newPath);
    setIsOpen(false);
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
          className="inline-flex items-center justify-center p-2 rounded-lg bg-white/90 border border-gray-300 text-gray-800 hover:bg-white transition-all duration-200 focus:outline-none"
          id={LANGUAGE_SELECTOR_ID}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <FlagIcon countryCode={currentLocale} />
          <span className="hidden sm:inline-block ml-2 text-sm font-medium">{currentLocale.toUpperCase()}</span>
          <svg
            className="ml-1 h-4 w-4 transition-transform duration-200"
            style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isOpen && (
          <div
            className="origin-top-right absolute right-0 mt-2 w-48 sm:w-64 lg:w-72 bg-white/95 backdrop-blur-md rounded-lg shadow-xl border border-gray-200 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-selector"
          >
            <div className="py-2 grid grid-cols-1 sm:grid-cols-2 gap-1" role="none">
              {languages.map((language) => (
                <button
                  key={language.key}
                  onClick={() => handleLanguageChange(language.key)}
                  className={`${
                    currentLocale === language.key
                      ? "bg-blue-100 text-blue-800"
                      : "text-gray-800 hover:bg-gray-100"
                  } block px-4 py-3 text-sm text-left items-center inline-flex transition-all duration-200 w-full rounded-lg mx-1`}
                  role="menuitem"
                >
                  <FlagIcon countryCode={language.key} />
                  <span className="hidden sm:inline-block ml-3 truncate font-medium">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
