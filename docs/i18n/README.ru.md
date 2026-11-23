<p align="center">
  <a href="../../README.md">📖 English</a> •
  <a href="../../LICENSE">⚖️ License</a>
</p>

<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

<h4 align="center">Система анализа видео для <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

<p align="center">
  <a href="../../LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="../../package.json">
    <img src="https://img.shields.io/badge/version-0.5.0-green.svg" alt="Version">
  </a>
  <a href="https://modelcontextprotocol.io">
    <img src="https://img.shields.io/badge/MCP-Compatible-purple.svg" alt="MCP Compatible">
  </a>
</p>

<p align="center">
  Popcorn позволяет ИИ-агентам просматривать и понимать длинные видео, извлекая транскрипции, обнаруживая смену сцен и возвращая ключевые кадры. Всё работает локально — без внешних API, без затрат, полная конфиденциальность.
</p>

---

## 🚀 Быстрый старт

```bash
# Установить FFmpeg (обязательно)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Установить Popcorn
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# Опционально: Установить бэкенд транскрипции
pip install mlx-whisper                # Apple Silicon (самый быстрый)
pip install openai-whisper             # Любая платформа
```

**Ключевые возможности:**

- 🎬 **Обнаружение сцен** — Захват кадров при визуальных переходах, а не через фиксированные интервалы
- 🎤 **Локальная транскрипция** — 4 варианта бэкенда
- 🖼️ **Встроенные изображения** — Возврат ключевых кадров прямо в ответах MCP
- 🎯 **Умные пресеты** — Автоматическая настройка для скринкастов, презентаций, фильмов, интервью
- ⚡ **Без настройки** — Просто укажите путь к видео
- 🔒 **Приватность прежде всего** — Всё работает локально, данные не покидают ваш компьютер

---

## 🎤 Бэкенды транскрипции

| Бэкенд | Скорость | Лучше всего для | Установка |
|--------|----------|-----------------|-----------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Кроссплатформенный | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Максимальная совместимость | `pip install openai-whisper` |

---

## 📄 Лицензия

Лицензия MIT — см. [LICENSE](../../LICENSE) для подробностей.

---

<p align="center">
  Сделано с 🍿 для ИИ-агентов по всему миру
</p>
