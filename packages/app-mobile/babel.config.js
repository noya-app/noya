const { getPathConfigs } = require('./scripts/pathConfig');

const pathConfigs = getPathConfigs(__dirname);

module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    'react-native-reanimated/plugin',
    [
      'module-resolver',
      {
        alias: pathConfigs.babelAliases,
      },
    ],
  ],
};
