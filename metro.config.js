const path = require('node:path');
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// `@brand-content` resolves to the active brand's content.ts (photos, copy,
// onboarding choices). BRAND is set by scripts/brand.js.
const brandKey = process.env.BRAND ?? 'frozenholm';
const brandContent = path.join(__dirname, 'brands', brandKey, 'content.ts');

const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === '@brand-content') {
    return { type: 'sourceFile', filePath: brandContent };
  }
  return (resolveRequest ?? context.resolveRequest)(context, moduleName, platform);
};

module.exports = config;
