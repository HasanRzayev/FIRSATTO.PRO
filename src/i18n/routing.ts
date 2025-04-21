import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'az', 'ru'],
 
  // Used when no locale matches
  defaultLocale: 'en'
});

export const locales = routing.locales; // BUNU ƏLAVƏ ET
