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

<h4 align="center">Système d'analyse vidéo conçu pour <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  Popcorn permet aux agents IA de regarder et comprendre des vidéos longues en extrayant les transcriptions, détectant les changements de scène et retournant les images clés. Tout fonctionne localement—pas d'API externe, pas de frais, confidentialité totale.
</p>

---

## 🚀 Démarrage Rapide

```bash
# Installer FFmpeg (requis)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Installer Popcorn
git clone https://github.com/anthropics/popcorn.git
cd popcorn && npm install && npm run build

# Optionnel: Installer un backend de transcription
pip install mlx-whisper                # Apple Silicon (le plus rapide)
pip install openai-whisper             # Toute plateforme
```

**Fonctionnalités Clés:**

- 🎬 **Détection de Scènes** — Capture les images aux transitions visuelles, pas à intervalles fixes
- 🎤 **Transcription Locale** — 4 options de backend
- 🖼️ **Images en Ligne** — Retourne les images clés directement dans les réponses MCP
- 🎯 **Préréglages Intelligents** — Configure automatiquement pour screencasts, présentations, films, interviews
- ⚡ **Zéro Configuration** — Passez simplement le chemin de la vidéo
- 🔒 **Confidentialité d'Abord** — Tout fonctionne localement, les données ne quittent pas votre machine

---

## 🎤 Backends de Transcription

| Backend | Vitesse | Idéal Pour | Installation |
|---------|---------|------------|--------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | GPUs NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Multiplateforme | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Plus compatible | `pip install openai-whisper` |

---

## 📄 Licence

Licence MIT — voir [LICENSE](../../LICENSE) pour les détails.

---

<p align="center">
  Fait avec 🍿 pour les agents IA partout
</p>
