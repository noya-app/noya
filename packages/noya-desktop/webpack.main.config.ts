import path from 'path';
import type { Configuration } from 'webpack';

const workspacePackagesPath = path.join(__dirname, '..');
const workspaceNodeModulesPath = path.resolve(__dirname, '../../node_modules');

const config: Configuration = {
  entry: './src/main.ts',
  resolve: {
    modules: [workspaceNodeModulesPath, 'node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  module: {
    rules: [
      // Add support for native node modules
      {
        // We're specifying native_modules in the test because the asset relocator loader generates a
        // "fake" .node file which is really a cjs file.
        test: /native_modules[/\\].+\.node$/,
        use: 'node-loader',
      },
      {
        test: /[/\\]node_modules[/\\].+\.(m?js|node)$/,
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
};

export default config;
