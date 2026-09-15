import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

const matcherSource = fs.readFileSync(path.join(root, 'lib/matcher.js'), 'utf8')
// Indent and strip export keywords for inlining inside factory closure
const inlinedMatcher = matcherSource
  .replace(/^export function /gm, 'function ')
  .replace(/^export const /gm, 'const ')
  .split('\n')
  .map((line) => (line.trim() ? '    ' + line : line))
  .join('\n')

const template = fs.readFileSync(path.join(root, 'src/client.template.js'), 'utf8')
const output = template.replace('// __INLINE_MATCHER__', inlinedMatcher.trim())

const targetPath = path.join(root, 'lib/client.js')

if (process.argv.includes('--check')) {
  if (!fs.existsSync(targetPath)) {
    console.error('Error: lib/client.js does not exist!')
    process.exit(1)
  }
  const current = fs.readFileSync(targetPath, 'utf8')
  if (current !== output) {
    console.error('Error: lib/client.js is out of sync with lib/matcher.js or src/client.template.js!')
    console.error('Run "npm run build" to regenerate it.')
    process.exit(1)
  }
  console.log('Build check passed: lib/client.js is up to date.')
} else {
  fs.writeFileSync(targetPath, output, 'utf8')
  console.log('Generated lib/client.js successfully.')
}
