/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const {
  getPathConfigs,
  proxyExtraNodeModules,
} = require('./scripts/pathConfig');

const pathConfigs = getPathConfigs(__dirname);

module.exports = {
  watchFolders: pathConfigs.watchFolders,
  resolver: {
    extraNodeModules: proxyExtraNodeModules(pathConfigs.extraNodeModules),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
};
