import {defineRouting} from 'next-intl/routing';
 
export const routing = defineRouting({
 
  locales: ['en', 'az', 'ru'],
 
 
  defaultLocale: 'en'
});

export const locales = routing.locales; // BUNU ƏLAVƏ ET
