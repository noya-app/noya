import type { Configuration } from 'webpack';

import baseConfig from './webpack.main.config';

const { entry, ...rest } = baseConfig;

const config: Configuration = {
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

export default config;
