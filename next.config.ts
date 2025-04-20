// next.config.ts

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'az', 'ru', 'de', 'es', 'it', 'sv', 'tr'],
    localeDetection: false // Həmişə /en ilə başlasın deyə
  }
};

export default withNextIntl(nextConfig);
