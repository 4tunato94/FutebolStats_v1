const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure proper resolution for React Native Web
config.resolver.alias = {
  'react-native': 'react-native-web',
};

module.exports = config;