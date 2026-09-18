/**
 * @goodandready/dsh-model-search
 * DeepSeek Harness WebUI: Live searchable model selector enhancement.
 */
window.__ModuleLoader__.load({
  id: '@goodandready/dsh-model-search',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports

    // ── Matching Engine (inlined from lib/matcher.js) ────────────────────────

/**
     * @goodandready/dsh-model-search matcher module
     * Pure search matching algorithms: substring, subsequence/fuzzy, acronyms, and @provider filter.
     */

    /**
     * Normalizes a single query token by stripping outer punctuation and converting to lowercase.
     */
    function cleanToken(token) {
      return token.replace(/^[\s,;./\-_]+|[\s,;./\-_]+$/g, '').toLowerCase()
    }

    /**
     * Checks if search term is a subsequence of target string.
     * E.g. 'dsr1' matches 'deepseek-reasoner-1', 's35' matches 'sonnet-3-5'
     */
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

    /**
     * Extracts acronym / initials from target text.
     * E.g. 'deep-seek-coder' -> 'dsc', 'qwen-coder' -> 'qc'
     */
    function extractInitials(target) {
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
     */
    function matchesQuery(targetText, query, providerTitle = '') {
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
        if (initials.includes(term)) return true

        // 4. Subsequence fuzzy match if term is at least 3 characters
        if (term.length >= 3 && isSubsequenceMatch(fullText, term)) return true

        return false
      })
    }

    // ── Localization (EN & ZH native; RU supplied via dsh-russian-lang) ──────

    const I18N = {
      en: {
        placeholder: 'Search model or provider…',
        empty: 'No matching models',
        clear: 'Clear search',
      },
      zh: {
        placeholder: '搜索模型或服务商…',
        empty: '没有找到匹配的模型',
        clear: '清除搜索',
      },
    }

    let translate = null

    function getStrings() {
      if (typeof translate === 'function') {
        return {
          placeholder: translate('dms.placeholder'),
          empty: translate('dms.empty'),
          clear: translate('dms.clear'),
        }
      }

      const lang = (
        (typeof document !== 'undefined' && document.documentElement?.lang) ||
        (typeof navigator !== 'undefined' && navigator.language) ||
        'en'
      ).toLowerCase()

      if (lang.startsWith('zh')) return I18N.zh
      return I18N.en
    }

    // ── Styles ───────────────────────────────────────────────────────────────

    const STYLE_ID = 'dms-model-search-styles'

    function injectStyles() {
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
      const style = document.createElement('style')
      style.id = STYLE_ID
      style.dataset.dshPlugin = 'dsh-model-search'
      style.textContent = `
        .dms-wrap {
          position: sticky;
          top: 0;
          z-index: 10;
          box-sizing: border-box;
          width: 100%;
          padding: 4px 6px 6px;
          background: var(--dsw-specific-menu, #1e1e2e);
          border-bottom: 1px solid var(--dsw-alias-border-l1, rgba(255, 255, 255, 0.08));
          margin-bottom: 4px;
        }
        .dms-input-container {
          position: relative;
          display: flex;
          align-items: center;
          width: 100%;
        }
        .dms-input {
          box-sizing: border-box;
          width: 100%;
          height: 32px;
          padding: 0 28px 0 10px;
          font-family: inherit;
          font-size: 13px;
          line-height: 20px;
          border-radius: 8px;
          border: 1px solid var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.12));
          background: var(--dsw-alias-bg-base, rgba(0, 0, 0, 0.2));
          color: var(--dsw-alias-label-primary, #ffffff);
          outline: none;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .dms-input::-webkit-search-cancel-button,
        .dms-input::-webkit-search-decoration,
        .dms-input::-webkit-search-results-button,
        .dms-input::-webkit-search-results-decoration {
          display: none;
          -webkit-appearance: none;
        }
        .dms-input::placeholder {
          color: var(--dsw-alias-label-tertiary, rgba(255, 255, 255, 0.4));
        }
        .dms-input:focus {
          border-color: var(--dsw-alias-state-business-primary, #4a9eff);
          box-shadow: 0 0 0 1px var(--dsw-alias-state-business-primary, #4a9eff);
        }
        .dms-clear {
          position: absolute;
          right: 6px;
          display: none;
          align-items: center;
          justify-content: center;
          width: 18px;
          height: 18px;
          padding: 0;
          border: none;
          border-radius: 50%;
          background: var(--dsw-alias-border-l2, rgba(255, 255, 255, 0.16));
          color: var(--dsw-alias-label-secondary, rgba(255, 255, 255, 0.7));
          font-size: 12px;
          line-height: 1;
          cursor: pointer;
          user-select: none;
        }
        .dms-clear:hover {
          background: var(--dsw-alias-interactive-bg-hover, rgba(255, 255, 255, 0.25));
          color: var(--dsw-alias-label-primary, #ffffff);
        }
        .dms-clear.dms-visible {
          display: flex;
        }
        .dms-empty {
          display: none;
          padding: 12px 10px;
          color: var(--dsw-alias-label-tertiary, rgba(255, 255, 255, 0.4));
          font-size: 13px;
          line-height: 20px;
          text-align: center;
        }
      `
      document.head.appendChild(style)
    }

    // ── State Management (WeakMap avoids expando properties on alien nodes) ─

    const trackedMenus = new WeakMap()
    const activeMenus = new Set()

    // ── DOM Search Attachment ────────────────────────────────────────────────

    function attachSearch(menu, groups) {
      if (trackedMenus.has(menu)) {
        const existing = trackedMenus.get(menu)
        if (existing?.wrap?.isConnected) return
        detachSearch(menu)
      }

      const strings = getStrings()

      const wrap = document.createElement('div')
      wrap.className = 'dms-wrap'
      wrap.setAttribute('role', 'search')

      const inputContainer = document.createElement('div')
      inputContainer.className = 'dms-input-container'

      const input = document.createElement('input')
      input.type = 'text'
      input.className = 'dms-input'
      input.placeholder = strings.placeholder
      input.setAttribute('aria-label', strings.placeholder)
      input.setAttribute('autocomplete', 'off')
      input.setAttribute('spellcheck', 'false')

      const clear = document.createElement('button')
      clear.type = 'button'
      clear.className = 'dms-clear'
      clear.textContent = '×'
      clear.setAttribute('aria-label', strings.clear)

      const empty = document.createElement('div')
      empty.className = 'dms-empty'
      empty.textContent = strings.empty
      empty.setAttribute('aria-live', 'polite')

      inputContainer.appendChild(input)
      inputContainer.appendChild(clear)
      wrap.appendChild(inputContainer)

      groups.parentElement?.insertBefore(wrap, groups)
      groups.parentElement?.insertBefore(empty, groups)

      function getVisibleOptions() {
        return Array.from(
          groups.querySelectorAll('button[role="menuitemradio"]:not([aria-hidden="true"])')
        )
      }

      // Filtering logic
      const updateFilter = () => {
        const query = input.value
        clear.classList.toggle('dms-visible', query.trim().length > 0)
        groups.scrollTop = 0

        let totalVisible = 0
        const sectionGroups = groups.querySelectorAll('section[role="group"]')

        if (!query.trim()) {
          for (const grp of sectionGroups) {
            grp.style.display = ''
            grp.removeAttribute('aria-hidden')
            for (const opt of grp.querySelectorAll('button[role="menuitemradio"]')) {
              opt.style.display = ''
              opt.removeAttribute('aria-hidden')
              totalVisible++
            }
          }
          empty.style.display = 'none'
          return
        }

        for (const grp of sectionGroups) {
          const headingId = grp.getAttribute('aria-labelledby')
          const groupTitle = (headingId ? grp.querySelector('#' + CSS.escape(headingId))?.textContent : '') ||
                             grp.querySelector('div')?.textContent || ''
          const options = grp.querySelectorAll('button[role="menuitemradio"]')
          let groupVisible = 0

          for (const opt of options) {
            const textContent = opt.textContent || ''
            const titleAttr = opt.getAttribute('title') || ''
            const modelText = `${textContent} ${titleAttr}`

            const match = matchesQuery(modelText, query, groupTitle)
            if (match) {
              opt.style.display = ''
              opt.removeAttribute('aria-hidden')
              groupVisible++
            } else {
              opt.style.display = 'none'
              opt.setAttribute('aria-hidden', 'true')
            }
          }

          if (groupVisible > 0) {
            grp.style.display = ''
            grp.removeAttribute('aria-hidden')
            totalVisible += groupVisible
          } else {
            grp.style.display = 'none'
            grp.setAttribute('aria-hidden', 'true')
          }
        }

        empty.style.display = totalVisible === 0 ? 'block' : 'none'
      }

      const onInput = () => updateFilter()
      input.addEventListener('input', onInput)

      // Keyboard navigation
      const onInputKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault()
          const visible = getVisibleOptions()
          if (visible.length > 0) visible[0].focus()
        } else if (e.key === 'Enter') {
          e.preventDefault()
          const visible = getVisibleOptions()
          if (visible.length > 0) visible[0].click()
        } else if (e.key === 'Escape') {
          if (input.value) {
            e.preventDefault()
            e.stopPropagation()
            input.value = ''
            updateFilter()
          }
        } else {
          e.stopPropagation()
        }
      }
      input.addEventListener('keydown', onInputKeyDown)

      // Arrow navigation inside list
      const onGroupsKeyDown = (e) => {
        if (!input.value.trim()) return
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          const visible = getVisibleOptions()
          if (visible.length === 0) return
          const currentIdx = visible.indexOf(document.activeElement)
          if (currentIdx !== -1) {
            e.preventDefault()
            e.stopPropagation()
            if (e.key === 'ArrowDown') {
              const nextIdx = (currentIdx + 1) % visible.length
              visible[nextIdx].focus()
            } else if (e.key === 'ArrowUp') {
              if (currentIdx === 0) {
                input.focus()
              } else {
                visible[currentIdx - 1].focus()
              }
            }
          }
        }
      }
      groups.addEventListener('keydown', onGroupsKeyDown)

      const onClearClick = () => {
        input.value = ''
        updateFilter()
        input.focus()
      }
      clear.addEventListener('click', onClearClick)

      const onWrapStop = (e) => e.stopPropagation()
      wrap.addEventListener('mousedown', onWrapStop)
      wrap.addEventListener('click', onWrapStop)

      let focusTimer = setTimeout(() => {
        if (input.isConnected) input.focus()
      }, 50)

      const cleanup = () => {
        clearTimeout(focusTimer)
        input.removeEventListener('input', onInput)
        input.removeEventListener('keydown', onInputKeyDown)
        groups.removeEventListener('keydown', onGroupsKeyDown)
        clear.removeEventListener('click', onClearClick)
        wrap.removeEventListener('mousedown', onWrapStop)
        wrap.removeEventListener('click', onWrapStop)
        wrap.remove()
        empty.remove()
      }

      const state = {
        wrap,
        empty,
        input,
        clear,
        groups,
        updateFilter,
        cleanup,
      }

      trackedMenus.set(menu, state)
      activeMenus.add(menu)
    }

    function detachSearch(menu) {
      const state = trackedMenus.get(menu)
      if (state) {
        state.cleanup()
        trackedMenus.delete(menu)
        activeMenus.delete(menu)
      }
    }

    // ── DOM Scanning ─────────────────────────────────────────────────────────

    function scan() {
      const menus = document.querySelectorAll('[role="menu"], [class*="_menu"]')
      for (const menu of menus) {
        const groups = menu.querySelector('[class*="_groups"], div.scrollable, div[class*="groups"]')
        const hasModelGroups = groups && groups.querySelector('section[role="group"]')

        if (hasModelGroups) {
          attachSearch(menu, groups)
          const state = trackedMenus.get(menu)
          if (state?.input?.value) {
            state.updateFilter()
          }
        } else if (trackedMenus.has(menu)) {
          detachSearch(menu)
        }
      }
    }

    // ── Lifecycle ────────────────────────────────────────────────────────────

    let observer = null
    let scanScheduled = false

    function scheduleScan() {
      if (scanScheduled) return
      scanScheduled = true
      requestAnimationFrame(() => {
        scanScheduled = false
        scan()
      })
    }

    function isMenuNode(node) {
      if (!node || node.nodeType !== 1) return false
      return Boolean(
        node.matches?.('[role="menu"], [class*="_menu"]') ||
        node.querySelector?.('[role="menu"], [class*="_menu"]')
      )
    }

    function start() {
      if (observer) return
      injectStyles()
      scan()

      observer = new MutationObserver((mutations) => {
        let relevant = false
        for (const m of mutations) {
          for (const node of m.addedNodes) {
            if (isMenuNode(node)) {
              relevant = true
              break
            }
          }
          if (relevant) break
          for (const node of m.removedNodes) {
            if (isMenuNode(node)) {
              relevant = true
              break
            }
          }
          if (relevant) break
        }

        if (relevant) {
          scheduleScan()
        }
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      })
    }

    function stop() {
      if (observer) {
        observer.disconnect()
        observer = null
      }
      scanScheduled = false
      for (const menu of activeMenus) {
        const state = trackedMenus.get(menu)
        state?.cleanup()
      }
      activeMenus.clear()

      const style = document.getElementById(STYLE_ID)
      style?.remove()
    }

    // ── Cordis Client Module Exports ─────────────────────────────────────────

    exports.inject = ['locale']

    exports.apply = function apply(ctx) {
      const NS = '@goodandready/dsh-model-search'

      if (ctx.locale) {
        ctx.effect(() => {
          return ctx.locale.register(NS, {
            en: {
              'dms.placeholder': I18N.en.placeholder,
              'dms.empty': I18N.en.empty,
              'dms.clear': I18N.en.clear,
            },
            zh: {
              'dms.placeholder': I18N.zh.placeholder,
              'dms.empty': I18N.zh.empty,
              'dms.clear': I18N.zh.clear,
            },
          })
        })
        translate = ctx.locale.bind(NS)
      }

      start()

      ctx.effect(() => {
        return () => {
          stop()
        }
      }, '@goodandready/dsh-model-search: lifecycle')
    }

    return module.exports
  }
})
