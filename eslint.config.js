import tsParser from '@typescript-eslint/parser';

export default [
  {ignores: ['node_modules/**', 'backend/node_modules/**', 'dist/**', 'backend/build/**', 'coverage/**', 'src-tauri/target/**', 'src-tauri/gen/**', 'android/**']},
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {parser: tsParser, parserOptions: {ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: {jsx: true}}},
    rules: {
      'no-debugger': 'error',
      'no-constant-condition': 'error',
      'no-duplicate-imports': 'error',
    },
  },
];
