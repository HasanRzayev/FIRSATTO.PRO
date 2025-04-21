// next.config.js

const createNextIntlPlugin = require('next-intl/plugin');

module.exports = createNextIntlPlugin({
  images: {
    domains: ['res.cloudinary.com']
  },
  i18n: {
    locales: ['en', 'az', 'ru', 'de', 'es', 'it', 'sv', 'tr'],
    defaultLocale: 'en',
    localeDetection: false // `false` burada da istifadə edilir
  }
});
