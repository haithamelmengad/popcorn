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

<h4 align="center">Video-analysesysteem gebouwd voor <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

<p align="center">
  <a href="../../LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="../../package.json">
    <img src="https://img.shields.io/badge/version-0.4.0-green.svg" alt="Version">
  </a>
  <a href="https://modelcontextprotocol.io">
    <img src="https://img.shields.io/badge/MCP-Compatible-purple.svg" alt="MCP Compatible">
  </a>
</p>

<p align="center">
  Popcorn stelt AI-agents in staat om lange video's te bekijken en begrijpen door transcripties te extraheren, scènewisselingen te detecteren en keyframes te retourneren. Alles draait lokaal—geen externe API's, geen kosten, volledige privacy.
</p>

---

## 🚀 Snel Starten

```bash
# FFmpeg installeren (vereist)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcorn installeren
git clone https://github.com/anthropics/popcorn.git
cd popcorn && npm install && npm run build

# Optioneel: Transcriptie-backend installeren
pip install mlx-whisper                # Apple Silicon (snelste)
pip install openai-whisper             # Elk platform
```

**Belangrijkste Functies:**

- 🎬 **Scènedetectie** — Leg frames vast bij visuele overgangen, niet op vaste intervallen
- 🎤 **Lokale Transcriptie** — 4 backend-opties
- 🖼️ **Inline Afbeeldingen** — Retourneert keyframes direct in MCP-responses
- 🎯 **Slimme Presets** — Automatische configuratie voor screencasts, presentaties, films, interviews
- ⚡ **Geen Configuratie** — Geef gewoon het videopad door
- 🔒 **Privacy Eerst** — Alles draait lokaal, data verlaat je machine niet

---

## 🎤 Transcriptie Backends

| Backend | Snelheid | Beste Voor | Installatie |
|---------|----------|------------|-------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU's | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Cross-platform | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Meest compatibel | `pip install openai-whisper` |

---

## 📄 Licentie

MIT Licentie — zie [LICENSE](../../LICENSE) voor details.

---

<p align="center">
  Gemaakt met 🍿 voor AI-agents overal
</p>
