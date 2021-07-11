const path = require('path');
const designSystemPath = path.resolve(__dirname, '../noya-designsystem/src');

module.exports = {
  webpack(config) {
    // const tsxLoaderIndex = config.module.rules.findIndex(
    //   (rule) => console.log(rule),
    //   // rule.test.includes('tsx'),
    // );
    // config.module.rules[tsxLoaderIndex].include.push(designSystemPath);

    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    config.module.rules.push({
      test: /\.(ts|tsx)$/,
      use: ['babel-loader'],
      include: [designSystemPath],
      exclude: [path.resolve(__dirname, './src')],
    });

    config.resolve.alias = {
      ...config.resolve.alias,
      'noya-designsystem': designSystemPath,
    };

    return config;
  },
};
