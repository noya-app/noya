const { getPathConfigs } = require('./scripts/pathConfig');

const pathConfigs = getPathConfigs(__dirname);

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    '@babel/plugin-proposal-export-namespace-from',
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        extensions: [
          '.json',
          '.ts',
          '.tsx',
          '.js',
          '.jsx',
          '.android.ts',
          '.android.tsx',
          '.ios.ts',
          '.ios.tsx',
          '.web.ts',
          '.web.tsx',
          '.android.js',
          '.android.jsx',
          '.ios.js',
          '.ios.jsx',
          '.web.js',
          '.web.jsx',
          '.native.js',
          '.native.ts',
          '.native.tsx',
          '.native.jsx',
        ],
        alias: pathConfigs.babelAliases,
      },
    ],
  ],
};
