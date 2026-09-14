# 📦 @goodandready/dsh-model-search

<div align="center">

<h3>Live Searchable Model Selector Enhancement for DeepSeek Harness WebUI</h3>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- Showcase Link -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/🌐_DSH_Hub-goodandready.app-ff4500.svg?style=for-the-badge&labelColor=1a1a2e" alt="GoodAndReady Showcase"></a>
</p>

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> •
  <a href="README.zh.md"><b>🇨🇳 中文说明</b></a> •
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a>
</p>

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

## Overview

**`@goodandready/dsh-model-search`** enhances the DeepSeek Harness WebUI model selection dropdown menu by introducing an instant, keyboard-accessible live search input. As AI setups scale with dozens of models across multiple providers, finding the right model becomes instantaneous without tedious scrolling.

---

## Features

- 🔍 **Instant Filtering**: Real-time filtering by model name, technical model identifier (`provider/model-id`), and provider group name.
- 🔀 **Multi-Term & Delimiter Support**: Supports complex search queries separated by spaces, commas, slashes, or semicolons (`provider/model`, `reasoner; 32b`).
- ⚡ **Smart Subsequence & Acronym Matching**: Type abbreviations or non-contiguous letters to match models quickly (e.g., `dsr1` matches `provider-id/deepseek-reasoner-1`).
- 🏷️ **`@provider` Syntax Filtering**: Target a specific provider instantly using `@` syntax (e.g., `@ollama`, `@openrouter`, `@openai`).
- 🕒 **Recent Models Memory**: Remembers recently selected models in browser local storage and keeps them quickly accessible.
- ⌨️ **Keyboard Navigation**:
  - `ArrowDown` / `ArrowUp` cycle strictly through visible, matched models.
  - `ArrowUp` on the first item brings focus back into the search input.
  - `Enter` immediately selects the top visible model.
  - `Escape` clears active search input.
- 🛡️ **Core Resilience**: Non-invasive filtering via visibility toggling; completely immune to DSH core CSS module class name changes.
- 🌐 **Multi-Language Architecture**: Native English (`en`) and Chinese (`zh`) support in core; Russian translation provided via `@goodandready/dsh-russian-lang`.
- 🎨 **Theme-Native Styling**: Uses official DSH CSS design tokens, seamlessly blending into both Dark and Light themes.

---

## Installation

Add to your DSH web profile:

```bash
dsh plugin --profile web add @goodandready/dsh-model-search@0.1.4
```

---

## Verification & Testing

Run the test suite:

```bash
# Verify syntax
npm run check

# Run unit and integration tests
npm test
```

---

## License

MIT © [GooDAnDReaDY](https://goodandready.app)
