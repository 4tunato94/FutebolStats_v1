const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure compatibility with Expo Router
config.resolver.assetExts.push('png', 'jpg', 'jpeg', 'svg');

module.exports = config;