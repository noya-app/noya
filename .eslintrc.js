module.exports = {
  extends: ['modular-app'],
  plugins: ['@shopify'],
  rules: {
    'no-console': ['warn', { allow: ['info', 'warn', 'error'] }],
    '@shopify/prefer-early-return': 'warn',
    'no-restricted-imports': [
      'error',
      {
        patterns: ['*src*'],
      },
    ],
    '@typescript-eslint/no-unsafe-assignment': 0,
    '@typescript-eslint/no-floating-promises': 0,
    '@typescript-eslint/unbound-method': 0,
    '@typescript-eslint/no-unsafe-member-access': 0,
    '@typescript-eslint/no-unsafe-call': 0,
    '@typescript-eslint/no-unsafe-return': 0,
    '@typescript-eslint/no-empty-function': 0,
    '@typescript-eslint/restrict-plus-operands': 0,
    '@typescript-eslint/restrict-template-expressions': 0,
    '@typescript-eslint/no-empty-interface': 0,
    '@typescript-eslint/explicit-module-boundary-types': 0,
    '@typescript-eslint/no-non-null-assertion': 0,
    '@typescript-eslint/no-explicit-any': 0,
  },
};
