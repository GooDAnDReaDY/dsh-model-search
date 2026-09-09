import test from 'node:test'
import assert from 'node:assert/strict'

const RU_TO_EN = {
  'й': 'q', 'ц': 'w', 'у': 'e', 'к': 'r', 'е': 't', 'н': 'y', 'г': 'u', 'ш': 'i', 'щ': 'o', 'з': 'p',
  'х': '[', 'ъ': ']', 'ф': 'a', 'ы': 's', 'в': 'd', 'а': 'f', 'п': 'g', 'р': 'h', 'о': 'j', 'л': 'k',
  'д': 'l', 'ж': ';', 'э': "'", 'я': 'z', 'ч': 'x', 'с': 'c', 'м': 'v', 'и': 'b', 'т': 'n', 'ь': 'm',
  'б': ',', 'ю': '.', '.': '/'
}
const EN_TO_RU = {
  'q': 'й', 'w': 'ц', 'e': 'у', 'r': 'к', 't': 'е', 'y': 'н', 'u': 'г', 'i': 'ш', 'o': 'щ', 'p': 'з',
  '[': 'х', ']': 'ъ', 'a': 'ф', 's': 'ы', 'd': 'в', 'f': 'а', 'g': 'п', 'h': 'р', 'j': 'о', 'k': 'л',
  'l': 'д', ';': 'ж', "'": 'э', 'z': 'я', 'x': 'ч', 'c': 'с', 'v': 'м', 'b': 'и', 'n': 'т', 'm': 'ь',
  ',': 'б', '.': 'ю', '/': '.'
}

function fixLayout(str) {
  let en = ''
  let ru = ''
  let hasRu = false
  let hasEn = false
  for (let i = 0; i < str.length; i++) {
    const ch = str[i]
    if (RU_TO_EN[ch]) {
      en += RU_TO_EN[ch]
      hasRu = true
    } else {
      en += ch
    }
    if (EN_TO_RU[ch]) {
      ru += EN_TO_RU[ch]
      hasEn = true
    } else {
      ru += ch
    }
  }
  return {
    en: hasRu ? en : null,
    ru: hasEn ? ru : null,
  }
}

const ALIASES = {
  'дипсик': 'deepseek',
  'дипсика': 'deepseek',
  'дипсеек': 'deepseek',
  'дип': 'deepseek',
  'гпт': 'gpt',
  'жпт': 'gpt',
  'чатгпт': 'gpt',
  'клод': 'claude',
  'клауд': 'claude',
  'клода': 'claude',
  'сонет': 'sonnet',
  'соннет': 'sonnet',
  'опус': 'opus',
  'хайку': 'haiku',
  'хайка': 'haiku',
  'квен': 'qwen',
  'кувен': 'qwen',
  'квэн': 'qwen',
  'гемини': 'gemini',
  'джемини': 'gemini',
  'джеминай': 'gemini',
  'геминай': 'gemini',
  'ламы': 'llama',
  'лама': 'llama',
  'микстрал': 'mixtral',
  'мистрал': 'mistral',
  'кодстрал': 'codestral',
  'флеш': 'flash',
  'флэш': 'flash',
  'про': 'pro',
  'мини': 'mini',
  'нано': 'nano',
  'плюс': 'plus',
  'макс': 'max',
  'кодер': 'coder',
  'ризонер': 'reasoner',
  'рассуждения': 'reasoner',
  'рассуждалка': 'reasoner',
  'опенкод': 'opencode',
  'опенаи': 'openai',
  'антропик': 'anthropic',
  'гугл': 'google',
  'грок': 'grok',
  'оллама': 'ollama',
  'опенроутер': 'openrouter',
  'опэнроутер': 'openrouter',
  'эмбеддинг': 'embedding',
  'эмбед': 'embedding',
  'яндекс': 'yandex',
  'сбер': 'sber',
  'гигачат': 'gigachat'
}

function cleanToken(token) {
  return token.replace(/^[\s,;./\-_]+|[\s,;./\-_]+$/g, '').toLocaleLowerCase()
}

export function matchesQuery(targetText, query) {
  if (!query) return true
  const rawTerms = query
    .trim()
    .split(/[\s,;/]+/)
    .map(cleanToken)
    .filter(Boolean)

  if (rawTerms.length === 0) return true
  const text = String(targetText || '').toLocaleLowerCase()

  return rawTerms.every((term) => {
    if (text.includes(term)) return true
    const alias = ALIASES[term]
    if (alias && text.includes(alias)) return true
    const layout = fixLayout(term)
    if (layout.en && text.includes(layout.en)) return true
    if (layout.ru && text.includes(layout.ru)) return true
    if (layout.en && ALIASES[layout.en] && text.includes(ALIASES[layout.en])) return true
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

test('matchesQuery handles punctuation and delimiters (commas, slashes, semicolons)', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'deepseek, flash'), true)
  assert.equal(matchesQuery('Qwen-2.5-Coder-32B', 'qwen/coder'), true)
  assert.equal(matchesQuery('Anthropic claude-3-5-sonnet', 'claude; sonnet'), true)
})

test('matchesQuery handles wrong keyboard layout (RU -> EN and EN -> RU)', () => {
  // йцукен -> qwerty
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'вуузыуул'), true)
  assert.equal(matchesQuery('OpenAI gpt-4o-mini', 'пзе-4щ'), true)
  assert.equal(matchesQuery('Anthropic claude-3-5-sonnet', 'сдфгву'), true)
  // qwerty -> йцукен
  assert.equal(matchesQuery('Яндекс YandexGPT 5 Pro', 'zyltrc'), true)
  assert.equal(matchesQuery('GigaChat-Pro Гигачат', 'ubufxfn'), true)
})

test('matchesQuery handles expanded Russian phonetic aliases', () => {
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'дипсик'), true)
  assert.equal(matchesQuery('DeepSeek-V4-Flash', 'дипсик флеш'), true)
  assert.equal(matchesQuery('OpenAI gpt-4o-mini', 'гпт мини'), true)
  assert.equal(matchesQuery('Anthropic claude-3-opus', 'клод опус'), true)
  assert.equal(matchesQuery('Anthropic claude-3-5-haiku', 'хайку'), true)
  assert.equal(matchesQuery('Qwen qwen-2.5-coder-32b', 'квен кодер'), true)
  assert.equal(matchesQuery('Google gemini-1.5-pro', 'гемини про'), true)
  assert.equal(matchesQuery('xAI grok-2', 'грок'), true)
  assert.equal(matchesQuery('Ollama llama-3.1', 'оллама'), true)
  assert.equal(matchesQuery('DeepSeek-R1-Reasoner', 'ризонер'), true)
})
