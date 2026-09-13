# 📦 @goodandready-private/dsh-model-search

<div align="center">

<h3>Быстрый живой поиск и фильтрация моделей в селекторе DeepSeek Harness WebUI</h3>

<p align="center">
  <a href="LICENSE"><img src="https://img.shields.io/github/license/GooDAnDReaDY/dsh-model-search.svg?style=for-the-badge&color=10b981&labelColor=064e3b" alt="license"></a>
  <a href="https://github.com/topics/dsh-plugin"><img src="https://img.shields.io/badge/DSH-Plugin-8b5cf6.svg?style=for-the-badge&labelColor=2e1065" alt="DSH Plugin"></a>
  <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node-20%2B-f59e0b.svg?style=for-the-badge&labelColor=451a03" alt="Node version"></a>
</p>

<!-- Витрина всех проектов -->
<p align="center">
  <a href="https://goodandready.app/"><img src="https://img.shields.io/badge/Все_проекты_автора-goodandready.app-ff4500.svg?style=for-the-badge&logo=rocket&logoColor=white&labelColor=1a1a2e" alt="Все проекты автора"></a>
</p>

<p align="center">
  <a href="README.md"><b>🇬🇧 English</b></a> •
  <a href="README.zh.md"><b>🇨🇳 中文说明</b></a> •
  <a href="README.ru.md"><b>🇷🇺 Русский</b></a>
</p>

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

## Обзор

**`@goodandready-private/dsh-model-search`** дополняет выпадающее меню выбора моделей в DeepSeek Harness WebUI полем мгновенного поиска. Когда подключено множество провайдеров и моделей, найти нужную модель можно за доли секунды без прокрутки длинных списков.

---

## Возможности

- 🔍 **Мгновенная фильтрация**: поиск по названию модели, техническому идентификатору (`provider/model-id`) и названию провайдера на лету.
- 🔀 **Многословный поиск с пунктуацией**: поддержка запросов через пробел, запятую, слэш или точку с запятой (`provider/model`, `reasoner; 32b`).
- ⚡ **Умный поиск по аббревиатурам и подпоследовательностям**: поиск понимает акронимы и сокращения без дефисов (например, `dsr1` находит `provider-id/deepseek-reasoner-1`).
- 🏷️ **Быстрый фильтр по провайдеру (`@provider`)**: синтаксис с собачкой позволяет мгновенно оставить только модели конкретного провайдера (например, `@ollama`, `@openrouter`, `@openai`).
- 🕒 **История недавних моделей**: запоминает последние выбранные модели в браузере для быстрого повторного доступа.
- ⌨️ **Умная навигация с клавиатуры**:
  - Стрелки `ArrowDown` / `ArrowUp` перемещают фокус строго по видимым отфильтрованным моделям.
  - Стрелка `ArrowUp` на первом элементе возвращает фокус обратно в поле поиска.
  - `Enter` активирует первую видимую модель.
  - `Escape` очищает введённый поисковый запрос.
- 🛡️ **Защита от изменений ядра DSH**: плагин не переставляет React DOM-узлы и управляет только их видимостью, что защищает от поломок при обновлениях стилей ядра.
- 🌐 **Мультиязычная архитектура**: ядро плагина содержит английскую (`en`) и китайскую (`zh`) локали; русский интерфейс предоставляется через `@goodandready/dsh-russian-lang`.
- 🎨 **Нативная тема**: цвета и отступы соответствуют системным токенам темы DSH (светлая и тёмная темы).

---

## Установка

Добавление в web-профиль DSH:

```bash
dsh plugin --profile web add @goodandready-private/dsh-model-search@0.1.4
```

---

## Тестирование

Запуск тестов:

```bash
# Проверка синтаксиса
npm run check

# Запуск тестов
npm test
```

---

## Лицензия

MIT © [GooDAnDReaDY](https://goodandready.app)
