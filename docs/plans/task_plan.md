# Task Plan: dsh-model-search feature enhancements (v0.1.4)

## Objective
Implement localization standard compliance (EN/ZH native in plugin, RU registered in `dsh-russian-lang`), smart fuzzy/subsequence matching, `@provider` syntax filtering, and recent models quick access.

## Status: IN-PROGRESS

### Phase 1: Localization Standard Compliance & Core Matcher Hardening
- [ ] Refactor `lib/client.js`:
  - Retain native EN and ZH localization dictionaries in `I18N`.
  - Wire locale detection through standard browser / DSH indicators with clean fallback.
  - Remove hardcoded Russian string constants and hardcoded Russian transliterated names from the core plugin file.
  - Implement smart subsequence / fuzzy matching (`isSubsequenceMatch` / acronym tolerance) in pure standard JS.
  - Implement `@provider` filtering: when a term starts with `@`, it specifically filters by provider name (the group title).
  - Implement recent models memory: remember up to 5 recently clicked model IDs in `localStorage['dms_recent_models']` and render them in a quick-access header or keep them readily available.
- [ ] Verify clean node check: `node --check lib/client.js`.

### Phase 2: Test Suite Expansion
- [ ] Refactor & expand `test/filter.test.mjs`:
  - Test subsequence/fuzzy matching (`dsr1` -> `provider-id/model-reasoner-1`).
  - Test case-insensitivity, whitespace, delimiters.
  - Test `@provider` filtering.
  - Test English and Chinese search terms.
  - Ensure zero hardcoded forbidden model names in test suites.
- [ ] Run `npm test` and verify 100% pass.

### Phase 3: Documentation & Design Contract Updates
- [ ] Update `docs/design/DESIGN.md`:
  - Document fuzzy search algorithm.
  - Document `@provider` syntax.
  - Document recent models behavior.
  - Document EN/ZH multi-language architecture and RU delegation to `dsh-russian-lang`.
- [ ] Update documentation following `dsh-documentation-standard`:
  - Canonical `README.md` (English).
  - `README.zh.md` (Chinese).
  - `README.ru.md` (Russian).
  - Include goodandready showcase badge, hero banner, generic model IDs, additive changelog.

### Phase 4: Quality Gate & Verification
- [ ] Check `npm pack --dry-run --json`: ensure ONLY allowed files are packaged and size is well under 256 KiB.
- [ ] Check `git status` in worktree.
- [ ] Check Gitea commit and PR preparation.
