<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Mit Popcorn können Claude Code und andere MCP-Agenten eine Videodatei auf deinem Rechner ansehen.

<!-- demo -->

Popcorn liefert Schlüsselbilder von den Szenenwechseln und ein Transkript mit Zeitstempeln.

**Installation für Claude Code**

```bash
claude mcp add popcorn -- npx -y claude-popcorn
```

**Oder installiere Popcorn als Plugin für Claude Code.** Damit kommt auch der Skill `/popcorn:watch` dazu. Führe diese Befehle in Claude Code aus:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Ausprobieren**

Frag in eigenen Worten und gib den vollständigen Pfad zum Video an:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Funktioniert mit**

| Client | Einrichtung |
|--------|-------|
| Claude Code | Der Befehl oder das Plugin oben |
| Claude Desktop | Trag den Server in `claude_desktop_config.json` ein. Siehe [Schnellstart](#schnellstart) |
| Codex | `codex mcp add popcorn -- npx -y claude-popcorn` |
| Cursor | Trag denselben `mcpServers`-Eintrag in `~/.cursor/mcp.json` ein |

**Voraussetzungen**

- [FFmpeg](https://ffmpeg.org/) in deinem PATH
- Node.js 20 oder neuer
- Ein Whisper-Backend für Transkripte. Ohne Backend bekommst du trotzdem die Frames. Siehe [Transkriptions-Backends](#transkriptions-backends)

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
  <a href="#schnellstart">Schnellstart</a> •
  <a href="#so-funktioniert-es">So funktioniert es</a> •
  <a href="#mcp-tools">MCP-Tools</a> •
  <a href="#transkriptions-backends">Transkription</a> •
  <a href="#konfiguration">Konfiguration</a> •
  <a href="#fehlerbehebung">Fehlerbehebung</a> •
  <a href="#lizenz">Lizenz</a>
</p>

---

## Schnellstart

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

Für Claude Desktop trägst du das in `~/Library/Application Support/Claude/claude_desktop_config.json` ein:

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

**Die wichtigsten Funktionen:**

- **Szenenerkennung**: nimmt Frames an visuellen Übergängen auf, nicht in festen Abständen
- **Lokale Transkription**: 4 Backends zur Auswahl (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Eingebettete Bilder**: liefert die Schlüsselbilder direkt in den MCP-Antworten
- **Intelligente Voreinstellungen**: stellt sich selbst auf Screencasts, Präsentationen, Filme und Interviews ein
- **Keine Konfiguration**: Videopfad übergeben, fertig
- **Datenschutz zuerst**: Alles läuft lokal, keine Daten verlassen deinen Rechner. Whisper-Modelle werden nur einmal heruntergeladen, bei der ersten Nutzung

---

## Dokumentation

### Erste Schritte

- **[Schnellstart](#schnellstart)**: Installation und Einrichtung
- **[Tutorial](../tutorial.md)**: Schritt-für-Schritt-Anleitung
- **[MCP-Tools](#mcp-tools)**: Referenz der verfügbaren Tools

### Anleitungen

- **[Transkriptions-Backends](#transkriptions-backends)**: das beste Backend für dein System wählen
- **[Videotypen und Ziele](#videotypen)**: Voreinstellungen für verschiedene Inhalte
- **[Konfiguration](#konfiguration)**: erweiterte Parameter

### Referenz

- **[Fehlerbehebung](../troubleshooting.md)**: häufige Probleme und Lösungen
- **[Agent-Skill](../../skills/watch/SKILL.md)**: Anweisungen für KI-Agenten
- **[API-Referenz](#mcp-tools)**: Schemas und Antworten der Tools

---

## So funktioniert es

**Kernkomponenten:**

1. **FFprobe**: liest die Metadaten des Videos aus (Dauer, Auflösung, Codecs)
2. **Szenenerkennung mit FFmpeg**: findet visuelle Übergänge mit dem Filter `select='gt(scene,N)'`
3. **Parallele Frame-Extraktion**: speichert JPEGs an den Zeitpunkten der Szenenwechsel
4. **Transkription mit mehreren Backends**: Whisper-Varianten wandeln Audio in Text mit Zeitstempeln um
5. **Analysepaket**: Die Ergebnisse werden im Verzeichnis `.popcorn/` gespeichert
6. **MCP-Antwort**: liefert die Metadaten und eingebettete base64-Bilder

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## MCP-Tools

| Tool | Beschreibung |
|------|-------------|
| `popcorn_analyze` | Hauptanalyse: extrahiert Frames, transkribiert das Audio und liefert die Ergebnisse |
| `popcorn_suggest` | Liest die Metadaten des Videos und empfiehlt Einstellungen |
| `popcorn_presets` | Listet die verfügbaren Videotypen und Ziele auf |
| `popcorn_backends` | Erkennt dein System und zeigt die Transkriptionsoptionen |
| `popcorn_read` | Liest Ausschnitte des Transkripts, gefiltert nach Zeit |

### Einfache Nutzung

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Mit Voreinstellungen

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

## Videotypen

| Typ | Geeignet für | Szenenerkennung |
|------|----------|-----------------|
| `screencast` | Tutorials, Coding-Sessions, UI-Demos | Niedriger Schwellenwert |
| `presentation` | Folien, Vorlesungen, Keynotes | Folienwechsel |
| `movie` | Filme, Serien | Ausgewogen |
| `interview` | Podcasts, Sprecher vor der Kamera | Transkription hat Vorrang |
| `surveillance` | Überwachungsvideos, Dashcams | Hoher Schwellenwert |
| `sports` | Live-Events, schnelle Action | Hohe Bildrate |

## Ziele

| Ziel | Wann verwenden |
|-----------|----------|
| `summary` | Du brauchst einen schnellen Überblick |
| `detailed` | Dir soll nichts entgehen |
| `find_moment` | Du suchst eine bestimmte Stelle |
| `transcribe` | Audio oder Sprache ist am wichtigsten |
| `visual_only` | Dich interessiert nur das Bild |
| `quick_scan` | Du brauchst eine schnelle Vorschau |

---

## Transkriptions-Backends

Popcorn erkennt dein System automatisch und empfiehlt das beste Backend.

### Backends im Vergleich

| Backend | Geschwindigkeit | Geeignet für | Installation |
|---------|-------|----------|---------|
| **mlx-whisper** | Am schnellsten | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Schnell | NVIDIA-GPUs | `pip install faster-whisper` |
| **whisper-cpp** | Mittel | Plattformübergreifend | `brew install whisper-cpp` |
| **whisper** | Langsam | Höchste Kompatibilität | `pip install openai-whisper` |

whisper-cpp braucht eine Modelldatei. Lade ein ggml-Modell von [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) herunter und setze die Umgebungsvariable `WHISPER_CPP_MODEL` auf den Pfad der Datei, oder übergib den Pfad als `model`. Ohne Modelldatei meldet Popcorn dieses Backend als nicht verfügbar.

### Verarbeitungszeiten (60-Minuten-Video)

| Backend | Zeit |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Ein Backend erzwingen

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

## Konfiguration

### Alle Parameter

| Parameter | Typ | Beschreibung |
|-----------|------|-------------|
| `path` | string | **Pflicht.** Absoluter Pfad zur Videodatei |
| `videoType` | string | Voreinstellung für den Videotyp |
| `objective` | string | Voreinstellung für das Analyseziel |
| `transcribe` | boolean | Schaltet die Transkription ein oder aus |
| `backend` | string | Transkriptions-Backend |
| `model` | string | Whisper-Modell (`tiny`, `base`, `small`, `medium`, `large`). Für whisper-cpp: Pfad zu einer ggml-Modelldatei |
| `language` | string | Sprachcode (z. B. `en`, `es`, `fr`) |
| `frameMode` | string | `scene` oder `interval` |
| `framesPerMin` | number | Frames pro Minute im Modus `interval` |
| `sceneThreshold` | number | Empfindlichkeit der Szenenerkennung (0-1) |
| `minSceneInterval` | number | Mindestabstand in Sekunden zwischen Szenen-Frames |
| `maxFrames` | number | Maximale Anzahl extrahierter Frames |
| `inlineFrames` | number | Anzahl der Frames, die als base64 zurückkommen |
| `maxChunkChars` | number | Größe der Transkript-Abschnitte in Zeichen |
| `maxTranscriptChars` | number | Länge des Transkript-Auszugs in der Antwort |
| `outDir` | string | Ausgabeverzeichnis für das Analysepaket |

### Aufbau der Ausgabe

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

## Fehlerbehebung

### FFmpeg nicht gefunden

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Kein Transkriptions-Backend

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Zu wenige Frames erkannt

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Zu viele Frames erkannt

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Weitere Lösungen findest du im **[Leitfaden zur Fehlerbehebung](../troubleshooting.md)**.

---

## Entwicklung

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Projektstruktur

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

## Mitwirken

1. Forke das Repository
2. Lege einen Feature-Branch an (`git checkout -b feature/amazing`)
3. Committe deine Änderungen (`git commit -m 'Add amazing feature'`)
4. Pushe den Branch (`git push origin feature/amazing`)
5. Öffne einen Pull Request

---

## Lizenz

MIT-Lizenz. Details stehen in [LICENSE](../../LICENSE).

---

## Danksagung

- [OpenAI Whisper](https://github.com/openai/whisper): Spracherkennung
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): C++-Portierung
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): Videoverarbeitung
- [Model Context Protocol](https://modelcontextprotocol.io/): MCP-Spezifikation

---

Popcorn ist ein unabhängiges Projekt. Es steht in keiner Verbindung zu Anthropic und wird von Anthropic nicht unterstützt.

<p align="center">
  Mit 🍿 gemacht für KI-Agenten überall
</p>
