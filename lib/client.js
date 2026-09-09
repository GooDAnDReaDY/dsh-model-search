/**
 * @goodandready-private/dsh-model-search v0.1.3
 * DeepSeek Harness WebUI: Live searchable model selector enhancement.
 */
window.__ModuleLoader__.load({
  id: '@goodandready-private/dsh-model-search',
  factory: (require) => {
    const module = { exports: {} }
    const exports = module.exports

    // ── Раскладка клавиатуры и фонетические алиасы ───────────────────────────

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

    // ── Поисковый матчер ─────────────────────────────────────────────────────

    function matchesQuery(targetText, query) {
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

    // ── Локализация ──────────────────────────────────────────────────────────

    const I18N = {
      ru: {
        placeholder: 'Поиск модели или провайдера…',
        empty: 'Нет подходящих моделей',
        clear: 'Очистить поиск',
      },
      zh: {
        placeholder: '搜索模型或服务商…',
        empty: '没有找到匹配的模型',
        clear: '清除搜索',
      },
      en: {
        placeholder: 'Search model or provider…',
        empty: 'No matching models',
        clear: 'Clear search',
      },
    }

    function getStrings() {
      const lang = (
        (typeof document !== 'undefined' && document.documentElement?.lang) ||
        (typeof navigator !== 'undefined' && navigator.language) ||
        'en'
      ).toLowerCase()
      if (lang.startsWith('ru')) return I18N.ru
      if (lang.startsWith('zh')) return I18N.zh
      return I18N.en
    }

    // ── Стили ────────────────────────────────────────────────────────────────

    const STYLE_ID = 'dms-model-search-styles'

    function injectStyles() {
      if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) return
      const style = document.createElement('style')
      style.id = STYLE_ID
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

    // ── Управление поиском в DOM ─────────────────────────────────────────────

    function attachSearch(menu, groups) {
      if (menu._dmsSearchInstalled && menu._dmsWrap?.isConnected) return

      // Строгая идемпотентность: очищаем предыдущие слушатели, если были
      if (menu._dmsCleanup) {
        menu._dmsCleanup()
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

      // Вставляем поиск и сообщение перед контейнером групп
      groups.parentElement?.insertBefore(wrap, groups)
      groups.parentElement?.insertBefore(empty, groups)

      function getVisibleOptions() {
        return Array.from(
          groups.querySelectorAll('button[role="menuitemradio"]:not([style*="display: none"])')
        )
      }

      // Фильтрация
      const updateFilter = () => {
        const query = input.value
        clear.classList.toggle('dms-visible', query.trim().length > 0)

        // Сброс скролла наверх при фильтрации
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
          const groupTitle = grp.querySelector('[id]')?.textContent || ''
          const options = grp.querySelectorAll('button[role="menuitemradio"]')
          let groupVisible = 0

          for (const opt of options) {
            // Устойчивый fallback: opt.textContent захватывает имя модели независимо от CSS-классов ядра
            const textContent = opt.textContent || ''
            const titleAttr = opt.getAttribute('title') || ''
            const combined = `${groupTitle} ${textContent} ${titleAttr}`

            const match = matchesQuery(combined, query)
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

      input.addEventListener('input', updateFilter)

      // Изоляция и навигация с клавиатуры
      input.addEventListener('keydown', (e) => {
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
      })

      // Перехват стрелок внутри списка опций при активной фильтрации
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

      clear.addEventListener('click', () => {
        input.value = ''
        updateFilter()
        input.focus()
      })

      // Предотвращаем закрытие меню при клике на поисковый блок
      wrap.addEventListener('mousedown', (e) => e.stopPropagation())
      wrap.addEventListener('click', (e) => e.stopPropagation())

      menu._dmsSearchInstalled = true
      menu._dmsWrap = wrap
      menu._dmsEmpty = empty
      menu._dmsInput = input
      menu._dmsUpdate = updateFilter

      menu._dmsCleanup = () => {
        groups.removeEventListener('keydown', onGroupsKeyDown)
        wrap.remove()
        empty.remove()
        delete menu._dmsSearchInstalled
        delete menu._dmsWrap
        delete menu._dmsEmpty
        delete menu._dmsInput
        delete menu._dmsUpdate
        delete menu._dmsCleanup
      }

      // Автофокус при открытии подменю
      setTimeout(() => {
        if (input.isConnected) input.focus()
      }, 50)
    }

    function detachSearch(menu) {
      if (menu._dmsCleanup) {
        menu._dmsCleanup()
      }
    }

    // ── Сканирование DOM ─────────────────────────────────────────────────────

    function scan() {
      // Ищем открытые выпадающие меню DSH (role="menu" или class containing "menu")
      const menus = document.querySelectorAll('[role="menu"], [class*="_menu"]')
      for (const menu of menus) {
        // Проверяем, находится ли меню в режиме отображения групп моделей
        const groups = menu.querySelector('[class*="_groups"], div.scrollable, div[class*="groups"]')
        const hasModelGroups = groups && groups.querySelector('section[role="group"]')

        if (hasModelGroups) {
          attachSearch(menu, groups)
          // Если есть активный поисковый запрос при перерендере списка, обновляем
          if (menu._dmsInput?.value) {
            menu._dmsUpdate?.()
          }
        } else if (menu._dmsSearchInstalled) {
          // Если переключились на root или effort pane, удаляем поиск
          detachSearch(menu)
        }
      }
    }

    // ── Жизненный цикл плагина ────────────────────────────────────────────────

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

    function start() {
      if (observer) return
      injectStyles()
      scan()

      observer = new MutationObserver(() => {
        scheduleScan()
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
      for (const menu of document.querySelectorAll('[role="menu"], [class*="_menu"]')) {
        detachSearch(menu)
      }
      const style = document.getElementById(STYLE_ID)
      style?.remove()
    }

    // ── Cordis Client Module Exports ─────────────────────────────────────────

    exports.inject = []

    exports.apply = function apply(ctx) {
      start()

      ctx.effect(() => {
        return () => {
          stop()
        }
      }, '@goodandready-private/dsh-model-search: lifecycle')
    }

    return module.exports
  }
})
