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
          className="inline-flex items-center justify-center w-full rounded-md border border-gray-300 shadow-sm px-2 py-1 bg-white text-xs font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          id={LANGUAGE_SELECTOR_ID}
          aria-haspopup="true"
          aria-expanded={isOpen}
        >
          <FlagIcon countryCode={currentLocale} />
          <span className="hidden sm:inline-block ml-2 text-lg">{currentLocale.toUpperCase()}</span>
          <svg
            className="-mr-1 ml-1 h-4 w-4"
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
            className="origin-top-right absolute right-0 mt-1 w-48 sm:w-64 lg:w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50"
            role="menu"
            aria-orientation="vertical"
            aria-labelledby="language-selector"
          >
            <div className="py-1 grid grid-cols-1 sm:grid-cols-2 gap-2" role="none">
              {languages.map((language) => (
                <button
                  key={language.key}
                  onClick={() => handleLanguageChange(language.key)}
                  className={`${
                    currentLocale === language.key
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-700"
                  } block px-4 py-2 text-lg text-left items-center inline-flex hover:bg-gray-100 w-full`}
                  role="menuitem"
                >
                  <FlagIcon countryCode={language.key} />
                  <span className="hidden sm:inline-block ml-3 truncate text-lg">{language.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
