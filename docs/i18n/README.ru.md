<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn позволяет Claude Code и другим MCP-агентам смотреть видеофайлы на вашем компьютере.

<!-- demo -->

Popcorn возвращает ключевые кадры в местах смены сцен и расшифровку с таймкодами.

**Установка для Claude Code**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**Или установите Popcorn как плагин Claude Code.** Так вы получите ещё и навык `/popcorn:watch`. Выполните эти команды в Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Попробуйте**

Спросите обычными словами и укажите полный путь к видео:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Работает с**

| Клиент | Настройка |
|--------|-----------|
| Claude Code | Команда или плагин выше |
| Claude Desktop | Добавьте сервер в `claude_desktop_config.json`. См. [Быстрый старт](#быстрый-старт) |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | Добавьте такую же запись `mcpServers` в `~/.cursor/mcp.json` |

**Требования**

- [FFmpeg](https://ffmpeg.org/) в PATH
- Node.js 20 или новее
- Один бэкенд Whisper для расшифровки. Без него вы всё равно получите кадры. См. [Бэкенды транскрипции](#бэкенды-транскрипции)

<p align="center">
  <a href="../../README.md">🇺🇸 English</a> •
  <a href="README.zh.md">🇨🇳 中文</a> •
  <a href="README.ja.md">🇯🇵 日本語</a> •
  <a href="README.ko.md">🇰🇷 한국어</a> •
  <a href="README.es.md">🇪🇸 Español</a> •
  <a href="README.de.md">🇩🇪 Deutsch</a> •
  <a href="README.fr.md">🇫🇷 Français</a> •
  <a href="README.pt.md">🇧🇷 Português</a> •
  <a href="README.ru.md">🇷🇺 Русский</a> •
  <a href="README.ar.md">🇸🇦 العربية</a> •
  <a href="README.it.md">🇮🇹 Italiano</a> •
  <a href="README.nl.md">🇳🇱 Nederlands</a> •
  <a href="README.tr.md">🇹🇷 Türkçe</a> •
  <a href="README.vi.md">🇻🇳 Tiếng Việt</a> •
  <a href="README.hi.md">🇮🇳 हिन्दी</a>
</p>

<p align="center">
  <a href="#быстрый-старт">Быстрый старт</a> •
  <a href="#как-это-работает">Как это работает</a> •
  <a href="#инструменты-mcp">Инструменты MCP</a> •
  <a href="#бэкенды-транскрипции">Транскрипция</a> •
  <a href="#конфигурация">Конфигурация</a> •
  <a href="#устранение-неполадок">Устранение неполадок</a> •
  <a href="#лицензия">Лицензия</a>
</p>

---

## Быстрый старт

```bash
# Install FFmpeg (required)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Optional: Install a transcription backend
pip install mlx-whisper                # Apple Silicon (fastest)
pip install openai-whisper             # Any platform

# Add Popcorn to Claude Code
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

Для Claude Desktop добавьте это в `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "popcorn": {
      "command": "npx",
      "args": ["-y", "github:haithamelmengad/claude-popcorn"]
    }
  }
}
```

**Основные возможности:**

- **Определение сцен**: кадры берутся в местах визуальных переходов, а не через равные промежутки
- **Локальная транскрипция**: 4 бэкенда на выбор (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Встроенные изображения**: ключевые кадры приходят прямо в ответах MCP
- **Умные пресеты**: готовые настройки для скринкастов, презентаций, фильмов и интервью
- **Без настройки**: укажите путь к видео, и всё заработает
- **Приватность прежде всего**: всё работает локально, данные не покидают ваш компьютер. Модели Whisper скачиваются один раз, при первом запуске

---

## Документация

### Начало работы

- **[Быстрый старт](#быстрый-старт)**: установка и настройка
- **[Учебник](../tutorial.md)**: пошаговое руководство по использованию
- **[Инструменты MCP](#инструменты-mcp)**: справка по доступным инструментам

### Руководства

- **[Бэкенды транскрипции](#бэкенды-транскрипции)**: выберите лучший бэкенд для вашей системы
- **[Типы видео и цели](#типы-видео)**: пресеты для разного контента
- **[Конфигурация](#конфигурация)**: дополнительные параметры

### Справка

- **[Устранение неполадок](../troubleshooting.md)**: частые проблемы и их решения
- **[Навык агента](../../skills/watch/SKILL.md)**: инструкции для ИИ-агентов
- **[Справочник API](#инструменты-mcp)**: схемы инструментов и ответы

---

## Как это работает

**Основные компоненты:**

1. **FFprobe**: извлекает метаданные видео (длительность, разрешение, кодеки)
2. **Определение сцен в FFmpeg**: находит визуальные переходы фильтром `select='gt(scene,N)'`
3. **Параллельное извлечение кадров**: сохраняет JPEG в моменты смены сцен
4. **Транскрипция с несколькими бэкендами**: варианты Whisper превращают аудио в текст с таймкодами
5. **Пакет анализа**: результаты сохраняются в каталог `.popcorn/`
6. **Ответ MCP**: возвращает метаданные и встроенные изображения в base64

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Инструменты MCP

| Инструмент | Описание |
|------------|----------|
| `popcorn_analyze` | Основной анализ: извлекает кадры, расшифровывает аудио, возвращает результаты |
| `popcorn_suggest` | Читает метаданные видео и предлагает настройки |
| `popcorn_presets` | Показывает доступные типы видео и цели |
| `popcorn_backends` | Определяет вашу систему и показывает варианты транскрипции |
| `popcorn_read` | Читает фрагменты расшифровки с фильтром по времени |

### Базовое использование

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### С пресетами

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "videoType": "screencast",
    "objective": "detailed"
  }
}
```

---

## Типы видео

| Тип | Подходит для | Определение сцен |
|-----|--------------|------------------|
| `screencast` | Уроки, сессии программирования, демо интерфейсов | Низкий порог |
| `presentation` | Слайды, лекции, доклады | Смена слайдов |
| `movie` | Фильмы, сериалы | Сбалансированное |
| `interview` | Подкасты, видео с говорящим в кадре | Приоритет транскрипции |
| `surveillance` | Записи камер наблюдения, видеорегистраторы | Высокий порог |
| `sports` | Прямые трансляции, быстрое действие | Высокая частота кадров |

## Цели

| Цель | Когда использовать |
|------|--------------------|
| `summary` | Нужен краткий обзор |
| `detailed` | Нельзя ничего упустить |
| `find_moment` | Нужно найти конкретный фрагмент |
| `transcribe` | Важнее всего звук и речь |
| `visual_only` | Важна только картинка |
| `quick_scan` | Нужен быстрый предпросмотр |

---

## Бэкенды транскрипции

Popcorn сам определяет вашу систему и рекомендует лучший бэкенд.

### Сравнение бэкендов

| Бэкенд | Скорость | Подходит для | Установка |
|--------|----------|--------------|-----------|
| **mlx-whisper** | Самый быстрый | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Быстрый | Видеокарты NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Средний | Любые платформы | `brew install whisper-cpp` |
| **whisper** | Медленный | Лучшая совместимость | `pip install openai-whisper` |

Для whisper-cpp нужен файл модели. Скачайте модель ggml из [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) и укажите путь к ней в переменной окружения `WHISPER_CPP_MODEL` или передайте путь в параметре `model`. Без файла модели Popcorn сообщает, что этот бэкенд недоступен.

### Время обработки (видео на 60 минут)

| Бэкенд | Время |
|--------|-------|
| mlx-whisper | 3-8 мин |
| faster-whisper | 5-10 мин |
| whisper-cpp | 10-20 мин |
| whisper | 30-60 мин |

### Выбор бэкенда вручную

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "backend": "mlx-whisper"
  }
}
```

---

## Конфигурация

### Все параметры

| Параметр | Тип | Описание |
|----------|-----|----------|
| `path` | string | **Обязательный.** Абсолютный путь к видеофайлу |
| `videoType` | string | Пресет типа видео |
| `objective` | string | Пресет цели анализа |
| `transcribe` | boolean | Включить или отключить транскрипцию |
| `backend` | string | Бэкенд транскрипции |
| `model` | string | Модель Whisper (`tiny`, `base`, `small`, `medium`, `large`). Для whisper-cpp: путь к файлу модели ggml |
| `language` | string | Код языка (например, `en`, `es`, `fr`) |
| `frameMode` | string | `scene` или `interval` |
| `framesPerMin` | number | Число кадров в минуту в режиме `interval` |
| `sceneThreshold` | number | Чувствительность к смене сцен (0-1) |
| `minSceneInterval` | number | Минимум секунд между кадрами сцен |
| `maxFrames` | number | Максимальное число извлекаемых кадров |
| `inlineFrames` | number | Число кадров, возвращаемых в base64 |
| `maxChunkChars` | number | Размер фрагмента расшифровки в символах |
| `maxTranscriptChars` | number | Длина отрывка расшифровки в ответе |
| `outDir` | string | Каталог для пакета анализа |

### Структура вывода

```
.popcorn/<video>_<timestamp>/
├── analysis.json          # Full metadata
├── transcript.txt         # Plain text
├── transcript.json        # Timestamped segments
├── transcript.chunks.json # LLM-friendly chunks
└── assets/
    ├── audio.wav
    └── frames/
        ├── scene_000001.jpg
        └── ...
```

---

## Устранение неполадок

### FFmpeg не найден

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Нет бэкенда транскрипции

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Найдено слишком мало кадров

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Найдено слишком много кадров

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Другие решения см. в **[руководстве по устранению неполадок](../troubleshooting.md)**.

---

## Разработка

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Структура проекта

```
claude-popcorn/
├── src/
│   ├── index.ts        # MCP server
│   ├── analyze.ts      # Analysis pipeline
│   ├── ffmpeg.ts       # Video processing
│   ├── transcribe.ts   # Multi-backend transcription
│   ├── presets.ts      # Video type presets
│   ├── read.ts         # File and transcript reading
│   └── commands.ts     # Shell execution
├── docs/               # Documentation
└── skills/             # Agent skills
```

---

## Участие в разработке

1. Сделайте форк репозитория
2. Создайте ветку для новой функции (`git checkout -b feature/amazing`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Отправьте ветку (`git push origin feature/amazing`)
5. Откройте Pull Request

---

## Лицензия

Лицензия MIT. Подробности см. в файле [LICENSE](../../LICENSE).

---

## Благодарности

- [OpenAI Whisper](https://github.com/openai/whisper): распознавание речи
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): порт на C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): обработка видео
- [Model Context Protocol](https://modelcontextprotocol.io/): спецификация MCP

---

Popcorn является независимым проектом. Он не связан с Anthropic и не одобрен ею.

<p align="center">
  Сделано с 🍿 для ИИ-агентов по всему миру
</p>
