import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { fixupConfigRules } from '@eslint/compat'
import { FlatCompat } from '@eslint/eslintrc'
import eslint from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: eslint.configs.recommended,
  allConfig: eslint.configs.all,
})

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...fixupConfigRules(compat.extends('plugin:@next/next/core-web-vitals')),
  ...compat.extends('turbo'),
  {
    files: ['**/**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    ...reactPlugin.configs.flat.recommended,
    ...reactPlugin.configs.flat['jsx-runtime'],
    languageOptions: {
      ...reactPlugin.configs.flat.recommended.languageOptions,
      parserOptions: {
        project: ['./apps/*/tsconfig.json', './packages/*/tsconfig.json'],
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        React: true,
        JSX: true,
      },
    },
    ignores: ['node_modules/', 'dist/', 'eslint.config.{js,mjs}'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    // add rules configurations here
    rules: {
      'import/no-default-export': 'off',
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/**/*.{js,jsx}'],
    ...tseslint.configs.disableTypeChecked,
  },
)
