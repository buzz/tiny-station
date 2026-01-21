import js from '@eslint/js'
import globals from 'globals'
import importPlugin from 'eslint-plugin-import'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  importPlugin.flatConfigs.recommended,
  { ignores: ['node_modules/**', 'dist/**', '*.js'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: {
      ecmaVersion: 2021,
      globals: { ...globals.node, ...globals.es2021 },
    },
    rules: {
      'no-console': 'off',
      'no-underscore-dangle': ['error', { allow: ['__dirname'] }],
      'import/extensions': ['error', 'always'],
    },
  }
)
