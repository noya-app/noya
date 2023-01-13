const path = require('path');
const webpack = require('webpack');

const workspacePath = path.join(__dirname, '..');

module.exports = {
  basePath: '/app',
  webpack(config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }

    config.module = {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [workspacePath],
          exclude: /node_modules/,
          use: options.defaultLoaders.babel,
        },
        {
          test: /\.svg$/,
          use: 'url-loader',
        },
      ],
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        atob: 'atob',
      }),
    );

    return config;
  },
};
