import eslintJs from '@eslint/js'
import eslintReact from '@eslint-react/eslint-plugin'
import { defineConfig } from 'eslint/config'
import { importX } from 'eslint-plugin-import-x'
import prettierRecommended from 'eslint-plugin-prettier/recommended'
import reactHooks from 'eslint-plugin-react-hooks'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tsEslint from 'typescript-eslint'

const groupWithTypes = (/** @type {string} */ re) => [re, String.raw`${re}.*\u0000$`]

/** * Shared configuration for all projects */
const config = defineConfig(
  // Global Ignores
  { ignores: ['**/dist/**', '**/node_modules/**'] },

  // Base Configs (JS, Import, Unicorn, TS)
  eslintJs.configs.recommended,
  importX.flatConfigs.recommended,
  unicorn.configs.recommended,
  ...tsEslint.configs.strictTypeChecked,
  ...tsEslint.configs.stylisticTypeChecked,

  // Shared
  {
    languageOptions: {
      globals: globals.es2022,
      parserOptions: {
        projectService: {
          // Just for linting this file (`eslint.config.js`)
          allowDefaultProject: ['*.js'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    plugins: {
      // only define plugins that aren't automatically included by the configs spread above
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      // --- Standard Rules ---
      curly: 'error',
      'no-restricted-imports': 'off', // handled by TS

      // --- Import Rules ---
      'import-x/named': 'off', // handled by TS
      'import-x/namespace': 'off',
      'import-x/default': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/first': 'error',
      'import-x/no-duplicates': 'error',
      'import-x/no-unresolved': 'off', // handled by TS

      // --- Simple Import Sort ---
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            [String.raw`^\u0000`], // side-effects
            groupWithTypes('^node:'),
            groupWithTypes(String.raw`^@?(?:(?!listen-app\/))\w`), // 3rd party
            groupWithTypes(String.raw`^@listen-app\/`), // Internal packages
            [String.raw`(?<!\u0000)$`], // absolute
            groupWithTypes('^#'), // ts paths
            groupWithTypes(String.raw`^\.`), // relative
            [String.raw`\.module\.css$`], // css
          ],
        },
      ],

      // --- TypeScript Rules ---
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/consistent-type-imports': ['error', { disallowTypeAnnotations: false }],
      '@typescript-eslint/indent': 'off', // Prettier handles this
      '@typescript-eslint/restrict-template-expressions': ['error', { allowNumber: true }],
      '@typescript-eslint/no-unnecessary-condition': [
        'error',
        { allowConstantLoopConditions: true },
      ],
      '@typescript-eslint/unbound-method': 'off',
      '@typescript-eslint/no-unused-vars': ['error', { ignoreRestSiblings: true }],

      // --- Unicorn Rules ---
      'unicorn/filename-case': 'off',
      'unicorn/no-null': 'off',
      'unicorn/prevent-abbreviations': 'off',
    },
  },

  // packages/frontend
  {
    files: ['packages/frontend/src/**/*.{ts,tsx}'],
    extends: [eslintReact.configs['strict-typescript'], reactHooks.configs.flat.recommended],
    languageOptions: {
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'import-x/extensions': [
        'error',
        { css: 'always', json: 'always', svg: 'always', ts: 'never' },
      ],
    },
  },

  // packages/server
  {
    files: ['packages/server/src/**/*.ts'],
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'no-console': 'off',
      'no-underscore-dangle': [
        'error',
        {
          allow: ['__dirname'],
          allowAfterThis: true, // For private class properties
        },
      ],
      'import-x/extensions': ['error', 'always'],
      'unicorn/prefer-event-target': 'off',
      'unicorn/no-process-exit': 'off',
    },
  },

  // packages/common
  {
    files: ['packages/common/src/**/*.ts'],
    rules: {
      'no-console': 'off',
    },
  },

  // Prettier must be last to overwrite any conflicting formatting rules
  prettierRecommended
)

export default config
