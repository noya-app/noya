module.exports = {
  extends: ['modular-app'],
  plugins: ['@shopify'],
  overrides: [
    {
      files: [
        '**/next.config.js',
        '**/webpack.config.js',
        '**/.eslintrc.js',
        '**/tailwind.config.js',
        '**/postcss.config.js',
      ],
      parserOptions: {
        requireConfigFile: false,
      },
    },
  ],
  rules: {
    // 'import/no-cycle': 'error',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/ban-types': 'off',
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
        patterns: ['*src*'],
      },
    ],

    // TODO: We want to reconsider these
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unsafe-assignment': 'off',
    '@typescript-eslint/no-unsafe-call': 'off',
    '@typescript-eslint/no-unsafe-member-access': 'off',
    '@typescript-eslint/no-unsafe-return': 'off',
    '@typescript-eslint/no-var-requires': 'off',
    '@typescript-eslint/restrict-plus-operands': 'off',
    '@typescript-eslint/restrict-template-expressions': 'off',
    '@typescript-eslint/unbound-method': 'off',
    '@typescript-eslint/prefer-regexp-exec': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    'prefer-const': 'off',
    '@typescript-eslint/no-inferrable-types': 'off',
    'jest/prefer-to-be-undefined': 'off',
    'jest/expect-expect': 'off',
    'jest/no-alias-methods': 'off',
    'jest/no-conditional-expect': 'off',
    '@typescript-eslint/no-empty-interface': 'off',
    'testing-library/prefer-screen-queries': 'off',
    'testing-library/no-node-access': 'off',
    'testing-library/no-container': 'off',
    '@typescript-eslint/no-namespace': 'off',
    'jest/prefer-to-have-length': 'off',
    '@typescript-eslint/require-await': 'off',
  },
};
