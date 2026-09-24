/**
 * @goodandready/dsh-model-search matcher module
 * Pure search matching algorithms: substring, subsequence/fuzzy, acronyms, and @provider filter.
 */

/**
 * Normalizes a single query token by stripping outer punctuation and converting to lowercase.
 */
export function cleanToken(token) {
  return token.replace(/^[\s,;./\-_]+|[\s,;./\-_]+$/g, '').toLowerCase()
}

/**
 * Splits and normalizes user query string into token list once per search input event.
 */
export function tokenizeQuery(query) {
  if (!query || typeof query !== 'string') return []
  return query
    .trim()
    .split(/[\s,;/]+/)
    .map(cleanToken)
    .filter(Boolean)
}

/**
 * Checks if search term is a subsequence of target string.
 * E.g. 'dsr1' matches 'deepseek-reasoner-1', 's35' matches 'sonnet-3-5'
 */
export function isSubsequenceMatch(target, term) {
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

/**
 * Extracts acronym / initials from target text.
 * E.g. 'deep-seek-coder' -> 'dsc', 'qwen-coder' -> 'qc'
 */
export function extractInitials(target) {
  return target
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .toLowerCase()
}

/**
 * Matches target model item against user query.
 * Supports:
 * - Substring matching (case-insensitive)
 * - Multi-term AND matching
 * - Provider specific filter: '@provider' (e.g. '@ollama', '@openai')
 * - Subsequence / acronym matching (e.g. 'dsr1' -> 'deepseek-reasoner-1')
 *
 * Query parameter accepts either raw string (split once) or pre-tokenized array of terms.
 */
export function matchesQuery(targetText, query, providerTitle = '') {
  const terms = Array.isArray(query) ? query : tokenizeQuery(query)
  if (terms.length === 0) return true

  const fullText = String(targetText || '').toLowerCase()
  const provText = String(providerTitle || '').toLowerCase()
  let initials = null

  return terms.every((term) => {
    // 1. Check for @provider filter syntax
    if (term.startsWith('@')) {
      const expectedProv = term.slice(1)
      if (!expectedProv) return true
      return provText.includes(expectedProv)
    }

    // 2. Direct substring match in model or provider
    if (fullText.includes(term)) return true
    if (provText.includes(term)) return true

    // 3. Initials / Acronym match (e.g. 'dsc' -> 'deep seek coder')
    if (initials === null) {
      initials = extractInitials(fullText)
    }
    if (initials.includes(term)) return true

    // 4. Subsequence fuzzy match if term is at least 3 characters
    if (term.length >= 3 && isSubsequenceMatch(fullText, term)) return true

    return false
  })
}
