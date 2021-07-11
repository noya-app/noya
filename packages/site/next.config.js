const path = require('path');

const workspacePath = path.join(__dirname, '..');

module.exports = {
  webpack(config, options) {
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
          use: ['@svgr/webpack'],
        },
      ],
    };

    return config;
  },
};
