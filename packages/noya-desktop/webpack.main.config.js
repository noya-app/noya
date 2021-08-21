const path = require('path');

const workspacePath = path.join(__dirname, '..');
const workspaceNodeModulesPath = path.resolve(__dirname, '../../node_modules');

/**
 * @type import('webpack').Configuration
 */
module.exports = {
  entry: './src/index.ts',
  resolve: {
    modules: [workspaceNodeModulesPath, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      {
        test: /\.node$/,
        use: 'node-loader',
      },
      {
        test: /\.(m?js|node)$/,
        parser: { amd: false },
        use: {
          loader: '@vercel/webpack-asset-relocator-loader',
          options: {
            outputAssetBase: 'native_modules',
          },
        },
      },
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [workspacePath],
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
            presets: ['next/babel'],
          },
        },
      },
    ],
  },
};
