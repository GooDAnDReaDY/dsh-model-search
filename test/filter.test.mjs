import test from 'node:test'
import assert from 'node:assert/strict'
import {
  cleanToken,
  isSubsequenceMatch,
  extractInitials,
  matchesQuery,
} from '../lib/matcher.js'

// ── Test Suites ──────────────────────────────────────────────────────────────

test('matcher module: exports all required functions', () => {
  assert.equal(typeof cleanToken, 'function')
  assert.equal(typeof isSubsequenceMatch, 'function')
  assert.equal(typeof extractInitials, 'function')
  assert.equal(typeof matchesQuery, 'function')
})

test('cleanToken: strips punctuation and normalizes casing', () => {
  assert.equal(cleanToken('  ,;Hello-World_!./  '), 'hello-world_!')
  assert.equal(cleanToken('@Ollama'), '@ollama')
  assert.equal(cleanToken('...Test...'), 'test')
})

test('isSubsequenceMatch: verifies subsequence correctly', () => {
  assert.equal(isSubsequenceMatch('deepseek-reasoner-1', 'dsr1'), true)
  assert.equal(isSubsequenceMatch('deepseek-reasoner-1', 'dsr2'), false)
  assert.equal(isSubsequenceMatch('claude-3-5-sonnet', 'c35s'), true)
  assert.equal(isSubsequenceMatch('', 'abc'), false)
  assert.equal(isSubsequenceMatch('abc', ''), false)
})

test('extractInitials: extracts word initials from kebab/snake/space text', () => {
  assert.equal(extractInitials('deep-seek-coder'), 'dsc')
  assert.equal(extractInitials('qwen_coder_plus'), 'qcp')
  assert.equal(extractInitials('Claude 3.5 Sonnet'), 'c35s')
})

test('matchesQuery: empty and whitespace query matches everything', () => {
  assert.equal(matchesQuery('provider/model-standard-v1', ''), true)
  assert.equal(matchesQuery('provider/model-standard-v1', '   '), true)
})

test('matchesQuery: exact and substring matching (case-insensitive)', () => {
  assert.equal(matchesQuery('model-standard-v1', 'standard', 'Provider A'), true)
  assert.equal(matchesQuery('model-standard-v1', 'STANDARD', 'Provider A'), true)
  assert.equal(matchesQuery('model-standard-v1', 'model standard', 'Provider A'), true)
  assert.equal(matchesQuery('model-standard-v1', 'missing-token', 'Provider A'), false)
})

test('matchesQuery: punctuation and multi-delimiter splitting', () => {
  assert.equal(matchesQuery('model-standard-v1', 'model, standard', 'Provider A'), true)
  assert.equal(matchesQuery('model-standard-v1', 'model/standard', 'Provider A'), true)
  assert.equal(matchesQuery('model-standard-v1', 'model; v1', 'Provider A'), true)
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

test('matchesQuery: separate provider and model matching without false positives', () => {
  const modelText = 'chat-completion-v1'
  const provName = 'OpenAI'

  // Provider title alone matches when searching for provider name
  assert.equal(matchesQuery(modelText, 'openai', provName), true)

  // Combined terms: provider and model
  assert.equal(matchesQuery(modelText, 'openai chat', provName), true)

  // Different model term should fail
  assert.equal(matchesQuery(modelText, 'openai vision', provName), false)
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
