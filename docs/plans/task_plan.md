# Task Plan: Architecture Hardening & Defect Remediation (Issue #16)

## Objective
Address architectural review findings registered in Gitea Issue #16 for `@goodandready/dsh-model-search`: fix localization contract blocker, bind locale in cordis lifecycle, synchronize package identity across all manifests and sources, extract matcher module with build parity enforcement, eliminate dead write-only recents code, and optimize MutationObserver for true zero CPU overhead.

## Status: COMPLETE

### Phase 1: Matcher Extraction & Test Parity
- [x] Extract pure search matching engine into `lib/matcher.js` (`cleanToken`, `isSubsequenceMatch`, `extractInitials`, `matchesQuery`).
- [x] Create `src/client.template.js` and `scripts/build.mjs` to inline matcher into `lib/client.js` with `--check` parity verification.
- [x] Refactor `test/filter.test.mjs` to import `lib/matcher.js` directly.
- [x] Add `test/build-parity.test.mjs` to enforce zero-divergence between `lib/matcher.js` and `lib/client.js`.
- [x] Separate model text and provider title in `matchesQuery` to prevent false positive group matches.

### Phase 2: Localization Contract & Lifecycle Binding
- [x] Replace non-existent `activeLocaleService.get()` with `ctx.locale.bind('@goodandready/dsh-model-search')`.
- [x] Wrap `ctx.locale.register()` in `ctx.effect()`, returning the disposer for clean teardown on HMR/reload.
- [x] Synchronize host identity in `lib/index.js` to `@goodandready/dsh-model-search`.

### Phase 3: DOM Hardening & Zero-Overhead MutationObserver
- [x] Make `MutationObserver` selective: only schedule scans when added or removed nodes match or contain menu elements.
- [x] Replace foreign DOM expando properties (`menu._dms*`) with module-scoped `WeakMap<Element, State>` and `Set<Element>`.
- [x] Query section headings safely via `grp.getAttribute('aria-labelledby')` and `CSS.escape()`.
- [x] Query visible menu items via `:not([aria-hidden="true"])` instead of matching style substrings.
- [x] Store and cancel autofocus timeout on cleanup.
- [x] Remove dead write-only `localStorage` recents logic and unused `.dms-recent-badge` CSS.

### Phase 4: Packaging & Documentation Alignment
- [x] Add `README.ru.md` and `README.zh.md` to `package.json` `files`.
- [x] Align `peerDependencies` (`@deepseek-ai/cordis >= 4.0.1`).
- [x] Add `build` script and update `test` / `check` scripts.
- [x] Update `docs/design/DESIGN.md` with accurate zero-CPU and localization architecture.
- [x] Update `README.md`, `README.zh.md`, and `README.ru.md`.
- [x] Pass all unit tests (12/12) and static checks.
