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

<h4 align="center">Sistema di analisi video costruito per <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  Popcorn permette agli agenti IA di guardare e comprendere video lunghi estraendo trascrizioni, rilevando cambi di scena e restituendo fotogrammi chiave. Tutto funziona localmente—nessuna API esterna, nessun costo, privacy totale.
</p>

---

## 🚀 Avvio Rapido

```bash
# Installare FFmpeg (richiesto)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Installare Popcorn
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# Opzionale: Installare un backend di trascrizione
pip install mlx-whisper                # Apple Silicon (più veloce)
pip install openai-whisper             # Qualsiasi piattaforma
```

**Caratteristiche Principali:**

- 🎬 **Rilevamento Scene** — Cattura fotogrammi alle transizioni visive, non a intervalli fissi
- 🎤 **Trascrizione Locale** — 4 opzioni di backend
- 🖼️ **Immagini Inline** — Restituisce fotogrammi chiave direttamente nelle risposte MCP
- 🎯 **Preset Intelligenti** — Configura automaticamente per screencast, presentazioni, film, interviste
- ⚡ **Zero Configurazione** — Basta passare il percorso del video
- 🔒 **Privacy Prima** — Tutto funziona localmente, i dati non lasciano la tua macchina

---

## 🎤 Backend di Trascrizione

| Backend | Velocità | Ideale Per | Installazione |
|---------|----------|------------|---------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Multipiattaforma | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Più compatibile | `pip install openai-whisper` |

---

## 📄 Licenza

Licenza MIT — vedi [LICENSE](../../LICENSE) per i dettagli.

---

<p align="center">
  Fatto con 🍿 per agenti IA ovunque
</p>
