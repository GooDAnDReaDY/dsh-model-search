# 📦 @goodandready/dsh-model-search

<div align="center">

<h3>DeepSeek Harness WebUI 模型选择器实时智能检索增强插件</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-model-search"><img src="https://img.shields.io/npm/v/@goodandready/dsh-model-search.svg?style=for-the-badge&color=6366f1&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- 作者作品展台 -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/All_Author_Projects-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="All Author Projects"></a>
</p>

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> •
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a> •
  <a href="README.zh.md"><b>🇨🇳 中文说明</b></a>
</p>

<!-- 社区支持模块 -->
<table align="center">
  <tr>
    <td align="center">
      ⭐ <strong>如果您喜欢这个插件，请在 GitHub 上点亮 Star</strong> — 这将鼓励我持续维护并推出更多实用功能。
      <br><br>
      🐛 <strong>如果您发现了 Bug 或有新功能建议</strong>，欢迎随时在 GitHub 提交 Issue（支持任意语言）— 我会认真阅读并在后续版本中实现。
    </td>
  </tr>
</table>

</div>

---

## ⚡ 概述与解决的痛点

随着 **DeepSeek Harness** 接入的服务商与模型数量不断扩增（涵盖 OpenAI、Anthropic、OpenRouter、Ollama、DeepSeek 等），原生模型下拉选择列表往往变得极其冗长。用户在切换模型时不得不反复上下滚动查找，极大影响交互效率。

**`@goodandready/dsh-model-search`** 通过在 WebUI 模型选择器弹窗内注入轻量无侵入的实时搜索框，完美解决该痛点：
* **实时即时过滤**：支持通过模型显示名、技术标识符 (`provider/model-id`) 或服务商名称毫秒级过滤。
* **首字母缩写与模糊匹配**：智能子序列算法支持缩写匹配（例如输入 `dsr1` 即可命中 `deepseek-reasoner-1`）。
* **`@provider` 服务商定向检索**：输入 `@` 前缀一键筛选指定服务商下的全部模型。
* **零 CPU 开销**：精简的定向 MutationObserver 确保在聊天会话流式输出 Token 时零额外 CPU 占用。
* **全功能键盘导航**：严格在可见模型间通过方向键轮换，`Enter` 秒选，`Escape` 快速清空。

---

## 🏗️ 架构设计

```mermaid
graph LR
  A[DSH WebUI 模型下拉框] --> B[lib/client.js]
  B --> C[挂载搜索输入框]
  C --> D{查询解析器}
  D -->|文本 / 缩写| E[子序列模糊匹配引擎]
  D -->|@provider| F[服务商分组过滤器]
  E --> G[DOM 可见性切换控制]
  F --> G
  G --> H[键盘导航轮换控制]
  H --> I[最近使用本地缓存]
```

---

## ✨ 核心特性

### 1. 多分词与标点智能切分
支持以空格、逗号、斜杠或分号组合的复杂查询条件：
* 查询：`openrouter/claude-3-5`
* 查询：`reasoner; 32b`
* 查询：`@ollama llama3`

### 2. 缩写与子序列模糊检索
支持无连字符的首字母缩写识别：
* 输入 `dsr` 快速命中 `deepseek-reasoner`
* 输入 `gpt4o` 快速命中 `openai/gpt-4o-mini`

### 3. `@provider` 前缀精确锁定
以 `@` 开头可定向查看某一模型服务商：
* `@openai` 仅列出 OpenAI 服务商下注册的模型。
* `@ollama qwen` 检索本地 Ollama 部署中的千问模型。

### 4. 键盘交互指南

| 按键 | 功能 |
|:---|:---|
| `ArrowDown` | 移动高亮焦点至下一个可见匹配模型 |
| `ArrowUp` | 移动高亮焦点至上一个可见模型；在第一项按键时焦点重回搜索输入框 |
| `Enter` | 立即激活当前高亮项（若无高亮则默认选择首个可见项） |
| `Escape` | 清空搜索输入框；若已为空则关闭下拉面板 |

### 5. 核心架构稳定性
* **无侵入 DOM 操作**：仅通过控制元素可见性（`display: none` / 显示）实现过滤，不篡改或重排 React Virtual DOM 树。
* **抵御版本更新**：不依赖 DSH 内部哈希生成的 CSS 类名，适配官方后续升级。
* **原生设计语言**：无缝调用 DSH 官方 CSS 变量，完美兼容暗黑和明亮主题。
* **多语言支持**：原生内建英文 (`en`) 与中文 (`zh`)；俄语通过 `@goodandready/dsh-russian-lang` 自动加载。

---

### 6. 一键在线更新与原生设置卡片
* **原生设置卡片**：无缝注册至 DSH 的「设置 → 插件 → 插件设置」页面 (settings.plugin.item)，属于 dsh-model-search 命名空间。
* **一键无缝升级**：自动对比 npm 最新发布版本（支持 SemVer 及预发布版本识别），提供单次点击就地更新，具备回环地址防篡改与并发锁保护。
* **100% 遵循官方主题令牌**：全界面采用官方 --dsw-* CSS 变量驱动，零硬编码 hex / rgba 色值，在深色与浅色模式下均获得原生级精致体验。

## 📦 安装指南

安装至 DeepSeek Harness Web 配置文件：

```bash
dsh plugin --profile web add @goodandready/dsh-model-search
```

重启 DSH 或刷新浏览器页面即可立即体验实时搜索功能。

---

## 🧪 测试与验证

运行单元测试与语法检查：

```bash
# JavaScript 语法检查
npm run check

# 执行自动化测试套件
npm test
```

---

## 📄 许可证

MIT © [GooDAnDReaDY](https://github.com/GooDAnDReaDY)
