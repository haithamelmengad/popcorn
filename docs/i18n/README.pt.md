<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

O Popcorn permite que o Claude Code e outros agentes MCP assistam a um arquivo de vídeo na sua máquina.

<!-- demo -->

Ele retorna quadros-chave das mudanças de cena e uma transcrição com marcação de tempo.

**Instalar no Claude Code**

```bash
claude mcp add popcorn -- npx -y claude-popcorn
```

**Ou instale como plugin do Claude Code.** Isso também adiciona a skill `/popcorn:watch`. Execute estes comandos dentro do Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Experimente**

Peça com suas palavras e informe o caminho completo do vídeo:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Funciona com**

| Cliente | Configuração |
|--------|-------|
| Claude Code | O comando ou o plugin acima |
| Claude Desktop | Adicione o servidor ao `claude_desktop_config.json`. Veja [Início rápido](#início-rápido) |
| Codex | `codex mcp add popcorn -- npx -y claude-popcorn` |
| Cursor | Adicione a mesma entrada `mcpServers` ao `~/.cursor/mcp.json` |

**Requisitos**

- [FFmpeg](https://ffmpeg.org/) no seu PATH
- Node.js 20 ou mais recente
- Um backend do Whisper para as transcrições. Sem ele, você ainda recebe os quadros. Veja [Backends de transcrição](#backends-de-transcrição)

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
  <a href="#início-rápido">Início rápido</a> •
  <a href="#como-funciona">Como funciona</a> •
  <a href="#ferramentas-mcp">Ferramentas MCP</a> •
  <a href="#backends-de-transcrição">Transcrição</a> •
  <a href="#configuração">Configuração</a> •
  <a href="#solução-de-problemas">Solução de problemas</a> •
  <a href="#licença">Licença</a>
</p>

---

## Início rápido

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

No Claude Desktop, adicione isto a `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**Principais recursos:**

- **Detecção de cenas**: captura quadros nas transições visuais, não em intervalos fixos
- **Transcrição local**: 4 opções de backend (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Imagens embutidas**: retorna os quadros-chave direto nas respostas MCP
- **Predefinições inteligentes**: configura-se sozinho para screencasts, apresentações, filmes e entrevistas
- **Sem configuração**: basta passar o caminho de um vídeo
- **Privacidade em primeiro lugar**: tudo roda localmente e nenhum dado sai da sua máquina. Os modelos do Whisper são baixados uma única vez, no primeiro uso

---

## Documentação

### Primeiros passos

- **[Início rápido](#início-rápido)**: instalação e configuração
- **[Tutorial](../tutorial.md)**: guia de uso passo a passo
- **[Ferramentas MCP](#ferramentas-mcp)**: referência das ferramentas disponíveis

### Guias

- **[Backends de transcrição](#backends-de-transcrição)**: escolha o melhor backend para o seu sistema
- **[Tipos de vídeo e objetivos](#tipos-de-vídeo)**: predefinições para cada tipo de conteúdo
- **[Configuração](#configuração)**: parâmetros avançados

### Referência

- **[Solução de problemas](../troubleshooting.md)**: problemas comuns e como resolver
- **[Skill para agentes](../../skills/watch/SKILL.md)**: instruções para agentes de IA
- **[Referência da API](#ferramentas-mcp)**: esquemas e respostas das ferramentas

---

## Como funciona

**Componentes principais:**

1. **FFprobe**: extrai os metadados do vídeo (duração, resolução, codecs)
2. **Detecção de cenas com FFmpeg**: encontra as transições visuais com o filtro `select='gt(scene,N)'`
3. **Extração de quadros em paralelo**: captura imagens JPEG nos instantes de mudança de cena
4. **Transcrição com vários backends**: as variantes do Whisper convertem o áudio em texto com marcação de tempo
5. **Pacote de análise**: os resultados são salvos no diretório `.popcorn/`
6. **Resposta MCP**: retorna os metadados e as imagens embutidas em base64

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Ferramentas MCP

| Ferramenta | Descrição |
|------|-------------|
| `popcorn_analyze` | Análise principal: extrai quadros, transcreve o áudio e retorna os resultados |
| `popcorn_suggest` | Lê os metadados do vídeo e recomenda uma configuração |
| `popcorn_presets` | Lista os tipos de vídeo e os objetivos disponíveis |
| `popcorn_backends` | Detecta o seu sistema e mostra as opções de transcrição |
| `popcorn_read` | Lê trechos da transcrição filtrados por tempo |

### Uso básico

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Com predefinições

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

## Tipos de vídeo

| Tipo | Ideal para | Detecção de cenas |
|------|----------|-----------------|
| `screencast` | Tutoriais, sessões de programação, demos de interface | Limiar baixo |
| `presentation` | Slides, aulas, palestras | Trocas de slide |
| `movie` | Filmes, séries | Equilibrada |
| `interview` | Podcasts, pessoas falando para a câmera | Prioridade para a transcrição |
| `surveillance` | Câmeras de segurança, câmeras veiculares | Limiar alto |
| `sports` | Eventos ao vivo, ação rápida | Alta taxa de quadros |

## Objetivos

| Objetivo | Quando usar |
|-----------|----------|
| `summary` | Você precisa de uma visão geral rápida |
| `detailed` | Você não quer perder nada |
| `find_moment` | Você procura um conteúdo específico |
| `transcribe` | O áudio ou a fala é o mais importante |
| `visual_only` | Só a imagem interessa |
| `quick_scan` | Você precisa de uma prévia rápida |

---

## Backends de transcrição

O Popcorn detecta o seu sistema automaticamente e recomenda o melhor backend.

### Comparação de backends

| Backend | Velocidade | Ideal para | Instalação |
|---------|-------|----------|---------|
| **mlx-whisper** | O mais rápido | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Rápido | GPUs NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Moderado | Multiplataforma | `brew install whisper-cpp` |
| **whisper** | Lento | O mais compatível | `pip install openai-whisper` |

O whisper-cpp precisa de um arquivo de modelo. Baixe um modelo ggml em [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) e defina a variável de ambiente `WHISPER_CPP_MODEL` com o caminho dele, ou passe o caminho em `model`. Sem um arquivo de modelo, o Popcorn informa que esse backend não está disponível.

### Tempos de processamento (vídeo de 60 min)

| Backend | Tempo |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Forçar um backend

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

## Configuração

### Todos os parâmetros

| Parâmetro | Tipo | Descrição |
|-----------|------|-------------|
| `path` | string | **Obrigatório.** Caminho absoluto do arquivo de vídeo |
| `videoType` | string | Predefinição de tipo de vídeo |
| `objective` | string | Predefinição de objetivo da análise |
| `transcribe` | boolean | Ativa ou desativa a transcrição |
| `backend` | string | Backend de transcrição |
| `model` | string | Modelo do Whisper (`tiny`, `base`, `small`, `medium`, `large`). Para whisper-cpp: caminho de um arquivo de modelo ggml |
| `language` | string | Código do idioma (por exemplo, `en`, `es`, `fr`) |
| `frameMode` | string | `scene` ou `interval` |
| `framesPerMin` | number | Quadros por minuto no modo `interval` |
| `sceneThreshold` | number | Sensibilidade da detecção de cenas (0-1) |
| `minSceneInterval` | number | Mínimo de segundos entre quadros de cena |
| `maxFrames` | number | Máximo de quadros a extrair |
| `inlineFrames` | number | Quadros retornados em base64 |
| `maxChunkChars` | number | Tamanho de cada bloco da transcrição, em caracteres |
| `maxTranscriptChars` | number | Tamanho do trecho da transcrição na resposta |
| `outDir` | string | Diretório de saída do pacote de análise |

### Estrutura da saída

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

## Solução de problemas

### FFmpeg não encontrado

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Nenhum backend de transcrição

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Poucos quadros detectados

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Quadros demais detectados

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Veja o **[guia de solução de problemas](../troubleshooting.md)** para mais soluções.

---

## Desenvolvimento

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Estrutura do projeto

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

## Como contribuir

1. Faça um fork do repositório
2. Crie uma branch para a sua mudança (`git checkout -b feature/amazing`)
3. Faça o commit das mudanças (`git commit -m 'Add amazing feature'`)
4. Envie a branch (`git push origin feature/amazing`)
5. Abra um Pull Request

---

## Licença

Licença MIT. Veja [LICENSE](../../LICENSE) para mais detalhes.

---

## Agradecimentos

- [OpenAI Whisper](https://github.com/openai/whisper): reconhecimento de fala
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): versão em C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): processamento de vídeo
- [Model Context Protocol](https://modelcontextprotocol.io/): especificação do MCP

---

O Popcorn é um projeto independente. Não é afiliado à Anthropic nem endossado por ela.

<p align="center">
  Feito com 🍿 para agentes de IA do mundo todo
</p>
