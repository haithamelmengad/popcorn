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

<h4 align="center">Videoanalyse-System für <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  Popcorn ermöglicht KI-Agenten, lange Videos durch Extraktion von Transkripten, Erkennung von Szenenwechseln und Rückgabe von Schlüsselbildern anzusehen und zu verstehen. Alles läuft lokal—keine externen APIs, keine Kosten, vollständige Privatsphäre.
</p>

---

## 🚀 Schnellstart

```bash
# FFmpeg installieren (erforderlich)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcorn installieren
git clone https://github.com/anthropics/popcorn.git
cd popcorn && npm install && npm run build

# Optional: Transkriptions-Backend installieren
pip install mlx-whisper                # Apple Silicon (am schnellsten)
pip install openai-whisper             # Alle Plattformen
```

**Hauptfunktionen:**

- 🎬 **Szenenerkennung** — Erfasst Bilder bei visuellen Übergängen, nicht in festen Intervallen
- 🎤 **Lokale Transkription** — 4 Backend-Optionen
- 🖼️ **Inline-Bilder** — Gibt Schlüsselbilder direkt in MCP-Antworten zurück
- 🎯 **Intelligente Voreinstellungen** — Automatische Konfiguration für Screencasts, Präsentationen, Filme, Interviews
- ⚡ **Keine Konfiguration** — Einfach den Videopfad übergeben
- 🔒 **Privatsphäre zuerst** — Alles läuft lokal, Daten verlassen Ihren Rechner nicht

---

## 🎤 Transkriptions-Backends

| Backend | Geschwindigkeit | Ideal für | Installation |
|---------|-----------------|-----------|--------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPUs | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Plattformübergreifend | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Am kompatibelsten | `pip install openai-whisper` |

---

## 📄 Lizenz

MIT-Lizenz — siehe [LICENSE](../../LICENSE) für Details.

---

<p align="center">
  Mit 🍿 für KI-Agenten überall gemacht
</p>
