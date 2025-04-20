// next.config.ts

import { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin({
  defaultLocale: 'en',
  locales: ['en', 'az', 'ru',"de","es","it","sv","tr"],
  localeDetection: false // Həmişə /en ilə başlasın deyə
});

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com'],
  },
};

export default withNextIntl(nextConfig);
