const baseConfig = require('./webpack.config');

const { entry, ...rest } = baseConfig;

module.exports = {
  ...rest,
  externals: {
    fs: 'commonjs2 fs',
    path: 'commonjs2 path',
    child_process: 'commonjs2 child_process',
    os: 'commonjs2 os',
    util: 'commonjs2 util',
    electron: 'commonjs2 electron',
  },
};
