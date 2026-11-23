<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn lets Claude Code and other MCP agents watch a video file on your machine.

<!-- demo -->

It returns key frames from the scene changes and a timestamped transcript.

**Install for Claude Code**

```bash
claude mcp add popcorn -- npx -y claude-popcorn
```

**Or install it as a Claude Code plugin.** This also adds the `/popcorn:watch` skill. Run these inside Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Try it**

Ask in plain words and give the full path to the video:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Works with**

| Client | Setup |
|--------|-------|
| Claude Code | The command or the plugin above |
| Claude Desktop | Add the server to `claude_desktop_config.json`. See [Quick Start](#quick-start) |
| Codex | `codex mcp add popcorn -- npx -y claude-popcorn` |
| Cursor | Add the same `mcpServers` entry to `~/.cursor/mcp.json` |

**Requirements**

- [FFmpeg](https://ffmpeg.org/) on your PATH
- Node.js 20 or newer
- One Whisper backend for transcripts. Without one you still get the frames. See [Transcription Backends](#transcription-backends)

<p align="center">
  <a href="docs/i18n/README.zh.md">🇨🇳 中文</a> •
  <a href="docs/i18n/README.ja.md">🇯🇵 日本語</a> •
  <a href="docs/i18n/README.ko.md">🇰🇷 한국어</a> •
  <a href="docs/i18n/README.es.md">🇪🇸 Español</a> •
  <a href="docs/i18n/README.de.md">🇩🇪 Deutsch</a> •
  <a href="docs/i18n/README.fr.md">🇫🇷 Français</a> •
  <a href="docs/i18n/README.pt.md">🇧🇷 Português</a> •
  <a href="docs/i18n/README.ru.md">🇷🇺 Русский</a> •
  <a href="docs/i18n/README.ar.md">🇸🇦 العربية</a> •
  <a href="docs/i18n/README.it.md">🇮🇹 Italiano</a> •
  <a href="docs/i18n/README.nl.md">🇳🇱 Nederlands</a> •
  <a href="docs/i18n/README.tr.md">🇹🇷 Türkçe</a> •
  <a href="docs/i18n/README.vi.md">🇻🇳 Tiếng Việt</a> •
  <a href="docs/i18n/README.hi.md">🇮🇳 हिन्दी</a>
</p>

<p align="center">
  <a href="#quick-start">Quick Start</a> •
  <a href="#how-it-works">How It Works</a> •
  <a href="#mcp-tools">MCP Tools</a> •
  <a href="#transcription-backends">Transcription</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#troubleshooting">Troubleshooting</a> •
  <a href="#license">License</a>
</p>

---

## Quick Start

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

For Claude Desktop, add this to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**Key Features:**

- **Scene Detection**: Captures frames at visual transitions, not fixed intervals
- **Local Transcription**: 4 backend options (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Inline Images**: Returns key frames directly in MCP responses
- **Smart Presets**: Auto-configures for screencasts, presentations, movies, interviews
- **Zero Config**: Just pass a video path and it works
- **Privacy First**: Everything runs locally, no data leaves your machine. Whisper models are downloaded once, on first use

---

## Documentation

### Getting Started

- **[Quick Start](#quick-start)**: Installation & setup
- **[Tutorial](docs/tutorial.md)**: Step-by-step usage guide
- **[MCP Tools](#mcp-tools)**: Available tools reference

### Guides

- **[Transcription Backends](#transcription-backends)**: Choose the best backend for your system
- **[Video Types & Objectives](#video-types)**: Presets for different content
- **[Configuration](#configuration)**: Advanced parameters

### Reference

- **[Troubleshooting](docs/troubleshooting.md)**: Common issues & solutions
- **[Agent Skill](skills/watch/SKILL.md)**: Instructions for AI agents
- **[API Reference](#mcp-tools)**: Tool schemas & responses

---

## How It Works

**Core Components:**

1. **FFprobe**: Extracts video metadata (duration, resolution, codecs)
2. **FFmpeg Scene Detection**: Finds visual transitions using `select='gt(scene,N)'` filter
3. **Parallel Frame Extraction**: Captures JPEGs at scene change timestamps
4. **Multi-Backend Transcription**: Whisper variants convert audio to timestamped text
5. **Analysis Bundle**: Results saved to `.popcorn/` directory
6. **MCP Response**: Returns metadata + inline base64 images

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## MCP Tools

| Tool | Description |
|------|-------------|
| `popcorn_analyze` | Main analysis: extracts frames, transcribes audio, returns results |
| `popcorn_suggest` | Probe video metadata and get recommended settings |
| `popcorn_presets` | List available video types and objectives |
| `popcorn_backends` | Detect your system and show transcription options |
| `popcorn_read` | Read transcript slices with time filtering |

### Basic Usage

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### With Presets

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

## Video Types

| Type | Best For | Scene Detection |
|------|----------|-----------------|
| `screencast` | Tutorials, coding sessions, UI demos | Low threshold |
| `presentation` | Slides, lectures, keynotes | Slide transitions |
| `movie` | Films, TV shows | Balanced |
| `interview` | Podcasts, talking heads | Transcription priority |
| `surveillance` | Security footage, dashcam | High threshold |
| `sports` | Live events, fast action | High frame rate |

## Objectives

| Objective | Use When |
|-----------|----------|
| `summary` | Quick overview needed |
| `detailed` | Don't miss anything |
| `find_moment` | Searching for specific content |
| `transcribe` | Audio/speech is most important |
| `visual_only` | Only care about visuals |
| `quick_scan` | Fast preview needed |

---

## Transcription Backends

Popcorn auto-detects your system and recommends the best backend.

### Backend Comparison

| Backend | Speed | Best For | Install |
|---------|-------|----------|---------|
| **mlx-whisper** | Fastest | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Fast | NVIDIA GPUs | `pip install faster-whisper` |
| **whisper-cpp** | Moderate | Cross-platform | `brew install whisper-cpp` |
| **whisper** | Slow | Most compatible | `pip install openai-whisper` |

whisper-cpp needs a model file. Download a ggml model from [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) and set the `WHISPER_CPP_MODEL` environment variable to its path, or pass the path as `model`. Without a model file, Popcorn reports this backend as not available.

### Processing Times (60-min video)

| Backend | Time |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Force a Backend

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

## Configuration

### All Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `path` | string | **Required.** Absolute path to video file |
| `videoType` | string | Video type preset |
| `objective` | string | Analysis objective preset |
| `transcribe` | boolean | Enable/disable transcription |
| `backend` | string | Transcription backend |
| `model` | string | Whisper model (`tiny`, `base`, `small`, `medium`, `large`). For whisper-cpp: path to a ggml model file |
| `language` | string | Language code (e.g., `en`, `es`, `fr`) |
| `frameMode` | string | `scene` or `interval` |
| `framesPerMin` | number | Frames per minute in `interval` mode |
| `sceneThreshold` | number | Scene sensitivity (0-1) |
| `minSceneInterval` | number | Minimum seconds between scene frames |
| `maxFrames` | number | Maximum frames to extract |
| `inlineFrames` | number | Frames to return as base64 |
| `maxChunkChars` | number | Transcript chunk size in characters |
| `maxTranscriptChars` | number | Length of the transcript excerpt in the response |
| `outDir` | string | Output directory for the analysis bundle |

### Output Structure

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

## Troubleshooting

### FFmpeg not found

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### No transcription backend

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Too few frames detected

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Too many frames detected

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

See **[Troubleshooting Guide](docs/troubleshooting.md)** for more solutions.

---

## Development

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Project Structure

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

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## License

MIT License: see [LICENSE](LICENSE) for details.

---

## Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper): Speech recognition
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): C++ port
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): Video processing
- [Model Context Protocol](https://modelcontextprotocol.io/): MCP spec

---

Popcorn is an independent project. It is not affiliated with or endorsed by Anthropic.

<p align="center">
  Made with 🍿 for AI agents everywhere
</p>
