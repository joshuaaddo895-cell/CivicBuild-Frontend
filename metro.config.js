const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const projectRoot = __dirname;
const config = getDefaultConfig(projectRoot);

// NativeWind can install its own react-native@0.86 nested copy, which breaks
// SDK 54 / RN 0.81 bundling. Force Metro to use the project's versions.
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, 'node_modules/react'),
  'react-native': path.resolve(projectRoot, 'node_modules/react-native'),
};

config.resolver.blockList = [
  /node_modules[\\/]nativewind[\\/]node_modules[\\/]react-native[\\/].*/,
];

module.exports = withNativeWind(config, { input: './global.css' });
