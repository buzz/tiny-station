import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import eslintPluginSimpleImportSort from 'eslint-plugin-simple-import-sort'

const groupWithTypes = (/** @type {string} */ re) => [re, `${re}.*\\u0000$`]

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
    },
  },
  {
    name: `${BASE_NAME}/sort-imports`,
    plugins: {
      'simple-import-sort': eslintPluginSimpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': [
        'error',
        {
          // https://github.com/lydell/eslint-plugin-simple-import-sort#custom-grouping
          // custom groups with type imports last in each group
          groups: [
            ['^\\u0000'], // side-effects
            groupWithTypes('^node:'), // node modules
            groupWithTypes('^[@~]?(?:(?!\\/))\\w'), // 3rd party imports
            groupWithTypes('^@\\/'), // project imports
            ['(?<!\\u0000)$'], // absolute imports
            groupWithTypes('^\\.'), // relative imports
          ],
        },
      ],
      'simple-import-sort/exports': 'error',
    },
  }
)
