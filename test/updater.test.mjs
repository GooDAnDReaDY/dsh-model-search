import test from 'node:test'
import assert from 'node:assert/strict'
import { isTrustedUpdateRequest, isNewerVersion, registerPluginUpdater, getUpdateStatus } from '../lib/updater.js'

test('isTrustedUpdateRequest: security validations (fail-closed)', () => {
  // Missing header
  assert.equal(
    isTrustedUpdateRequest({
      headers: {},
      socket: { remoteAddress: '127.0.0.1' },
    }),
    false,
    'must reject request missing x-dsh-plugin-update: 1'
  )

  // Remote IP
  assert.equal(
    isTrustedUpdateRequest({
      headers: { 'x-dsh-plugin-update': '1', origin: 'http://192.168.1.50:3080', host: '192.168.1.50:3080' },
      socket: { remoteAddress: '192.168.1.50' },
    }),
    false,
    'must reject remote non-loopback IP'
  )

  // Cross-site
  assert.equal(
    isTrustedUpdateRequest({
      headers: {
        'x-dsh-plugin-update': '1',
        'sec-fetch-site': 'cross-site',
        origin: 'http://localhost:3080',
        host: 'localhost:3080',
      },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    false,
    'must reject cross-site request'
  )

  // Mismatched origin and host
  assert.equal(
    isTrustedUpdateRequest({
      headers: {
        'x-dsh-plugin-update': '1',
        origin: 'http://localhost:4000',
        host: 'localhost:3080',
      },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    false,
    'must reject mismatched origin and host'
  )

  // Valid loopback same-origin request
  assert.equal(
    isTrustedUpdateRequest({
      headers: {
        'x-dsh-plugin-update': '1',
        'sec-fetch-site': 'same-origin',
        origin: 'http://localhost:3080',
        host: 'localhost:3080',
      },
      socket: { remoteAddress: '127.0.0.1' },
    }),
    true,
    'must accept trusted loopback same-origin request'
  )

  // Valid IPv6 loopback [::1]
  assert.equal(
    isTrustedUpdateRequest({
      headers: {
        'x-dsh-plugin-update': '1',
        origin: 'http://[::1]:3080',
        host: '[::1]:3080',
      },
      socket: { remoteAddress: '::1' },
    }),
    true,
    'must accept trusted IPv6 loopback request'
  )
})

test('isNewerVersion: semver and prerelease comparison', () => {
  assert.equal(isNewerVersion('0.1.6', '0.1.7'), true, 'patch upgrade should be newer')
  assert.equal(isNewerVersion('0.1.6', '0.2.0'), true, 'minor upgrade should be newer')
  assert.equal(isNewerVersion('0.1.6', '1.0.0'), true, 'major upgrade should be newer')
  assert.equal(isNewerVersion('0.1.6', '0.1.6'), false, 'identical version should not be newer')
  assert.equal(isNewerVersion('0.1.7', '0.1.6'), false, 'downgrade should not be newer')

  // Prerelease transitions
  assert.equal(isNewerVersion('0.1.7-alpha.1', '0.1.7-alpha.2'), true, 'newer prerelease should be newer')
  assert.equal(isNewerVersion('0.1.7-alpha.1', '0.1.7'), true, 'stable release should be newer than prerelease')
  assert.equal(isNewerVersion('0.1.7', '0.1.7-alpha.1'), false, 'prerelease should not be newer than stable')
  assert.equal(isNewerVersion('invalid', '0.1.7'), false, 'invalid current semver returns false')
  assert.equal(isNewerVersion('0.1.7', 'invalid'), false, 'invalid candidate semver returns false')
})

test('registerPluginUpdater: route registration, HTTP verbs, and security', async () => {
  let registeredRoute = null
  const fakeCtx = {
    webServer: {
      register: (route) => {
        registeredRoute = route
        return () => {}
      },
    },
    logger: { warn: () => {} },
  }

  registerPluginUpdater(fakeCtx, {
    endpoint: '/api/dsh-model-search/update',
    packageName: '@goodandready/dsh-model-search',
    manifestUrl: new URL('../package.json', import.meta.url),
  })

  assert.ok(registeredRoute, 'route must be registered')
  assert.equal(registeredRoute.path, '/api/dsh-model-search/update')
  assert.equal(registeredRoute.kind, 'exact')

  // 1. GET returns status
  let getStatus = 0
  let getHeaders = {}
  let getBody = ''
  await registeredRoute.handler(
    { method: 'GET' },
    {
      writeHead: (s, h) => { getStatus = s; getHeaders = h },
      end: (data) => { getBody = data },
    }
  )
  assert.equal(getStatus, 200)
  assert.equal(getHeaders['content-type'], 'application/json; charset=utf-8')
  const statusData = JSON.parse(getBody)
  assert.equal(statusData.packageName, '@goodandready/dsh-model-search')
  assert.ok(typeof statusData.currentVersion === 'string')

  // 2. Unsupported method returns 405
  let delStatus = 0
  let delHeaders = {}
  await registeredRoute.handler(
    { method: 'DELETE' },
    {
      writeHead: (s, h) => { delStatus = s; delHeaders = h },
      end: () => {},
    }
  )
  assert.equal(delStatus, 405)
  assert.equal(delHeaders.allow, 'GET, HEAD, POST')

  // 3. Untrusted POST returns 403
  let postStatus = 0
  let postBody = ''
  await registeredRoute.handler(
    {
      method: 'POST',
      headers: {},
      socket: { remoteAddress: '192.168.1.100' },
    },
    {
      writeHead: (s) => { postStatus = s },
      end: (data) => { postBody = data },
    }
  )
  assert.equal(postStatus, 403)
  assert.ok(JSON.parse(postBody).error.includes('Rejected'))
})
