// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Add asset registry resolver for React Native 0.79.5
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'gif', 'webp');

// Ensure proper asset handling
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

module.exports = config; 