const path = require('path');
const webpack = require('webpack');
const generateGuidebook = require('generate-guidebook/next');
const slug = require('rehype-slug');

const workspacePath = path.join(__dirname, '..');

const withGuidebook = generateGuidebook({
  guidebookDirectory: './src/pages/docs',
  guidebookModulePath: `./guidebook.js`,
});

const withMDX = require('next-mdx-frontmatter')({
  extension: /\.mdx?$/,
  MDXOptions: {
    rehypePlugins: [slug],
  },
});

const withConfig = (nextConfig) => ({
  ...nextConfig,
  basePath: '/app',
  webpack(config, options) {
    if (!options.isServer) {
      config.resolve.fallback.fs = false;
    }

    config.ignoreWarnings = [
      ...(config.ignoreWarnings || []),
      /Critical dependency: the request of a dependency is an expression/,
    ];
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
        {
          test: /\.txt$/,
          use: 'raw-loader',
        },
      ],
    };

    config.plugins.push(
      new webpack.ProvidePlugin({
        atob: 'atob',
      }),
    );

    if (typeof nextConfig.webpack === 'function') {
      return nextConfig.webpack(config, options);
    }

    return config;
  },
});

module.exports = withConfig(
  withGuidebook(
    withMDX({
      pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
    }),
  ),
);
