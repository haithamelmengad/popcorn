<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn permite que Claude Code y otros agentes MCP vean un archivo de video de tu equipo.

<!-- demo -->

Devuelve fotogramas clave de los cambios de escena y una transcripción con marcas de tiempo.

**Instalar en Claude Code**

```bash
claude mcp add popcorn -- npx -y claude-popcorn
```

**O instálalo como plugin de Claude Code.** Así también se añade la skill `/popcorn:watch`. Ejecuta esto dentro de Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Pruébalo**

Pide lo que necesitas con tus palabras e indica la ruta completa del video:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Funciona con**

| Cliente | Configuración |
|--------|-------|
| Claude Code | El comando o el plugin de arriba |
| Claude Desktop | Añade el servidor a `claude_desktop_config.json`. Consulta [Inicio rápido](#inicio-rápido) |
| Codex | `codex mcp add popcorn -- npx -y claude-popcorn` |
| Cursor | Añade la misma entrada `mcpServers` a `~/.cursor/mcp.json` |

**Requisitos**

- [FFmpeg](https://ffmpeg.org/) en tu PATH
- Node.js 20 o posterior
- Un backend de Whisper para las transcripciones. Sin él, recibes los fotogramas igualmente. Consulta [Backends de transcripción](#backends-de-transcripción)

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
  <a href="#inicio-rápido">Inicio rápido</a> •
  <a href="#cómo-funciona">Cómo funciona</a> •
  <a href="#herramientas-mcp">Herramientas MCP</a> •
  <a href="#backends-de-transcripción">Transcripción</a> •
  <a href="#configuración">Configuración</a> •
  <a href="#solución-de-problemas">Solución de problemas</a> •
  <a href="#licencia">Licencia</a>
</p>

---

## Inicio rápido

```bash
# Install FFmpeg (required)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Optional: Install a transcription backend
pip install mlx-whisper                # Apple Silicon (fastest)
pip install openai-whisper             # Any platform

# Add Popcorn to Claude Code
claude mcp add popcorn -- npx -y claude-popcorn
```

Para Claude Desktop, añade esto a `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "popcorn": {
      "command": "npx",
      "args": ["-y", "claude-popcorn"]
    }
  }
}
```

**Funciones principales:**

- **Detección de escenas**: captura fotogramas en las transiciones visuales, no a intervalos fijos
- **Transcripción local**: 4 backends disponibles (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Imágenes integradas**: devuelve los fotogramas clave directamente en las respuestas MCP
- **Ajustes predefinidos inteligentes**: se configura solo para screencasts, presentaciones, películas y entrevistas
- **Sin configuración**: pasa la ruta de un video y funciona
- **Privacidad ante todo**: todo se ejecuta en local y ningún dato sale de tu equipo. Los modelos de Whisper se descargan una sola vez, en el primer uso

---

## Documentación

### Primeros pasos

- **[Inicio rápido](#inicio-rápido)**: instalación y configuración
- **[Tutorial](../tutorial.md)**: guía de uso paso a paso
- **[Herramientas MCP](#herramientas-mcp)**: referencia de las herramientas disponibles

### Guías

- **[Backends de transcripción](#backends-de-transcripción)**: elige el mejor backend para tu sistema
- **[Tipos de video y objetivos](#tipos-de-video)**: ajustes predefinidos para cada tipo de contenido
- **[Configuración](#configuración)**: parámetros avanzados

### Referencia

- **[Solución de problemas](../troubleshooting.md)**: problemas habituales y cómo resolverlos
- **[Skill para agentes](../../skills/watch/SKILL.md)**: instrucciones para agentes de IA
- **[Referencia de la API](#herramientas-mcp)**: esquemas y respuestas de las herramientas

---

## Cómo funciona

**Componentes principales:**

1. **FFprobe**: extrae los metadatos del video (duración, resolución, códecs)
2. **Detección de escenas con FFmpeg**: encuentra las transiciones visuales con el filtro `select='gt(scene,N)'`
3. **Extracción de fotogramas en paralelo**: captura imágenes JPEG en los instantes de cambio de escena
4. **Transcripción con varios backends**: las variantes de Whisper convierten el audio en texto con marcas de tiempo
5. **Paquete de análisis**: los resultados se guardan en el directorio `.popcorn/`
6. **Respuesta MCP**: devuelve los metadatos y las imágenes integradas en base64

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Herramientas MCP

| Herramienta | Descripción |
|------|-------------|
| `popcorn_analyze` | Análisis principal: extrae fotogramas, transcribe el audio y devuelve los resultados |
| `popcorn_suggest` | Lee los metadatos del video y recomienda una configuración |
| `popcorn_presets` | Lista los tipos de video y los objetivos disponibles |
| `popcorn_backends` | Detecta tu sistema y muestra las opciones de transcripción |
| `popcorn_read` | Lee fragmentos de la transcripción filtrados por tiempo |

### Uso básico

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Con ajustes predefinidos

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

## Tipos de video

| Tipo | Ideal para | Detección de escenas |
|------|----------|-----------------|
| `screencast` | Tutoriales, sesiones de programación, demos de interfaz | Umbral bajo |
| `presentation` | Diapositivas, clases, conferencias | Cambios de diapositiva |
| `movie` | Películas, series | Equilibrada |
| `interview` | Pódcasts, personas hablando a cámara | Prioridad a la transcripción |
| `surveillance` | Cámaras de seguridad, cámaras de a bordo | Umbral alto |
| `sports` | Eventos en directo, acción rápida | Alta frecuencia de fotogramas |

## Objetivos

| Objetivo | Cuándo usarlo |
|-----------|----------|
| `summary` | Necesitas un resumen rápido |
| `detailed` | No quieres perderte nada |
| `find_moment` | Buscas un contenido concreto |
| `transcribe` | Lo más importante es el audio o la voz |
| `visual_only` | Solo te interesa la imagen |
| `quick_scan` | Necesitas una vista previa rápida |

---

## Backends de transcripción

Popcorn detecta tu sistema automáticamente y recomienda el mejor backend.

### Comparación de backends

| Backend | Velocidad | Ideal para | Instalación |
|---------|-------|----------|---------|
| **mlx-whisper** | El más rápido | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Rápido | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Moderado | Multiplataforma | `brew install whisper-cpp` |
| **whisper** | Lento | El más compatible | `pip install openai-whisper` |

whisper-cpp necesita un archivo de modelo. Descarga un modelo ggml desde [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) y pon su ruta en la variable de entorno `WHISPER_CPP_MODEL`, o pasa la ruta en `model`. Sin un archivo de modelo, Popcorn indica que este backend no está disponible.

### Tiempos de procesamiento (video de 60 min)

| Backend | Tiempo |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Forzar un backend

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

## Configuración

### Todos los parámetros

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `path` | string | **Obligatorio.** Ruta absoluta al archivo de video |
| `videoType` | string | Ajuste predefinido de tipo de video |
| `objective` | string | Ajuste predefinido de objetivo del análisis |
| `transcribe` | boolean | Activa o desactiva la transcripción |
| `backend` | string | Backend de transcripción |
| `model` | string | Modelo de Whisper (`tiny`, `base`, `small`, `medium`, `large`). Para whisper-cpp: ruta a un archivo de modelo ggml |
| `language` | string | Código de idioma (por ejemplo, `en`, `es`, `fr`) |
| `frameMode` | string | `scene` o `interval` |
| `framesPerMin` | number | Fotogramas por minuto en el modo `interval` |
| `sceneThreshold` | number | Sensibilidad de la detección de escenas (0-1) |
| `minSceneInterval` | number | Segundos mínimos entre fotogramas de escena |
| `maxFrames` | number | Máximo de fotogramas que se extraen |
| `inlineFrames` | number | Fotogramas que se devuelven en base64 |
| `maxChunkChars` | number | Tamaño de cada fragmento de la transcripción, en caracteres |
| `maxTranscriptChars` | number | Longitud del extracto de la transcripción en la respuesta |
| `outDir` | string | Directorio de salida del paquete de análisis |

### Estructura de la salida

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

## Solución de problemas

### No se encuentra FFmpeg

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### No hay backend de transcripción

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Se detectan muy pocos fotogramas

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Se detectan demasiados fotogramas

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Consulta la **[guía de solución de problemas](../troubleshooting.md)** para ver más soluciones.

---

## Desarrollo

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Estructura del proyecto

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

## Cómo contribuir

1. Haz un fork del repositorio
2. Crea una rama para tu cambio (`git checkout -b feature/amazing`)
3. Haz commit de los cambios (`git commit -m 'Add amazing feature'`)
4. Sube la rama (`git push origin feature/amazing`)
5. Abre un Pull Request

---

## Licencia

Licencia MIT. Consulta [LICENSE](../../LICENSE) para más detalles.

---

## Agradecimientos

- [OpenAI Whisper](https://github.com/openai/whisper): reconocimiento de voz
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): versión en C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): procesamiento de video
- [Model Context Protocol](https://modelcontextprotocol.io/): especificación de MCP

---

Popcorn es un proyecto independiente. No está afiliado a Anthropic ni cuenta con su respaldo.

<p align="center">
  Hecho con 🍿 para los agentes de IA de todo el mundo
</p>
