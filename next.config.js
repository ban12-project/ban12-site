// @ts-check

/**
 * @type {import('next').NextConfig}
 */
module.exports = {
  i18n: {
    locales: ['zh-CN', 'en-US'],
    defaultLocale: 'en-US',
  },
  webpack(config, { dev }) {
    if (!dev) {
      // https://formatjs.io/docs/guides/advanced-usage#react-intl-without-parser-40-smaller
      config.resolve.alias['@formatjs/icu-messageformat-parser'] =
        '@formatjs/icu-messageformat-parser/no-parser'
    }
    return config
  },
}
