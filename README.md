# 📦 @goodandready/dsh-model-search

<div align="center">

<h3>Live Searchable Model Selector Enhancement for DeepSeek Harness WebUI</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-model-search"><img src="https://img.shields.io/npm/v/@goodandready/dsh-model-search.svg?style=for-the-badge&color=6366f1&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- Showcase Link -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/All_Author_Projects-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="All Author Projects"></a>
</p>

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> •
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a> •
  <a href="README.zh.md"><b>🇨🇳 中文说明</b></a>
</p>

<!-- Mandatory project support block -->
<table align="center">
  <tr>
    <td align="center">
      ⭐ <strong>If you like this plugin, please star it on GitHub</strong> — it shows me that the plugin is useful to you and motivates me to keep developing it.
      <br><br>
      🐛 <strong>If you find a bug or would like to request a feature</strong>, open a GitHub issue in any language — I will review your proposal and implement useful suggestions in a future plugin version.
    </td>
  </tr>
</table>

</div>

---

## ⚡ Overview & The Problem

As autonomous workflows in **DeepSeek Harness** scale with dozens of models across diverse local and remote providers (OpenAI, Anthropic, OpenRouter, Ollama, DeepSeek), the default model selector dropdown becomes difficult to navigate. Users often find themselves scrolling through lengthy lists or losing track of exact provider namespaces.

**`@goodandready/dsh-model-search`** solves this by injecting an instant, non-invasive, keyboard-friendly live search field directly into the DSH WebUI model picker:
* **Instant Filtering**: Real-time matching by model name, technical identifier (`provider/model-id`), or provider group.
* **Smart Fuzzy & Acronym Matching**: Subsequence detection allows matching queries like `dsr1` directly to `deepseek-reasoner-1`.
* **`@provider` Syntax**: Instant filtering of models by specific provider (e.g., `@ollama`, `@openrouter`).
* **Zero CPU Overhead**: Selective MutationObserver guarantees complete zero CPU overhead during chat streaming.
* **Full Keyboard Accessibility**: Strict arrow-key cycling across filtered items, immediate selection on `Enter`, and dismiss with `Escape`.

---

## 🏗️ Architecture

```mermaid
graph LR
  A[DSH WebUI Dropdown] --> B[lib/client.js]
  B --> C[Search Input Mount]
  C --> D{Query Parser}
  D -->|Text / Acronym| E[Subsequence Fuzzy Matcher]
  D -->|@provider| F[Provider Group Filter]
  E --> G[DOM Visibility Toggler]
  F --> G
  G --> H[Keyboard Navigation & Selection]
```

---

## ✨ Core Features

### 1. Multi-Term & Delimiter-Aware Search
Supports multi-part search terms separated by spaces, commas, slashes, or semicolons:
* Query: `openrouter/claude-3-5`
* Query: `reasoner; 32b`
* Query: `@ollama llama3`

### 2. Acronym & Subsequence Matching
Matches non-contiguous abbreviations quickly:
* Typing `dsr` matches `deepseek-reasoner`
* Typing `gpt4o` matches `openai/gpt-4o-mini`

### 3. Dedicated `@provider` Syntax
Prefixing a query with `@` isolates models belonging to that provider:
* `@openai` shows only models registered under the OpenAI provider.
* `@ollama qwen` finds Qwen models hosted on your local Ollama instance.

### 4. Keyboard Navigation Matrix

| Key | Action |
|:---|:---|
| `ArrowDown` | Move active focus to the next visible matched model |
| `ArrowUp` | Move active focus to previous visible model; returns to search input at top |
| `Enter` | Immediately selects the currently highlighted or top visible model |
| `Escape` | Clears active search input; closes dropdown if input is already empty |

### 5. Resilient Core Integration
* **Non-invasive DOM manipulation**: Only toggles item visibility (`display: none` / visible); never detaches or rearranges React virtual DOM nodes.
* **Resistant to upstream changes**: Independent of DSH core CSS module hash changes.
* **Theme-Native Styling**: Uses official DSH CSS variables to seamlessly adapt to Dark and Light modes.
* **Multi-Language Support**: English (`en`) and Chinese (`zh`) built-in; Russian (`ru`) dynamically provided when `@goodandready/dsh-russian-lang` is active.

---

### 6. One-Click In-App Updater & Settings Card
* **Native settings card**: Integrates into DSH Settings → Plugins → Plugin Settings (settings.plugin.item) under namespace dsh-model-search.
* **In-place updates**: Checks the npm registry for new releases, compares versions (including prereleases), and performs one-click updates with loopback-only fail-closed security and single-flight click protection.
* **100% Theme Token Compliance**: Fully styled using official DSH design tokens (--dsw-*) with zero hardcoded hex or rgba colors, matching both Dark and Light themes.

## 📦 Installation

Add to your DeepSeek Harness Web profile:

```bash
dsh plugin --profile web add @goodandready/dsh-model-search
```

Restart DSH or reload the browser interface to activate live search in the model selector.

---

## 🧪 Verification & Testing

Run unit and syntax checks:

```bash
# Verify JavaScript syntax
npm run check

# Run automated test suite
npm test
```

---

## 📄 License

MIT © [GooDAnDReaDY](https://github.com/GooDAnDReaDY)
