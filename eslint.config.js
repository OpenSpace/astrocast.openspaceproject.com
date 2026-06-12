import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['**/*.d.ts'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      eslintConfigPrettier
    ],
    plugins: {
      'simple-import-sort': simpleImportSort
    },
    languageOptions: {
      globals: globals.browser
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      '@typescript-eslint/no-explicit-any': 'error', // Disallow usage of any
      'no-duplicate-imports': 'error', // Imports should be on one line
      'no-console': 'warn',
      'prefer-destructuring': ['error', { object: true, array: true }],
      'simple-import-sort/exports': 'error',
      'simple-import-sort/imports': [
        'error',
        {
          groups: [
            // Packages `react` related packages come first.
            ['^react', '^@?\\w'],
            // Internal packages.
            ['^(@|components)(/.*|$)'],
            // Side effect imports.
            ['^\\u0000'],
            // Parent imports. Put `..` last.
            ['^\\.\\.(?!/?$)', '^\\.\\./?$'],
            // Other relative imports. Put same-folder imports and `.` last.
            ['^\\./(?=.*/)(?!/?$)', '^\\.(?!/?$)', '^\\./?$'],
            // Style imports.
            ['^.+\\.?(css)$']
          ]
        }
      ],
      // 'react/jsx-curly-brace-presence': [
      //   'error',
      //   {
      //     props: 'always',
      //     children: 'never',
      //     propElementValues: 'always'
      //   }
      // ]
      // Guards against stupidity
      'no-self-compare': 'error',
      'no-unreachable-loop': 'error',
      'no-template-curly-in-string': 'error', // Catches "${}" template strings
      'default-case': ['error', { commentPattern: '^skip\\sdefault' }], // require default switch case
      'default-case-last': 'error' // enforce default switch case last
    }
  }
]);
