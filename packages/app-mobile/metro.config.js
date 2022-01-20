const path = require('path');

const { getPathConfigs } = require('./scripts/pathConfig');

const rootDir = path.resolve(__dirname, '../../');
const pathConfigs = getPathConfigs(__dirname);

const metroConfig = {
  watchFolders: [...pathConfigs.watchFolders, `${rootDir}/node_modules`],
  resolver: {
    sourceExts: ['cjs', 'json', 'ts', 'tsx', 'js', 'jsx'],
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

module.exports = metroConfig;
