import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')

test('client module lifecycle: registers cleanly and handles deferred slots', async () => {
  const clientCode = fs.readFileSync(path.join(root, 'lib/client.js'), 'utf8')

  let registered = null
  const mockLoader = {
    load(reg) {
      registered = reg
    }
  }

  // Execute in isolated sandbox
  const fn = new Function('window', clientCode)
  const fakeWindow = {
    __ModuleLoader__: mockLoader
  }

  fn(fakeWindow)
  assert.ok(registered, 'ModuleLoader.load must be called')
  assert.equal(registered.id, '@goodandready/dsh-model-search')

  const mockRequire = (id) => {
    if (id === 'react') {
      return {
        useState: (init) => [init, () => {}],
        useCallback: (cb) => cb,
        useEffect: () => {},
        createElement: () => ({}),
      }
    }
    return {}
  }

  const exports = registered.factory(mockRequire)
  assert.equal(typeof exports.apply, 'function', 'apply must be exported')
  assert.deepEqual(exports.inject, ['slots', 'locale'], 'canonical client injects')

  let injectedSlot = null
  let slotCallback = null
  const effects = []

  const mockCtx = {
    locale: {
      register: () => () => {},
      bind: () => (k) => k,
    },
    slots: {
      inject: (name, cb) => {
        injectedSlot = name
        slotCallback = cb
        return () => {}
      },
      register: () => () => {},
    },
    effect: (fn, label) => {
      effects.push({ fn, label })
      return fn()
    },
  }

  // Calling apply must not throw even without DOM
  assert.doesNotThrow(() => {
    exports.apply(mockCtx)
  })

  assert.equal(injectedSlot, 'settings.plugin.item', 'must register deferred slot injection')
  assert.equal(typeof slotCallback, 'function', 'must provide slot callback')

  // Calling the slot callback when slots.register throws must be caught safely
  mockCtx.slots.register = () => {
    throw new Error('slot "settings.plugin.item" is not declared')
  }
  assert.doesNotThrow(() => {
    slotCallback()
  })
})
