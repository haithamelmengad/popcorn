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

<h4 align="center">Sistema de análisis de video construido para <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  Popcorn permite que los agentes de IA vean y comprendan videos de larga duración extrayendo transcripciones, detectando cambios de escena y devolviendo fotogramas clave. Todo se ejecuta localmente: sin APIs externas, sin tarifas, privacidad completa.
</p>

---

## 🚀 Inicio Rápido

```bash
# Instalar FFmpeg (requerido)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Instalar Popcorn
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# Opcional: Instalar un backend de transcripción
pip install mlx-whisper                # Apple Silicon (más rápido)
pip install openai-whisper             # Cualquier plataforma
```

**Características Principales:**

- 🎬 **Detección de Escenas** — Captura fotogramas en transiciones visuales, no en intervalos fijos
- 🎤 **Transcripción Local** — 4 opciones de backend
- 🖼️ **Imágenes en Línea** — Devuelve fotogramas clave directamente en respuestas MCP
- 🎯 **Presets Inteligentes** — Configura automáticamente para screencasts, presentaciones, películas, entrevistas
- ⚡ **Cero Configuración** — Solo pasa la ruta del video y funciona
- 🔒 **Privacidad Primero** — Todo se ejecuta localmente, los datos no salen de tu máquina

---

## 🎤 Backends de Transcripción

| Backend | Velocidad | Mejor Para | Instalar |
|---------|-----------|------------|----------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | GPUs NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Multiplataforma | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Más compatible | `pip install openai-whisper` |

---

## 📄 Licencia

Licencia MIT — ver [LICENSE](../../LICENSE) para detalles.

---

<p align="center">
  Hecho con 🍿 para agentes de IA en todas partes
</p>
