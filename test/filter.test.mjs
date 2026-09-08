import test from 'node:test'
import assert from 'node:assert/strict'

const RU_EN_LAYOUT = {
  'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
  'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
  'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
  'б': ',', 'ю': '.', '.': '/'
}

function fixLayout(str) {
  let res = ''
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    res += RU_EN_LAYOUT[ch] || ch
  }
  return res
}

const ALIASES = {
  'дипсик': 'deepseek',
  'дипсика': 'deepseek',
  'дипсеек': 'deepseek',
  'дип': 'deepseek',
  'гпт': 'gpt',
  'жпт': 'gpt',
  'клод': 'claude',
  'клауд': 'claude',
  'клода': 'claude',
  'сонет': 'sonnet',
  'соннет': 'sonnet',
  'квен': 'qwen',
  'кувен': 'qwen',
  'гемини': 'gemini',
  'джемини': 'gemini',
  'ламы': 'llama',
  'лама': 'llama',
  'микстрал': 'mixtral',
  'мистрал': 'mistral',
  'флеш': 'flash',
  'флэш': 'flash',
  'про': 'pro',
  'мини': 'mini',
  'плюс': 'plus',
  'кодер': 'coder',
  'опенкод': 'opencode',
  'опенаи': 'openai',
  'антропик': 'anthropic',
  'гугл': 'google'
}

function expandQueryTerm(term) {
  const clean = term.toLocaleLowerCase()
  const alias = ALIASES[clean]
  const fixed = fixLayout(clean)
  return {
    term: clean,
    alias: alias || null,
    fixed: fixed !== clean ? fixed : null,
  }
}

export function matchesQuery(targetText, query) {
  if (!query) return true
  const rawTerms = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean)
  if (rawTerms.length === 0) return true
  const text = String(targetText || '').toLocaleLowerCase()

  return rawTerms.every((raw) => {
    const { term, alias, fixed } = expandQueryTerm(raw)
    if (text.includes(term)) return true
    if (alias && text.includes(alias)) return true
    if (fixed && text.includes(fixed)) return true
    return false
  })
}

test('matchesQuery matches empty or whitespace query', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', ''), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', '   '), true)
})

test('matchesQuery matches case-insensitively and multi-terms', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'deepseek'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'flash deepseek'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'v4 flash'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'gpt'), false)
})

test('matchesQuery handles wrong keyboard layout (йцукен -> qwerty)', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'вуузыуул'), true)
  assert.equal(matchesQuery('OpenAI gpt-4o-mini', 'пзе-4щ'), true)
  assert.equal(matchesQuery('Anthropic claude-3-5-sonnet', 'сдфгву'), true)
})

test('matchesQuery handles Russian phonetic aliases', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'дипсик'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'дипсик флеш'), true)
  assert.equal(matchesQuery('OpenAI gpt-4o-mini', 'гпт мини'), true)
  assert.equal(matchesQuery('Anthropic claude-3-5-sonnet', 'клод сонет'), true)
  assert.equal(matchesQuery('Qwen qwen-2.5-coder-32b', 'квен кодер'), true)
  assert.equal(matchesQuery('Google gemini-1.5-pro', 'гемини про'), true)
})
