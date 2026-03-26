const { getDefaultConfig } = require("@expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    "@service": path.resolve(__dirname, "src/service"),
  },
};

module.exports = config;
