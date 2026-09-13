# Progress: dsh-model-search Feature Enhancements

## Completed Work
1. Created Gitea Issue #10 in `goodandready/dsh-model-search` tracking features.
2. Created Gitea Issue #192 in `goodandready/dsh-russian-lang` registering Russian translations.
3. Created worktree `.worktrees/feat/search-enhancements` on branch `feat/search-enhancements`.
4. Refactored `lib/client.js`:
   - Removed hardcoded Russian strings and aliases.
   - Preserved canonical EN and ZH localization dictionaries.
   - Connected `ctx.locale` registration for DSH core localization.
   - Added smart subsequence and acronym fuzzy matching.
   - Added `@provider` syntax filtering.
   - Added recent models memory via `localStorage`.
5. Updated `test/filter.test.mjs` with 6 exhaustive unit test suites; 100% pass (6/6).
6. Updated `docs/design/DESIGN.md` reflecting all changes and safety constraints.
7. Prepared tri-lingual documentation: canonical `README.md` (EN), `README.zh.md` (ZH), and `README.ru.md` (RU) following `dsh-documentation-standard`.
8. Verified clean `npm pack --dry-run`: 0 extraneous files, 11.3 KiB package size.
