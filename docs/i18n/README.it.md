<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn permette a Claude Code e ad altri agenti MCP di guardare un file video sul tuo computer.

<!-- demo -->

Restituisce i fotogrammi chiave dei cambi di scena e una trascrizione con timestamp.

**Installazione per Claude Code**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**Oppure installalo come plugin di Claude Code.** Così aggiungi anche la skill `/popcorn:watch`. Esegui questi comandi dentro Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Provalo**

Chiedi con parole tue e indica il percorso completo del video:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Funziona con**

| Client | Configurazione |
|--------|-------|
| Claude Code | Il comando o il plugin qui sopra |
| Claude Desktop | Aggiungi il server a `claude_desktop_config.json`. Vedi [Avvio rapido](#avvio-rapido) |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | Aggiungi la stessa voce `mcpServers` a `~/.cursor/mcp.json` |

**Requisiti**

- [FFmpeg](https://ffmpeg.org/) nel tuo PATH
- Node.js 20 o successivo
- Un backend Whisper per le trascrizioni. Senza backend ricevi comunque i fotogrammi. Vedi [Backend di trascrizione](#backend-di-trascrizione)

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
  <a href="#avvio-rapido">Avvio rapido</a> •
  <a href="#come-funziona">Come funziona</a> •
  <a href="#strumenti-mcp">Strumenti MCP</a> •
  <a href="#backend-di-trascrizione">Trascrizione</a> •
  <a href="#configurazione">Configurazione</a> •
  <a href="#risoluzione-dei-problemi">Risoluzione dei problemi</a> •
  <a href="#licenza">Licenza</a>
</p>

---

## Avvio rapido

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

Per Claude Desktop, aggiungi questo a `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**Funzionalità principali:**

- **Rilevamento delle scene**: cattura i fotogrammi nelle transizioni visive, non a intervalli fissi
- **Trascrizione locale**: 4 backend disponibili (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Immagini incorporate**: restituisce i fotogrammi chiave direttamente nelle risposte MCP
- **Preset intelligenti**: si configura da solo per screencast, presentazioni, film e interviste
- **Nessuna configurazione**: passa il percorso di un video e funziona
- **Privacy prima di tutto**: tutto gira in locale e nessun dato lascia il tuo computer. I modelli Whisper vengono scaricati una sola volta, al primo utilizzo

---

## Documentazione

### Per iniziare

- **[Avvio rapido](#avvio-rapido)**: installazione e configurazione
- **[Tutorial](../tutorial.md)**: guida all'uso passo per passo
- **[Strumenti MCP](#strumenti-mcp)**: riferimento degli strumenti disponibili

### Guide

- **[Backend di trascrizione](#backend-di-trascrizione)**: scegli il backend migliore per il tuo sistema
- **[Tipi di video e obiettivi](#tipi-di-video)**: preset per ogni tipo di contenuto
- **[Configurazione](#configurazione)**: parametri avanzati

### Riferimento

- **[Risoluzione dei problemi](../troubleshooting.md)**: problemi comuni e soluzioni
- **[Skill per agenti](../../skills/watch/SKILL.md)**: istruzioni per gli agenti IA
- **[Riferimento API](#strumenti-mcp)**: schemi e risposte degli strumenti

---

## Come funziona

**Componenti principali:**

1. **FFprobe**: estrae i metadati del video (durata, risoluzione, codec)
2. **Rilevamento delle scene con FFmpeg**: trova le transizioni visive con il filtro `select='gt(scene,N)'`
3. **Estrazione dei fotogrammi in parallelo**: cattura immagini JPEG negli istanti di cambio scena
4. **Trascrizione con più backend**: le varianti di Whisper convertono l'audio in testo con timestamp
5. **Pacchetto di analisi**: i risultati vengono salvati nella directory `.popcorn/`
6. **Risposta MCP**: restituisce i metadati e le immagini incorporate in base64

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Strumenti MCP

| Strumento | Descrizione |
|------|-------------|
| `popcorn_analyze` | Analisi principale: estrae i fotogrammi, trascrive l'audio e restituisce i risultati |
| `popcorn_suggest` | Legge i metadati del video e consiglia le impostazioni |
| `popcorn_presets` | Elenca i tipi di video e gli obiettivi disponibili |
| `popcorn_backends` | Rileva il tuo sistema e mostra le opzioni di trascrizione |
| `popcorn_read` | Legge parti della trascrizione filtrate per tempo |

### Uso di base

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Con i preset

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

## Tipi di video

| Tipo | Ideale per | Rilevamento delle scene |
|------|----------|-----------------|
| `screencast` | Tutorial, sessioni di programmazione, demo di interfacce | Soglia bassa |
| `presentation` | Slide, lezioni, keynote | Cambi di slide |
| `movie` | Film, serie TV | Bilanciato |
| `interview` | Podcast, persone che parlano in camera | Priorità alla trascrizione |
| `surveillance` | Videosorveglianza, dashcam | Soglia alta |
| `sports` | Eventi dal vivo, azione veloce | Frequenza dei fotogrammi alta |

## Obiettivi

| Obiettivo | Quando usarlo |
|-----------|----------|
| `summary` | Ti serve una panoramica veloce |
| `detailed` | Non vuoi perderti nulla |
| `find_moment` | Cerchi un contenuto preciso |
| `transcribe` | Conta soprattutto l'audio o il parlato |
| `visual_only` | Ti interessano solo le immagini |
| `quick_scan` | Ti serve un'anteprima veloce |

---

## Backend di trascrizione

Popcorn rileva il tuo sistema in automatico e consiglia il backend migliore.

### Confronto tra i backend

| Backend | Velocità | Ideale per | Installazione |
|---------|-------|----------|---------|
| **mlx-whisper** | Il più veloce | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Veloce | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Medio | Multipiattaforma | `brew install whisper-cpp` |
| **whisper** | Lento | Il più compatibile | `pip install openai-whisper` |

whisper-cpp ha bisogno di un file di modello. Scarica un modello ggml da [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) e imposta la variabile d'ambiente `WHISPER_CPP_MODEL` sul suo percorso, oppure passa il percorso in `model`. Senza un file di modello, Popcorn segnala questo backend come non disponibile.

### Tempi di elaborazione (video di 60 min)

| Backend | Tempo |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Forzare un backend

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

## Configurazione

### Tutti i parametri

| Parametro | Tipo | Descrizione |
|-----------|------|-------------|
| `path` | string | **Obbligatorio.** Percorso assoluto del file video |
| `videoType` | string | Preset del tipo di video |
| `objective` | string | Preset dell'obiettivo di analisi |
| `transcribe` | boolean | Attiva o disattiva la trascrizione |
| `backend` | string | Backend di trascrizione |
| `model` | string | Modello Whisper (`tiny`, `base`, `small`, `medium`, `large`). Per whisper-cpp: percorso di un file di modello ggml |
| `language` | string | Codice della lingua (ad esempio `en`, `es`, `fr`) |
| `frameMode` | string | `scene` o `interval` |
| `framesPerMin` | number | Fotogrammi al minuto in modalità `interval` |
| `sceneThreshold` | number | Sensibilità del rilevamento delle scene (0-1) |
| `minSceneInterval` | number | Secondi minimi tra due fotogrammi di scena |
| `maxFrames` | number | Numero massimo di fotogrammi da estrarre |
| `inlineFrames` | number | Fotogrammi restituiti in base64 |
| `maxChunkChars` | number | Dimensione dei blocchi di trascrizione, in caratteri |
| `maxTranscriptChars` | number | Lunghezza dell'estratto di trascrizione nella risposta |
| `outDir` | string | Directory di output del pacchetto di analisi |

### Struttura dell'output

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

## Risoluzione dei problemi

### FFmpeg non trovato

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Nessun backend di trascrizione

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Troppo pochi fotogrammi rilevati

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Troppi fotogrammi rilevati

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Vedi la **[guida alla risoluzione dei problemi](../troubleshooting.md)** per altre soluzioni.

---

## Sviluppo

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Struttura del progetto

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

## Come contribuire

1. Fai un fork del repository
2. Crea un branch per la tua modifica (`git checkout -b feature/amazing`)
3. Fai il commit delle modifiche (`git commit -m 'Add amazing feature'`)
4. Fai il push del branch (`git push origin feature/amazing`)
5. Apri una Pull Request

---

## Licenza

Licenza MIT. Vedi [LICENSE](../../LICENSE) per i dettagli.

---

## Ringraziamenti

- [OpenAI Whisper](https://github.com/openai/whisper): riconoscimento vocale
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): porting in C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): elaborazione video
- [Model Context Protocol](https://modelcontextprotocol.io/): specifica MCP

---

Popcorn è un progetto indipendente. Non è affiliato ad Anthropic né approvato da Anthropic.

<p align="center">
  Fatto con 🍿 per gli agenti IA di tutto il mondo
</p>
