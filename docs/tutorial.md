# Popcorn Tutorial

This tutorial shows how to analyze videos with AI agents using Popcorn.

## Prerequisites

1. **Node.js 18+**
2. **FFmpeg** - Install via Homebrew, apt, or [official builds](https://ffmpeg.org/download.html)
   ```bash
   # macOS
   brew install ffmpeg

   # Ubuntu
   sudo apt install ffmpeg
   ```
3. **Transcription backend** (optional, pick one)
   ```bash
   # Apple Silicon Mac (fastest)
   pip install mlx-whisper

   # Any platform (most compatible)
   pip install openai-whisper

   # macOS/Linux (fast C++ version)
   brew install whisper-cpp

   # NVIDIA GPU (fastest with GPU)
   pip install faster-whisper
   ```

## Setup

```bash
git clone https://github.com/anthropics/popcorn.git
cd popcorn
npm install
npm run build
```

## Basic Usage

### Start the MCP Server

```bash
node dist/index.js
```

### Analyze a Video (Simplest)

From your agent, call:

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

Popcorn automatically:
- Detects the video type
- Extracts frames at scene changes
- Transcribes audio (if whisper is installed)
- Returns inline images + metadata

### Analyze with Presets (Recommended)

For better results, specify what you're analyzing:

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/coding-tutorial.mp4",
    "videoType": "screencast",
    "objective": "detailed"
  }
}
```

**Video Types:** `screencast`, `presentation`, `movie`, `interview`, `surveillance`, `sports`

**Objectives:** `summary`, `detailed`, `find_moment`, `transcribe`, `visual_only`, `quick_scan`

## Advanced Workflow

### Step 1: Get Suggestions (Optional)

```json
{
  "tool": "popcorn_suggest",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

Response includes:
- Video metadata (duration, resolution, size)
- Suggested video type with confidence score
- Recommended analysis settings
- Questions to ask the user

### Step 2: Analyze

Use the suggestions to configure the analysis:

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "videoType": "screencast",
    "objective": "detailed",
    "transcribe": true
  }
}
```

### Step 3: Read Specific Sections

For long videos, read transcript slices:

```json
{
  "tool": "popcorn_read",
  "arguments": {
    "path": "/path/to/.popcorn/video_timestamp/transcript.json",
    "startSec": 600,
    "endSec": 1200,
    "maxChars": 20000
  }
}
```

## Understanding the Output

### Response Structure

```json
{
  "configUsed": {
    "videoType": "screencast",
    "objective": "detailed",
    "sceneThreshold": 0.2,
    "maxFrames": 300
  },
  "video": {
    "durationSec": 3600,
    "resolution": "1920x1080"
  },
  "transcript": {
    "available": true,
    "textExcerpt": "...",
    "segmentCount": 245
  },
  "keyframes": {
    "method": "scene",
    "count": 87,
    "frames": [...]
  },
  "inlineFrames": {
    "count": 20,
    "note": "Images included below"
  }
}
// Followed by 20 inline images as MCP image content blocks
```

### Output Files

```
.popcorn/video_2024-01-15T12-00-00/
├── analysis.json          # Complete metadata
├── transcript.txt         # Plain text
├── transcript.json        # Timestamped segments
├── transcript.chunks.json # Chunked for LLM context
└── assets/
    ├── audio.wav          # Extracted audio
    └── frames/
        ├── scene_000001.jpg
        ├── scene_000002.jpg
        └── ...
```

## Tips

### For Screencasts
- Use `videoType: "screencast"` - it lowers the scene threshold to catch subtle UI changes
- `objective: "detailed"` captures more frames

### For Long Videos
- Use `objective: "summary"` for quick overview
- Read transcript in chunks using `startSec`/`endSec`

### For Podcasts/Interviews
- Use `videoType: "interview"` - prioritizes transcription
- `objective: "transcribe"` for maximum transcript focus

### Transcription Backends

Popcorn auto-detects the best available backend:

```json
// List available backends
{
  "tool": "popcorn_backends"
}

// Force a specific backend
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "backend": "mlx-whisper"
  }
}
```

| Backend | Speed | Best For |
|---------|-------|----------|
| `mlx-whisper` | Fastest | Apple Silicon Macs |
| `faster-whisper` | Fastest | NVIDIA GPUs |
| `whisper-cpp` | Fast | Cross-platform |
| `whisper` | Medium | Most compatible |

### Without Transcription
- Popcorn works fine without any transcription backend
- Use `transcribe: false` to skip audio processing
- Focus on visual analysis with `objective: "visual_only"`

## Integration Examples

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "popcorn": {
      "command": "node",
      "args": ["/absolute/path/to/popcorn/dist/index.js"]
    }
  }
}
```

### Programmatic Usage

```javascript
import { analyzeVideo } from "./dist/analyze.js";

const result = await analyzeVideo("/path/to/video.mp4", {
  videoType: "screencast",
  objective: "detailed",
  transcribe: true,
  frameMode: "scene",
  sceneThreshold: 0.2,
  maxFrames: 200,
  inlineFrames: 20,
  maxChunkChars: 2000,
  maxTranscriptChars: 20000,
});

console.log(`Extracted ${result.keyframes.count} frames`);
console.log(`Transcript: ${result.transcript.segmentCount} segments`);
```
