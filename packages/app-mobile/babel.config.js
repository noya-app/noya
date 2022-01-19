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
        alias: pathConfigs.babelAliases,
      },
    ],
  ],
};
