import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('build parity: lib/client.js matches src/client.template.js + lib/matcher.js', () => {
  const matcherSource = fs.readFileSync(path.join(root, 'lib/matcher.js'), 'utf8')
  const inlinedMatcher = matcherSource
    .replace(/^export function /gm, 'function ')
    .replace(/^export const /gm, 'const ')
    .split('\n')
    .map((line) => (line.trim() ? '    ' + line : line))
    .join('\n')

  const template = fs.readFileSync(path.join(root, 'src/client.template.js'), 'utf8')
  const expected = template.replace('// __INLINE_MATCHER__', inlinedMatcher.trim())
  const actual = fs.readFileSync(path.join(root, 'lib/client.js'), 'utf8')

  assert.equal(actual, expected, 'lib/client.js must be in sync with lib/matcher.js')
})
