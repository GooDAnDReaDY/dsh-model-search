# DESIGN.md — @goodandready/dsh-model-search

## Product / Purpose
- **Purpose**: Enhancement for DeepSeek Harness WebUI model selection dropdown menu. Injects a high-performance live search input with instant model filtering by name, technical identifier (ID), provider title, intelligent subsequence/fuzzy matching, and quick access to recently used models.
- **Audience**: DeepSeek Harness users with multiple AI providers and extensive model catalogs.
- **Target Version**: 0.1.5.

---

## User Surfaces
- **Web/UI**:
  - Sticky search bar (`.dms-wrap`, `.dms-input`) pinned to the top of the model menu (`position: sticky; top: 0`) with semantic `role="search"`.
  - Unified native clear button: custom `.dms-clear` (`×`), native `::-webkit-search-cancel-button` suppressed.
  - Empty state message (`.dms-empty`) with `aria-live="polite"` when no models match the query.
  - Recent models memory: automatically tracks up to 5 recently selected model IDs in `localStorage['dms_recent_models']`.
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
  - Strict CSS prefixing: all classes isolated with `dms-` (`.dms-wrap`, `.dms-input`, `.dms-clear`, `.dms-empty`, `.dms-recent-badge`).

---

## Technical & Safety Constraints
- **Zero DOM-tree mutation**:
  - No `insertBefore` or `appendChild` reordering on React nodes (`section[role="group"]`, `button[role="menuitemradio"]`).
  - Filtering executed purely via CSS visibility control (`display: none` / `display: ''`).
  - Resilience against core style refactoring: model identification extracts text safely from `opt.textContent` and `title` attributes without relying on fragile core CSS module classes.
- **Performance & Lifecycle**:
  - `MutationObserver` batched via `requestAnimationFrame` (`scheduleScan()`). Zero CPU overhead during token streaming in active chat sessions.
  - Strict idempotency: `_dmsCleanup()` executes prior to any re-initialization.
- **Localization Standard**:
  - Canonical language: English (`en`) as source and fallback.
  - Chinese (`zh`) as first-class native locale.
  - **No hardcoded Russian in plugin code**: In compliance with `dsh-documentation-standard`, Russian localization is provided via `dsh-russian-lang` (registered via Gitea issue `goodandready/dsh-russian-lang#192`).
  - Core integration: registers keys (`dms.placeholder`, `dms.empty`, `dms.clear`, `dms.recent`) with `ctx.locale` when available.
- **Search Capabilities**:
  - Multi-term AND matching with punctuation handling (`[\s,;/]+`).
  - `@provider` filter syntax (e.g. `@ollama`, `@openrouter`, `@openai`) specifically narrows models by provider title.
  - Subsequence and initials fuzzy matching: matches acronyms and non-contiguous tokens (e.g. `dsr1` -> `provider-id/model-reasoner-1`).
- **Keyboard Navigation & Accessibility (a11y)**:
  - Arrow keys navigate exclusively across visible (non-hidden) models.
  - Up arrow on first item cycles focus back to search input.
  - Dynamic synchronization of `aria-hidden` attributes.
  - `Escape` clears search text if non-empty; `Enter` activates the first visible model.
  - Scroll position resets to top on query change (`groups.scrollTop = 0`).
