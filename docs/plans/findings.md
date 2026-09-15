# Findings: Issue #16 Architecture Review & Remediation

1. **Locale Contract**: DSH's `@deepseek-ai/dsh-client-locale` implements `.bind(ns) -> t(key, params)` and fallback chains. The old `.get()` call never existed and always failed. Using `ctx.locale.bind()` and `ctx.effect(() => ctx.locale.register(...))` provides full native EN/ZH and dynamic RU resolution without leaks.
2. **MutationObserver Overhead**: By filtering mutations for `[role="menu"]` / `[class*="_menu"]` additions/removals, unrelated DOM mutations during chat streaming no longer trigger scans.
3. **Matcher Isolation**: `lib/matcher.js` serves as single source of truth for both production runtime and unit testing, guaranteed by `scripts/build.mjs --check`.
4. **Recents Removal**: Removing unused write-only `localStorage` code keeps the plugin strictly focused on search and eliminates foreign DOM pollution.
