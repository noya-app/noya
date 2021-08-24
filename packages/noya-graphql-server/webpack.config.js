const path = require('path');
const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');

const workspacePackagesPath = path.join(__dirname, '..');
const entryPath = path.join(__dirname, 'src', 'index.ts');
const buildPath = path.join(__dirname, 'build');

module.exports = (env) => {
  const mode = env.production ? 'production' : 'development';

  return {
    mode,
    target: 'node',
    entry: entryPath,
    output: {
      path: buildPath,
      filename: 'bundle.js',
    },
    externals: {
      'apollo-server': 'commonjs2 apollo-server',
      canvas: 'commonjs2 canvas',
    },
    // ...(mode === 'development' ? { devtool: 'source-map' } : {}),
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.jsx'],
    },
    module: {
      rules: [
        {
          test: /\.(js|jsx|ts|tsx)$/,
          include: [workspacePackagesPath],
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
    plugins: [
      // Node doesn't provide the global `atob`, so we polyfill it
      new webpack.ProvidePlugin({
        atob: 'atob',
      }),
      new CopyPlugin({
        patterns: [{ from: 'src/**/*.graphql', to: '[name][ext]' }],
      }),
    ],
  };
};
