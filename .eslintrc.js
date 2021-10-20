module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['airbnb', 'prettier'],
  parser: '@babel/eslint-parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 13,
    sourceType: 'module',
  },
  plugins: ['prettier', 'react-hooks'],
  root: true,
  rules: {
    'prettier/prettier': 'error',
    'jsx-a11y/anchor-is-valid': 'off',
    'react/jsx-filename-extension': [
      'error',
      {
        extensions: ['.js'],
      },
    ],
    'react/prop-types': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/react-in-jsx-scope': 'off',
  },
  settings: {
    react: { version: 'detect' },
  },
}
