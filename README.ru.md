# 📦 @goodandready/dsh-model-search

<div align="center">

<h3>Быстрый живой поиск и фильтрация моделей в селекторе DeepSeek Harness WebUI</h3>

<p align="center">
  <a href="https://www.npmjs.com/package/@goodandready/dsh-model-search"><img src="https://img.shields.io/npm/v/@goodandready/dsh-model-search.svg?style=for-the-badge&color=6366f1&labelColor=1e1b4b" alt="npm version"></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- Витрина всех проектов -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/All_Author_Projects-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="All Author Projects"></a>
</p>

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> •
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a> •
  <a href="README.zh.md"><b>🇨🇳 中文说明</b></a>
</p>

<!-- Обязательный блок поддержки проекта -->
<table align="center">
  <tr>
    <td align="center">
      ⭐ <strong>Если вам нравится этот плагин, поставьте ему Star на GitHub</strong> — это покажет мне, что плагин полезен, и добавит мотивации продолжать его развитие.
      <br><br>
      🐛 <strong>Если вы нашли баг или хотите предложить новую функцию</strong>, создайте Issue на GitHub на любом языке — я рассмотрю предложение и реализую полезные улучшения в одной из следующих версий плагина.
    </td>
  </tr>
</table>

</div>

---

## ⚡ Обзор и решаемая проблема

По мере масштабирования конфигураций в **DeepSeek Harness** и подключения десятков моделей от разных провайдеров (OpenAI, Anthropic, OpenRouter, Ollama, DeepSeek), стандартное выпадающее меню селектора моделей становится перегруженным. Поиск нужной нейросети превращается в утомительную прокрутку длинных списков.

**`@goodandready/dsh-model-search`** встраивает в выпадающее меню выбора модели мгновенный, быстрый и доступный с клавиатуры живой поиск:
* **Мгновенная фильтрация**: поиск по названию модели, техническому идентификатору (`provider/model-id`) и группе провайдера.
* **Умный нечёткий поиск и акронимы**: поддержка поиска по аббревиатурам (например, `dsr1` мгновенно находит `deepseek-reasoner-1`).
* **Синтаксис `@provider`**: быстрая фильтрация моделей конкретного поставщика (например, `@ollama`, `@openrouter`).
* **Память недавних моделей**: сохранение последних выбранных моделей в браузере для быстрого повторного доступа.
* **Полная поддержка клавиатуры**: строгая циклическая навигация стрелками по найденным элементам, выбор по `Enter` и сброс по `Escape`.

---

## 🏗️ Архитектура

```mermaid
graph LR
  A[DSH WebUI Меню моделей] --> B[lib/client.js]
  B --> C[Монтирование поля поиска]
  C --> D{Парсер запроса}
  D -->|Текст / Акроним| E[Нечёткий матчер подпоследовательностей]
  D -->|@provider| F[Фильтр групп провайдеров]
  E --> G[Управление видимостью DOM]
  F --> G
  G --> H[Клавиатурная навигация]
  H --> I[Хранилище недавних моделей]
```

---

## ✨ Ключевые возможности

### 1. Многословный поиск с разделителями
Поддерживает составные поисковые запросы, разделённые пробелами, запятыми, слэшами или точками с запятой:
* Запрос: `openrouter/claude-3-5`
* Запрос: `reasoner; 32b`
* Запрос: `@ollama llama3`

### 2. Поиск по аббревиатурам и сокращениям
Находит модели по неполным подпоследовательностям символов:
* Ввод `dsr` находит `deepseek-reasoner`
* Ввод `gpt4o` находит `openai/gpt-4o-mini`

### 3. Специальный синтаксис `@provider`
Символ `@` в начале запроса фильтрует модели по конкретному провайдеру:
* `@openai` отображает только модели провайдера OpenAI.
* `@ollama qwen` находит модели семейства Qwen на локальном сервере Ollama.

### 4. Управление с клавиатуры

| Клавиша | Действие |
|:---|:---|
| `ArrowDown` | Переход к следующей видимой отфильтрованной модели |
| `ArrowUp` | Переход к предыдущей модели; на первой позиции возвращает фокус в поле ввода |
| `Enter` | Мгновенный выбор текущей подсвеченной или первой видимой модели |
| `Escape` | Очистка поля поиска; закрытие выпадающего меню, если поле уже пустое |

### 5. Надёжность и интеграция с ядром
* **Неинвазивная работа с DOM**: плагин только переключает видимость элементов (`display: none` / visible), не переставляя React Virtual DOM-узлы.
* **Устойчивость к обновлениям ядра**: не зависит от сгенерированных хэшей CSS-модулей DSH.
* **Нативная тема**: использует официальные системные CSS-переменные DSH для светлой и тёмной тем.
* **Мультиязычность**: ядро содержит встроенные английский (`en`) и китайский (`zh`) языки; русский (`ru`) автоматически подключается при установленном плагине `@goodandready/dsh-russian-lang`.

---

## 📦 Установка

Установка в Web-профиль DeepSeek Harness:

```bash
dsh plugin --profile web add @goodandready/dsh-model-search
```

Перезапустите DSH или обновите страницу браузера для активации живого поиска.

---

## 🧪 Тестирование

Запуск проверок синтаксиса и автоматических тестов:

```bash
# Проверка синтаксиса JavaScript
npm run check

# Запуск тестов
npm test
```

---

## 📄 Лицензия

MIT © [GooDAnDReaDY](https://github.com/GooDAnDReaDY)
