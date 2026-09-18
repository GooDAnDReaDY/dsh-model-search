# DESIGN.md — @goodandready/dsh-model-search

## Product / Purpose
- **Purpose**: Enhancement for DeepSeek Harness WebUI model selection dropdown menu. Injects a high-performance live search input with instant model filtering by name, provider title, intelligent subsequence/fuzzy matching, and `@provider` syntax.
- **Audience**: DeepSeek Harness users with multiple AI providers and extensive model catalogs.
- **Target Version**: 0.1.7.

---

## User Surfaces
- **Web/UI**:
  - Sticky search bar (`.dms-wrap`, `.dms-input`) pinned to the top of the model menu (`position: sticky; top: 0`) with semantic `role="search"`.
  - Unified native clear button: custom `.dms-clear` (`×`), native `::-webkit-search-cancel-button` suppressed.
  - Empty state message (`.dms-empty`) with `aria-live="polite"` when no models match the query.
- **DSH UI / Menu integration**:
  - Seamless integration with DSH's 2-level model selector (`ModelSelect.tsx`):
    - In root menu (`root`: selection between model and reasoning effort), search input is not mounted.
    - Upon entering model catalog (`pane === 'model'`), search bar mounts above the model groups list (`.groups`).
    - When returning to root menu or closing dropdown, search bar is cleanly dismantled via idempotent cleanup handler.

---

## Visual Direction
- **Atmosphere**: Clean, organic DeepSeek Harness interface element, visually indistinguishable from native core components.
- **Styling & Theme Tokens**:
  - Container background: `var(--dsw-specific-menu)`
  - Input background: `var(--dsw-alias-bg-base, var(--dsw-specific-menu))`
  - Borders: `1px solid var(--dsw-alias-border-l2)`
  - Text color: `var(--dsw-alias-label-primary)`
  - Placeholder & hints: `var(--dsw-alias-label-tertiary)`
  - Focus state: `border-color: var(--dsw-alias-state-business-primary)`
  - Strict CSS prefixing: all classes isolated with `dms-` (`.dms-wrap`, `.dms-input`, `.dms-clear`, `.dms-empty`).

---

## Technical & Safety Constraints
- **Zero DOM-tree mutation**:
  - No `insertBefore` or `appendChild` reordering on React nodes (`section[role="group"]`, `button[role="menuitemradio"]`).
  - Filtering executed purely via CSS visibility control (`display: none` / `display: ''`).
  - Resilience against core style refactoring: model identification extracts text safely from `opt.textContent` and `title` attributes without relying on fragile core CSS module classes.
- **Performance & Lifecycle**:
  - **Selective `MutationObserver`**: inspects `addedNodes` and `removedNodes` for menu elements before scheduling `scan()`. Complete zero CPU overhead during chat token streaming, tool calls, and background notifications.
  - **Clean state management**: module-level `WeakMap<Element, State>` and `Set<Element>` track active menus without polluting alien React DOM nodes with expando properties.
  - **Strict idempotency**: `cleanup()` releases all event listeners, removes injected nodes, and cancels pending autofocus timers.
- **Localization Standard**:
  - Canonical language: English (`en`) as source and fallback.
  - Chinese (`zh`) as first-class native locale.
  - **No hardcoded Russian in plugin code**: In compliance with `dsh-documentation-standard`, Russian localization is provided via `dsh-russian-lang` (registered via Gitea issue `goodandready/dsh-russian-lang#192`).
  - **Lifecycle-bound registration**: registers dictionary keys (`dms.placeholder`, `dms.empty`, `dms.clear`) in namespace `'@goodandready/dsh-model-search'` inside `ctx.effect()`, returning the disposer. Reads translations dynamically via `ctx.locale.bind()`.
- **Search Capabilities**:
  - Multi-term AND matching with punctuation handling (`[\s,;/]+`).
  - `@provider` filter syntax (e.g. `@ollama`, `@openrouter`, `@openai`) specifically narrows models by provider title.
  - Subsequence and initials fuzzy matching: matches acronyms and non-contiguous tokens (e.g. `dsr1` -> `provider-id/model-reasoner-1`).
  - Strict separation between model name and provider title in `matchesQuery` to prevent false positive group matching.
- **Keyboard Navigation & Accessibility (a11y)**:
  - Arrow keys navigate exclusively across visible (non-hidden: `:not([aria-hidden="true"])`) models.
  - Up arrow on first item cycles focus back to search input.
  - Dynamic synchronization of `aria-hidden` attributes.
  - `Escape` clears search text if non-empty; `Enter` activates the first visible model.
  - Scroll position resets to top on query change (`groups.scrollTop = 0`).

---

## Settings & Auto-Updater Integration (Issue #20, Variant B)
- **Decision**: Variant B — Register minimal native settings.plugin.item card under namespace dsh-model-search.
- **Card UI**:
  - Registered via ctx.slots.register for slot settings.plugin.item.
  - Collapsed by default, follows canonical DSH card geometry (12px border radius, 14x16 header padding, 15px/600 title).
  - Uses strictly semantic theme tokens (--dsw-alias-border-l2, --dsw-alias-bg-layer-3, --dsw-alias-label-*, --dsw-alias-state-*). Zero hardcoded hex or rgba colors.
  - Native chevron icon with animated 180deg toggle on expansion.
  - Displays current version, status badge (Up to date vs New release available: v...), and one-click update button.
- **Host Endpoint**:
  - Mounted via wctx.effect(() => registerPluginUpdater(wctx, { endpoint: '/api/dsh-model-search/update', packageName: '@goodandready/dsh-model-search', manifestUrl })).
  - Fail-closed security via isTrustedUpdateRequest: strictly requires loopback address, same-origin, matching host/origin, and x-dsh-plugin-update: 1 header.
  - Prevents race conditions and double-clicks via single-flight lock (installing = true -> HTTP 409 Conflict).
  - Recognizes semver upgrades including prerelease transitions via canonical isNewerVersion.
