 

const createNextIntlPlugin = require('next-intl/plugin');

const withNextIntl = createNextIntlPlugin({
  i18n: {
    locales: ['en', 'az', 'ru'],
    defaultLocale: 'en',
    localeDetection: false
  }
});

module.exports = withNextIntl({
  images: {
    domains: ['res.cloudinary.com']
  }
});
