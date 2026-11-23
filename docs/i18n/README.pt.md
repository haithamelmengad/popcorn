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

<h4 align="center">Sistema de análise de vídeo construído para <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  Popcorn permite que agentes de IA assistam e compreendam vídeos longos extraindo transcrições, detectando mudanças de cena e retornando quadros-chave. Tudo roda localmente—sem APIs externas, sem custos, privacidade total.
</p>

---

## 🚀 Início Rápido

```bash
# Instalar FFmpeg (obrigatório)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Instalar Popcorn
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# Opcional: Instalar backend de transcrição
pip install mlx-whisper                # Apple Silicon (mais rápido)
pip install openai-whisper             # Qualquer plataforma
```

**Recursos Principais:**

- 🎬 **Detecção de Cenas** — Captura quadros em transições visuais, não em intervalos fixos
- 🎤 **Transcrição Local** — 4 opções de backend
- 🖼️ **Imagens Inline** — Retorna quadros-chave diretamente nas respostas MCP
- 🎯 **Predefinições Inteligentes** — Configura automaticamente para screencasts, apresentações, filmes, entrevistas
- ⚡ **Zero Configuração** — Basta passar o caminho do vídeo
- 🔒 **Privacidade em Primeiro** — Tudo roda localmente, dados não saem da sua máquina

---

## 🎤 Backends de Transcrição

| Backend | Velocidade | Melhor Para | Instalação |
|---------|------------|-------------|------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | GPUs NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Multiplataforma | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Mais compatível | `pip install openai-whisper` |

---

## 📄 Licença

Licença MIT — veja [LICENSE](../../LICENSE) para detalhes.

---

<p align="center">
  Feito com 🍿 para agentes de IA em todo lugar
</p>
