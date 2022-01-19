const path = require('path');

const { getPathConfigs } = require('./scripts/pathConfig');

const rootDir = path.resolve(__dirname, '../../');
const pathConfigs = getPathConfigs(__dirname);

const metroConfig = {
  watchFolders: [...pathConfigs.watchFolders, `${rootDir}/node_modules`],
  resolver: {
    sourceExts: [
      'cjs',
      'json',
      'ts',
      'tsx',
      'js',
      'jsx',
      'android.ts',
      'android.tsx',
      'ios.ts',
      'ios.tsx',
      'web.ts',
      'web.tsx',
      'android.js',
      'android.jsx',
      'ios.js',
      'ios.jsx',
      'web.js',
      'web.jsx',
      'native.js',
      'native.ts',
      'native.tsx',
      'native.jsx',
    ],
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
