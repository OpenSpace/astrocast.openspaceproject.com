import { tsLint } from '@openspace/shared-configs/eslint';
import { defineConfig, globalIgnores } from 'eslint/config';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx,js}'],
    ignores: ['**/*.d.ts'],
    // The shared `reactLint` config cannot be used yet as `eslint-plugin-react` does not
    // support ESLint 10, see https://github.com/jsx-eslint/eslint-plugin-react/issues/3977
    // Until then, the React plugins are added here on top of the shared TypeScript config
    extends: [tsLint, reactHooks.configs.flat.recommended, reactRefresh.configs.vite],
    languageOptions: {
      globals: globals.browser
    },
    rules: {
      'no-console': 'warn'
    }
  }
]);
