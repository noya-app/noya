const path = require('path');
const fs = require('fs');

const getPathConfigs = (appRootDir) => {
  const packages = fs.readdirSync(path.resolve(appRootDir, '../'));
  const excludes = ['app', 'app-mobile', 'site'];
  const watchFolders = [];
  const babelAliases = {
    'react-native': path.resolve(appRootDir, './node_modules/react-native'),
  };
  const extraNodeModules = [];

  packages.forEach((packageName) => {
    const basePath = path.resolve(appRootDir, `../${packageName}`);

    if (excludes.includes(packageName)) {
      return;
    }

    watchFolders.push(basePath);
    extraNodeModules.push(`${basePath}/node_modules`);
    babelAliases[packageName] = `${basePath}/src`;
  });

  return { babelAliases, extraNodeModules, watchFolders };
};

const proxyExtraNodeModules = (extraNodeModules) => {
  return new Proxy(extraNodeModules, {
    get: (target, name) => {
      return name in target
        ? target[name]
        : path.join(process.cwd(), `node_modules/${name}`);
    },
  });
};

module.exports = { getPathConfigs, proxyExtraNodeModules };
