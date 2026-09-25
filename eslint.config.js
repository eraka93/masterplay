import js from '@eslint/js'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'
import globals from 'globals'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  // functions/ is a separate npm project (own package.json, tsconfig, Node runtime target) with
  // its own toolchain — see functions/package.json.
  { ignores: ['dist', 'dev-dist', 'coverage', 'functions'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/consistent-type-imports': ['warn', { prefer: 'type-imports' }],
      // This project intentionally uses plain fetch-on-mount hooks (see useCollectionData,
      // useUserProfile) instead of a data-fetching library — the React Compiler-oriented
      // "no setState in an effect" rule flags that idiomatic pattern itself, not a real bug.
      'react-hooks/set-state-in-effect': 'off',
    },
  },
  prettierConfig,
)
