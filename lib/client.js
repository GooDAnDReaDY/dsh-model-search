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
        title: 'Model Search',
        desc: 'Searchable model selector for DeepSeek Harness WebUI',
        updater_current: 'Current version',
        updater_check: 'Check for updates',
        updater_checking: 'Checking…',
        updater_update_now: 'Update now',
        updater_updating: 'Updating…',
        updater_up_to_date: 'Up to date',
        updater_update_available: 'New release available: v{version}',
        updater_restart_notice: 'Update installed. Restart DSH to apply.',
        updater_failed: 'Failed to check or install update',
      },
      zh: {
        placeholder: '搜索模型或服务商…',
        empty: '没有找到匹配的模型',
        clear: '清除搜索',
        title: '模型搜索',
        desc: 'DeepSeek Harness WebUI 模型即时检索与筛选扩展',
        updater_current: '当前版本',
        updater_check: '检查更新',
        updater_checking: '正在检查…',
        updater_update_now: '立即更新',
        updater_updating: '正在更新…',
        updater_up_to_date: '已是最新版本',
        updater_update_available: '发现新版本: v{version}',
        updater_restart_notice: '更新已安装，请重启 DSH 生效。',
        updater_failed: '检查或安装更新失败',
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
          background: var(--dsw-specific-menu, var(--dsw-alias-bg-base));
          border-bottom: 1px solid var(--dsw-alias-border-l1);
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
          border: 1px solid var(--dsw-alias-border-l2);
          background: var(--dsw-alias-bg-base, var(--dsw-specific-menu));
          color: var(--dsw-alias-label-primary);
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
          color: var(--dsw-alias-label-tertiary);
        }
        .dms-input:focus {
          border-color: var(--dsw-alias-state-business-primary);
          box-shadow: 0 0 0 1px var(--dsw-alias-state-business-primary);
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
          background: var(--dsw-alias-border-l2);
          color: var(--dsw-alias-label-secondary);
          font-size: 12px;
          line-height: 1;
          cursor: pointer;
          user-select: none;
        }
        .dms-clear:hover {
          background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-border-l3));
          color: var(--dsw-alias-label-primary);
        }
        .dms-clear.dms-visible {
          display: flex;
        }
        .dms-empty {
          display: none;
          padding: 12px 10px;
          color: var(--dsw-alias-label-tertiary);
          font-size: 13px;
          line-height: 20px;
          text-align: center;
        }
        .dms-card {
          border: 1px solid var(--dsw-alias-border-l2);
          background: var(--dsw-alias-bg-layer-3);
          border-radius: 12px;
          list-style: none;
          margin-bottom: 12px;
        }
        .dms-card-head {
          appearance: none;
          width: 100%;
          font: inherit;
          color: inherit;
          text-align: left;
          cursor: pointer;
          background: transparent;
          border: 0;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
        }
        .dms-card-title {
          color: var(--dsw-alias-label-primary);
          font-size: 15px;
          font-weight: 600;
          line-height: 1.4;
        }
        .dms-card-sub {
          color: var(--dsw-alias-label-secondary);
          font-size: 13px;
        }
        .dms-card-body {
          border-top: 1px solid var(--dsw-alias-border-l2);
          margin: 0 16px;
          padding: 14px 0 16px;
        }
        .dms-card-chev {
          margin-left: auto;
          flex: none;
          color: var(--dsw-alias-label-tertiary);
          transition: transform 0.16s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .dms-card-chev-open {
          transform: rotate(180deg);
        }
        .dms-card-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .dms-card-badge {
          font-size: 12px;
          padding: 2px 8px;
          border-radius: 999px;
          border: 1px solid var(--dsw-alias-border-l2);
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-weight: 500;
        }
        .dms-card-badge-ok {
          border-color: var(--dsw-alias-state-success-primary);
          color: var(--dsw-alias-state-success-primary);
        }
        .dms-card-badge-warn {
          border-color: var(--dsw-alias-state-warning-primary);
          color: var(--dsw-alias-state-warning-primary);
        }
        .dms-btn {
          appearance: none;
          font: inherit;
          cursor: pointer;
          border: 1px solid var(--dsw-alias-border-l2);
          border-radius: 8px;
          padding: 6px 14px;
          font-size: 13px;
          background: var(--dsw-alias-bg-layer-2);
          color: var(--dsw-alias-label-primary);
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          transition: all 0.15s ease;
        }
        .dms-btn:hover:not(:disabled) {
          background: var(--dsw-alias-interactive-bg-hover, var(--dsw-alias-bg-layer-hover));
          border-color: var(--dsw-alias-label-dimmed, var(--dsw-alias-border-l2));
        }
        .dms-btn-primary {
          background: var(--dsw-alias-state-brand-primary, var(--dsw-alias-label-primary));
          color: var(--dsw-alias-label-primary-inverted, var(--dsw-alias-bg-layer-3));
          border-color: transparent;
        }
        .dms-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
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
      if (typeof document === 'undefined' || !document.body) return
      try {
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
      } catch (err) {
        console.warn('[@goodandready/dsh-model-search] scan error:', err)
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
      if (typeof document === 'undefined') return
      if (observer) return
      injectStyles()
      if (document.body) {
        scan()
      }

      if (typeof MutationObserver !== 'undefined' && document.body) {
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

    // ── Settings Card (settings.plugin.item) ──────────────────────────────────

    let React = (typeof window !== 'undefined' && window.React) || null
    if (!React && typeof require === 'function') {
      try {
        React = require('react')
      } catch (err) {
        React = null
      }
    }

    let ChevronIcon = null
    if (typeof require === 'function') {
      try {
        const primitives = require('@deepseek-ai/dsh-client-ui-primitives')
        ChevronIcon = primitives && primitives.IconChevronDownOutline14
      } catch (err) {
        ChevronIcon = null
      }
    }

    function FallbackChevron() {
      if (!React) return null
      return React.createElement('svg', {
        width: 14,
        height: 14,
        viewBox: '0 0 14 14',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.5,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      }, React.createElement('path', { d: 'M3.5 5.25L7 8.75L10.5 5.25' }))
    }

    const Chevron = ChevronIcon || FallbackChevron

    function ModelSearchSettingsCard(props) {
      const page = !!(props && props.view === 'page')
      const [open, setOpen] = React.useState(!!page)
      const [status, setStatus] = React.useState(null)
      const [loading, setLoading] = React.useState(false)
      const [updating, setUpdating] = React.useState(false)
      const [feedback, setFeedback] = React.useState({ text: '', ok: true })

      const t = (props && typeof props.t === 'function')
        ? props.t
        : (key) => (typeof translate === 'function' ? translate(key) : key)

      const checkUpdate = React.useCallback(async () => {
        setLoading(true)
        setFeedback({ text: '', ok: true })
        try {
          const res = await fetch('/api/dsh-model-search/update', {
            headers: { accept: 'application/json' },
            cache: 'no-store',
          })
          if (!res.ok) throw new Error('HTTP ' + res.status)
          const data = await res.json()
          setStatus(data)
        } catch (e) {
          setFeedback({ text: (t('dms.updater.failed') || 'Failed') + ': ' + (e?.message || String(e)), ok: false })
        } finally {
          setLoading(false)
        }
      }, [t])

      const onUpdateNow = async () => {
        setUpdating(true)
        setFeedback({ text: '', ok: true })
        try {
          const res = await fetch('/api/dsh-model-search/update', {
            method: 'POST',
            headers: {
              'x-dsh-plugin-update': '1',
              'content-type': 'application/json',
            },
          })
          const data = await res.json()
          if (!res.ok) throw new Error(data?.error || ('HTTP ' + res.status))
          setStatus(data)
          setFeedback({ text: t('dms.updater.restart_notice') || 'Update installed. Restart DSH to apply.', ok: true })
        } catch (e) {
          setFeedback({ text: e?.message || String(e), ok: false })
        } finally {
          setUpdating(false)
        }
      }

      React.useEffect(() => {
        if (open && status === null) {
          checkUpdate()
        }
      }, [open, status, checkUpdate])

      const currentVer = status?.currentVersion || '0.1.6'
      const latestVer = status?.latestVersion
      const updateAvailable = !!status?.updateAvailable && !!latestVer && latestVer !== currentVer

      // Row seat (plugins.row.config): the host page draws title/icon/crumb and the
      // padding, so the summary is a one-liner and the page drops our card chrome.
      if (props && props.view === 'summary') {
        return React.createElement('span', { className: 'dms-card-sub' },
          t('dms.desc') || 'Searchable model selector for DeepSeek Harness WebUI')
      }

      return React.createElement(
        page ? 'div' : 'li',
        { className: page ? 'dms-page' : 'dms-card' },
        React.createElement(
          'button',
          {
            type: 'button',
            className: 'dms-card-head',
            style: page ? { display: 'none' } : undefined,
            onClick: () => setOpen(!open),
            'aria-expanded': open,
          },
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '2px' } },
            React.createElement('span', { className: 'dms-card-title' }, t('dms.title') || 'Model Search'),
            React.createElement('span', { className: 'dms-card-sub' }, t('dms.desc') || 'Searchable model selector for DeepSeek Harness WebUI')
          ),
          React.createElement(
            'span',
            { className: 'dms-card-chev' + (open ? ' dms-card-chev-open' : '') },
            React.createElement(Chevron)
          )
        ),
        open && React.createElement(
          'div',
          { className: 'dms-card-body' },
          React.createElement(
            'div',
            { className: 'dms-card-row' },
            React.createElement(
              'div',
              { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
              React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' } },
                React.createElement('span', { style: { color: 'var(--dsw-alias-label-secondary)' } }, (t('dms.updater.current') || 'Current version') + ':'),
                React.createElement('strong', { style: { color: 'var(--dsw-alias-label-primary)' } }, 'v' + currentVer)
              ),
              status && React.createElement(
                'div',
                { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                updateAvailable
                  ? React.createElement(
                      'span',
                      { className: 'dms-card-badge dms-card-badge-warn' },
                      (t('dms.updater.update_available') || 'New release available: v{version}').replace('{version}', latestVer)
                    )
                  : React.createElement(
                      'span',
                      { className: 'dms-card-badge dms-card-badge-ok' },
                      '✓ ' + (t('dms.updater.up_to_date') || 'Up to date')
                    )
              )
            ),
            React.createElement(
              'div',
              { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
              updateAvailable && React.createElement(
                'button',
                {
                  type: 'button',
                  className: 'dms-btn dms-btn-primary',
                  onClick: onUpdateNow,
                  disabled: updating,
                },
                updating ? (t('dms.updater.updating') || 'Updating…') : (t('dms.updater.update_now') || 'Update now')
              ),
              React.createElement(
                'button',
                {
                  type: 'button',
                  className: 'dms-btn',
                  onClick: checkUpdate,
                  disabled: loading || updating,
                },
                loading ? (t('dms.updater.checking') || 'Checking…') : (t('dms.updater.check') || 'Check for updates')
              )
            )
          ),
          feedback.text && React.createElement(
            'div',
            {
              style: {
                marginTop: '10px',
                fontSize: '13px',
                color: feedback.ok ? 'var(--dsw-alias-state-success-primary)' : 'var(--dsw-alias-state-error-primary)',
              },
            },
            feedback.text
          )
        )
      )
    }

    // ── Cordis Client Module Exports ─────────────────────────────────────────

    function apply(ctx) {
      const NS = 'dsh-model-search'
      // Plugins page row seat (DSH 0.1.6-alpha.2): key = '<package name>#<row id>'.
      const PKG = '@goodandready/dsh-model-search'
      const ROW_ID = 'dsh-model-search'
      const ROW_CONFIG_KEY = PKG + '#' + ROW_ID
      const I18N_NS = '@goodandready/dsh-model-search'

      if (ctx.locale && typeof ctx.locale.register === 'function') {
        try {
          ctx.effect(() => {
            return ctx.locale.register(I18N_NS, {
              en: {
                'dms.placeholder': I18N.en.placeholder,
                'dms.empty': I18N.en.empty,
                'dms.clear': I18N.en.clear,
                'dms.title': I18N.en.title,
                'dms.desc': I18N.en.desc,
                'dms.updater.current': I18N.en.updater_current,
                'dms.updater.check': I18N.en.updater_check,
                'dms.updater.checking': I18N.en.updater_checking,
                'dms.updater.update_now': I18N.en.updater_update_now,
                'dms.updater.updating': I18N.en.updater_updating,
                'dms.updater.up_to_date': I18N.en.updater_up_to_date,
                'dms.updater.update_available': I18N.en.updater_update_available,
                'dms.updater.restart_notice': I18N.en.updater_restart_notice,
                'dms.updater.failed': I18N.en.updater_failed,
              },
              zh: {
                'dms.placeholder': I18N.zh.placeholder,
                'dms.empty': I18N.zh.empty,
                'dms.clear': I18N.zh.clear,
                'dms.title': I18N.zh.title,
                'dms.desc': I18N.zh.desc,
                'dms.updater.current': I18N.zh.updater_current,
                'dms.updater.check': I18N.zh.updater_check,
                'dms.updater.checking': I18N.zh.updater_checking,
                'dms.updater.update_now': I18N.zh.updater_update_now,
                'dms.updater.updating': I18N.zh.updater_updating,
                'dms.updater.up_to_date': I18N.zh.updater_up_to_date,
                'dms.updater.update_available': I18N.zh.updater_update_available,
                'dms.updater.restart_notice': I18N.zh.updater_restart_notice,
                'dms.updater.failed': I18N.zh.updater_failed,
              },
            })
          }, '@goodandready/dsh-model-search: dictionaries')
        } catch (e) {
          console.warn('[@goodandready/dsh-model-search] locale register failed:', e)
        }
        try {
          translate = ctx.locale.bind(I18N_NS)
        } catch (err) {
          translate = (key) => key
        }
      }

      const mountSettingsCard = (slotName, key) => () => {
        if (!ctx.slots?.register) return
        return ctx.slots.register(
          {
            name: slotName,
            key,
            locale: I18N_NS,
            inject: () => ({ ctx }),
          },
          (props) => (React ? React.createElement(ModelSearchSettingsCard, { ...props, ctx }) : null)
        )
      }

      function registerSlotWhenReady(slotName, registerFn) {
        if (!ctx.slots) return
        if (typeof ctx.slots.inject === 'function') {
          try {
            return ctx.slots.inject(slotName, () => {
              try {
                return registerFn()
              } catch (err) {
                console.warn('[@goodandready/dsh-model-search] slot register error:', slotName, err)
              }
            })
          } catch (err) {
            console.warn('[@goodandready/dsh-model-search] slot inject failed:', slotName, err)
          }
        }
        if (typeof ctx.slots.register === 'function') {
          try {
            return registerFn()
          } catch (err) {
            console.warn('[@goodandready/dsh-model-search] direct slot register failed:', slotName, err)
          }
        }
      }

      ctx.effect(() => {
        // Row seat first (the seat the current core renders), legacy seat kept as a
        // fallback for older cores.
        registerSlotWhenReady('plugins.row.config', mountSettingsCard('plugins.row.config', ROW_CONFIG_KEY))
        registerSlotWhenReady('settings.plugin.item', mountSettingsCard('settings.plugin.item', NS))
      }, '@goodandready/dsh-model-search: settings slot')

      ctx.effect(() => {
        try {
          start()
        } catch (e) {
          console.warn('[@goodandready/dsh-model-search] start error:', e)
        }
        return () => {
          stop()
        }
      }, '@goodandready/dsh-model-search: lifecycle')
    }

    module.exports = { apply, inject: ['slots', 'locale'] }
    return module.exports
  }
})
