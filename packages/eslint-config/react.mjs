import path from 'node:path'
import { fileURLToPath } from 'node:url'
import eslint from '@eslint/js'
import reactPlugin from 'eslint-plugin-react'
import reactHooksPlugin from 'eslint-plugin-react-hooks'
import tseslint from 'typescript-eslint'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
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
    ignores: ['node_modules/', 'dist/', 'eslint.config.{js,mjs}, "**/*.css"'],
    plugins: {
      'react-hooks': reactHooksPlugin,
    },
    // add rules configurations here
    rules: {
      'import/no-default-export': 'off',
      ...reactHooksPlugin.configs.recommended.rules,
    },
  },
  {
    files: ['**/**/*.{js,jsx}'],
    ...tseslint.configs.disableTypeChecked,
  },
)
