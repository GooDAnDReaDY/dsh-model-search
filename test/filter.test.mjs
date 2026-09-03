import test from 'node:test'
import assert from 'node:assert/strict'

export function matchesQuery(targetText, query) {
  if (!query) return true
  const terms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (terms.length === 0) return true
  const text = String(targetText || '').toLocaleLowerCase()
  return terms.every(term => text.includes(term))
}

test('matchesQuery matches empty or whitespace query', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', ''), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', '   '), true)
})

test('matchesQuery matches case-insensitively', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'deepseek'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'FLASH'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'v4-flash'), true)
})

test('matchesQuery matches multiple terms regardless of word order', () => {
  const modelText = 'OpenAI Provider gpt-4o-mini GPT-4o Mini'
  assert.equal(matchesQuery(modelText, 'mini gpt'), true)
  assert.equal(matchesQuery(modelText, 'openai gpt mini'), true)
  assert.equal(matchesQuery(modelText, 'gpt openai mini'), true)
  assert.equal(matchesQuery(modelText, 'claude gpt'), false)
})

test('matchesQuery handles special characters safely', () => {
  const modelText = 'Anthropic claude-3.5-sonnet [beta] (v2)'
  assert.equal(matchesQuery(modelText, '3.5'), true)
  assert.equal(matchesQuery(modelText, '[beta]'), true)
  assert.equal(matchesQuery(modelText, '(v2)'), true)
  assert.equal(matchesQuery(modelText, 'sonnet*'), false)
})
