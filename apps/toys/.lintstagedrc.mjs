import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const buildEslintCommand = (filenames) =>
  `next lint --fix --file ${filenames
    .map((f) => path.relative(__dirname, f))
    .join(' --file ')}`

export default {
  '*.{js,jsx,ts,tsx}': [buildEslintCommand],
}
