const path = require('path');
const fs = require('fs');

const getPathConfigs = (appRootDir) => {
  const packages = fs.readdirSync(path.resolve(appRootDir, '../'));
  const excludes = ['README.md', 'app', 'app-mobile', 'site'];
  const watchFolders = [];
  const babelAliases = {};
  const extraNodeModules = {};

  packages.forEach((packageName) => {
    if (excludes.includes(packageName)) {
      return;
    }

    const basePath = path.resolve(appRootDir, `../${packageName}`);

    watchFolders.push(basePath);
    extraNodeModules[packageName] = basePath;
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
