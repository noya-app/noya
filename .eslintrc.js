module.exports = {
  extends: ['modular-app'],
  plugins: ['@shopify'],
  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    '@shopify/prefer-early-return': 'warn',
  },
};
