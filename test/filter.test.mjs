import test from 'node:test'
import assert from 'node:assert/strict'

function cleanToken(token) {
  return token.replace(/^[\s,;./\-_]+|[\s,;./\-_]+$/g, '').toLowerCase()
}

function isSubsequenceMatch(target, term) {
  if (!term || !target) return false
  let tIdx = 0
  let sIdx = 0
  while (tIdx < target.length && sIdx < term.length) {
    if (target[tIdx] === term[sIdx]) {
      sIdx++
    }
    tIdx++
  }
  return sIdx === term.length
}

function extractInitials(target) {
  return target
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toLowerCase()
}

export function matchesQuery(targetText, query, providerTitle = '') {
  if (!query || !query.trim()) return true
  const rawTerms = query
    .trim()
    .split(/[\s,;/]+/)
    .map(cleanToken)
    .filter(Boolean)

  if (rawTerms.length === 0) return true
  const fullText = String(targetText || '').toLowerCase()
  const provText = String(providerTitle || '').toLowerCase()
  const initials = extractInitials(fullText)

  return rawTerms.every((term) => {
    if (term.startsWith('@')) {
      const expectedProv = term.slice(1)
      if (!expectedProv) return true
      return provText.includes(expectedProv)
    }

    if (fullText.includes(term)) return true
    if (provText.includes(term)) return true
    if (initials.includes(term)) return true
    if (term.length >= 3 && isSubsequenceMatch(fullText, term)) return true

    return false
  })
}

// ── Test Suites ──────────────────────────────────────────────────────────────

test('matchesQuery: empty and whitespace query matches everything', () => {
  assert.equal(matchesQuery('provider/model-standard-v1', ''), true)
  assert.equal(matchesQuery('provider/model-standard-v1', '   '), true)
})

test('matchesQuery: exact and substring matching (case-insensitive)', () => {
  assert.equal(matchesQuery('provider/model-standard-v1', 'standard'), true)
  assert.equal(matchesQuery('provider/model-standard-v1', 'STANDARD'), true)
  assert.equal(matchesQuery('provider/model-standard-v1', 'model standard'), true)
  assert.equal(matchesQuery('provider/model-standard-v1', 'missing-token'), false)
})

test('matchesQuery: punctuation and multi-delimiter splitting', () => {
  assert.equal(matchesQuery('provider/model-standard-v1', 'model, standard'), true)
  assert.equal(matchesQuery('provider/model-standard-v1', 'provider/standard'), true)
  assert.equal(matchesQuery('provider/model-standard-v1', 'model; v1'), true)
})

test('matchesQuery: @provider syntax filtering', () => {
  const modelText = 'deep-reasoning-32b'
  const provName = 'Ollama Local'

  // Should match when @provider corresponds to provider title
  assert.equal(matchesQuery(modelText, '@ollama', provName), true)
  assert.equal(matchesQuery(modelText, '@local', provName), true)
  assert.equal(matchesQuery(modelText, '@ollama reasoning', provName), true)

  // Should not match when @provider targets another provider
  assert.equal(matchesQuery(modelText, '@openai', provName), false)
  assert.equal(matchesQuery(modelText, '@openrouter reasoning', provName), false)
})

test('matchesQuery: subsequence and acronym fuzzy matching', () => {
  // Initials matching
  assert.equal(matchesQuery('deep-seek-coder-large', 'dscl'), true)
  assert.equal(matchesQuery('quick-reasoning-model', 'qrm'), true)

  // Subsequence matching (length >= 3)
  assert.equal(matchesQuery('general-reasoner-model-v2', 'grm2'), true)
  assert.equal(matchesQuery('vision-model-preview-flash', 'vmf'), true)
  assert.equal(matchesQuery('vision-model-preview-flash', 'vmpf'), true)
})

test('matchesQuery: Chinese character search terms', () => {
  assert.equal(matchesQuery('通义千问-开源模型 qwen-model', '通义'), true)
  assert.equal(matchesQuery('智谱清言-推理模型 glm-reasoner', '智谱 清言'), true)
  assert.equal(matchesQuery('深度求索-代码模型 deep-coder', '深度'), true)
  assert.equal(matchesQuery('百度文心一言 ernie-model', '文心'), true)
  assert.equal(matchesQuery('百度文心一言 ernie-model', '腾讯'), false)
})
