const path = require('path');
const webpack = require('webpack');

const workspacePath = path.join(__dirname, '..');

module.exports = {
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
          use: ['@svgr/webpack', 'url-loader'],
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
