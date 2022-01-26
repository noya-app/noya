module.exports = {
  extends: ['modular-app'],
  plugins: ['@shopify'],
  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    '@shopify/prefer-early-return': 'warn',
    'no-restricted-imports': [
      'error',
      {
        paths: [
          {
            name: '@radix-ui/react-icons',
            message: 'Please use "noya-utils" instead.',
          },
        ],
        patterns: [],
      },
    ],
  },
};
