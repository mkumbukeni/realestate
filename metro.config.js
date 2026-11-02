// const { getDefaultConfig } = require("expo/metro-config");
// const { withNativeWind } = require('nativewind/metro');
 
// const config = getDefaultConfig(__dirname)
 
// module.exports = withNativeWind(config, { input: './global.css' })



const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Configure SVG transformer
config.transformer.babelTransformerPath = require.resolve(
  "react-native-svg-transformer"
);

// Treat SVG files as source files instead of static assets
config.resolver.assetExts = config.resolver.assetExts.filter(
  (ext) => ext !== "svg"
);

config.resolver.sourceExts = [
  ...config.resolver.sourceExts,
  "svg",
];

// Preserve NativeWind configuration
module.exports = withNativeWind(config, {
  input: "./global.css",
});