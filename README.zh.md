# 📦 @goodandready/dsh-model-search

<div align="center">

<h3>DeepSeek Harness WebUI 模型下拉选择菜单实时快速搜索增强插件</h3>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- 展示链接 -->
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
      ⭐ <strong>如果您喜欢这个插件，请在 GitHub 上为它点亮 Star</strong> — 这能让我知道插件对您有用，并鼓励我继续开发和维护它。
      <br><br>
      🐛 <strong>如果您发现 Bug 或希望增加功能</strong>，请使用任意语言在 GitHub 上提交 Issue — 我会评估您的建议，并在后续版本中实现有价值的改进。
    </td>
  </tr>
</table>

</div>

---

## 概述

**`@goodandready/dsh-model-search`** 深度增强 DeepSeek Harness WebUI 的模型下拉选择菜单。在配置了多个服务商以及数十个 AI 模型的环境中，通过即时搜索栏和智能匹配，无需翻动长列表即可毫秒级锁定目标模型。

---

## 主要特性

- 🔍 **毫秒级即时过滤**：支持通过模型显示名称、技术标识符（`provider/model-id`）和服务商分组名称进行多维度检索。
- 🔀 **多词与符号分割检索**：支持空格、逗号、斜杠、分号任意组合的多词联合搜索（例如：`provider/model`, `reasoner; 32b`）。
- ⚡ **智能子序列与首字母缩写检索**：输入简称或不连续字符快速命中目标（例如 `dsr1` 自动匹配 `provider-id/deepseek-reasoner-1`）。
- 🏷️ **`@provider` 服务商前缀检索**：通过 `@` 语法快速锁定特定服务商模型（例如 `@ollama`、`@openrouter`、`@openai`）。
- 🕒 **最近使用记录**：本地自动记录最近选择的模型，便于再次使用时快速查看。
- ⌨️ **全功能键盘导航**：
  - `ArrowDown` / `ArrowUp` 仅在当前可见的匹配项间切换。
  - 在第一项按 `ArrowUp` 焦点返回输入框。
  - `Enter` 快捷激活首个可见模型。
  - `Escape` 快速清空搜索框输入。
- 🛡️ **核心抗破坏设计**：不重排 React DOM 节点，完全基于元素可见性进行过滤，抵御 DSH 核心 CSS 模块类名变更。
- 🌐 **多语言架构**：核心原生集成英文 (`en`) 与中文 (`zh`)；俄文通过 `@goodandready/dsh-russian-lang` 动态加载。
- 🎨 **原生主题融合**：全面适配 DSH 官方 CSS 设计令牌，完美支持深色和浅色主题。

---

## 安装说明

在您的 DSH web 配置文件中添加：

```bash
dsh plugin --profile web add @goodandready/dsh-model-search@0.1.5
```

---

## 测试与验证

运行单元与集成测试套件：

```bash
# 语法检查
npm run check

# 执行测试
npm test
```

---

## 许可证

MIT © [GooDAnDReaDY](https://goodandready.app)
