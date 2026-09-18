import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('tree hygiene: no leftover .tgz release archives in repository root or tree', () => {
  function findTgz(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    const results = []
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.worktrees') {
        continue
      }
      const fullPath = path.join(dir, entry.name)
      if (entry.isDirectory()) {
        results.push(...findTgz(fullPath))
      } else if (entry.name.endsWith('.tgz')) {
        results.push(path.relative(root, fullPath))
      }
    }
    return results
  }

  const tgzFiles = findTgz(root)
  assert.deepEqual(
    tgzFiles,
    [],
    `Found leftover tarball archives in repository: ${tgzFiles.join(', ')}. Release packaging must use "npm pack --pack-destination /tmp"`
  )
})
