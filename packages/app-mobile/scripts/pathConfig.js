const path = require('path');
const fs = require('fs');

const allowList = [
  'noya-ui',
  'canvaskit',
  'noya-fonts',
  'noya-utils',
  'noya-state',
  'noya-keymap',
  'noya-renderer',
  'noya-geometry',
  'noya-react-utils',
  'noya-import-svg',
  'noya-sketch-file',
  'noya-file-format',
  'noya-sketch-model',
  'noya-colorpicker',
  'noya-google-fonts',
  'noya-designsystem',
  'noya-react-canvaskit',
  'noya-native-canvaskit',
  'noya-app-state-context',
];

const getPathConfigs = (appRootDir) => {
  const packages = fs.readdirSync(path.resolve(appRootDir, '../'));
  const watchFolders = [];
  const babelAliases = {
    react: path.resolve(appRootDir, './node_modules/react'),
    'react-native': path.resolve(appRootDir, './node_modules/react-native'),
    'styled-components': path.resolve(
      appRootDir,
      './node_modules/styled-components/native',
    ),
    '@shopify/react-native-skia': path.resolve(
      appRootDir,
      './node_modules/@shopify/react-native-skia',
    ),
    'react-native-vector-icons': path.resolve(
      appRootDir,
      './node_modules/react-native-vector-icons',
    ),
    'react-native-reanimated': path.resolve(
      appRootDir,
      './node_modules/react-native-reanimated',
    ),
  };

  packages.forEach((packageName) => {
    const basePath = path.resolve(appRootDir, `../${packageName}`);

    if (!allowList.includes(packageName)) {
      return;
    }

    watchFolders.push(`${basePath}/src`);
    babelAliases[packageName] = `${basePath}/src`;
  });

  return { babelAliases, watchFolders };
};

module.exports = { getPathConfigs };
