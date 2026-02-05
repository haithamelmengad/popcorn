# Popcorn Video Analysis Skill

Use this skill when asked to watch, review, summarize, or analyze videos. Popcorn extracts transcripts and key frames so you can understand video content without watching in real-time.

## When to Use

- User asks to "watch", "review", or "summarize" a video
- User provides a video file path and wants insights
- User wants to find a specific moment in a video
- User needs a transcript of video content

## Available Tools

| Tool | Purpose |
|------|---------|
| `popcorn_analyze` | Main analysis - extracts frames + transcript |
| `popcorn_suggest` | Get video metadata and recommended settings |
| `popcorn_presets` | List available video types and objectives |
| `popcorn_backends` | List available transcription backends |
| `popcorn_read` | Read transcript slices or analysis files |

## Quick Start Workflow

### Simple (Just Works)

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### With Context (Better Results)

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "videoType": "screencast",
    "objective": "summary"
  }
}
```

## Video Types

Choose based on content:

| Type | When to Use |
|------|-------------|
| `screencast` | Coding tutorials, software demos, UI recordings |
| `presentation` | Slides, lectures, keynotes, talks |
| `movie` | Films, TV episodes, cinematic content |
| `interview` | Podcasts, conversations, talking heads |
| `surveillance` | Security footage, dashcam, static cameras |
| `sports` | Games, matches, live action events |

## Objectives

Choose based on what user wants:

| Objective | When to Use |
|-----------|-------------|
| `summary` | "Give me an overview" / "What's this about?" |
| `detailed` | "Don't miss anything" / "Thorough analysis" |
| `find_moment` | "Find where they talk about X" |
| `transcribe` | "Get me the transcript" / "What did they say?" |
| `visual_only` | "Just show me what's on screen" |
| `quick_scan` | "Just a quick look" / Limited time |

## Advanced Workflow

### Step 1: Understand the Video (Optional)

```json
{
  "tool": "popcorn_suggest",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

This returns:
- Duration, resolution, file size
- Suggested video type with confidence
- Questions you can ask the user

### Step 2: Ask User (Optional)

Based on `popcorn_suggest` response, you may ask:
- "This looks like a screencast. Is that right?"
- "Do you want a quick summary or detailed analysis?"

### Step 3: Analyze

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

### Step 4: Use Results

The response includes:
- **Inline images** - Key frames as base64 (view directly)
- **Transcript excerpt** - First portion of transcription
- **Frame paths** - All extracted frames with timestamps
- **Analysis bundle path** - For reading more data

### Step 5: Read More (If Needed)

For long videos, read transcript sections:

```json
{
  "tool": "popcorn_read",
  "arguments": {
    "path": "/path/to/.popcorn/video/transcript.json",
    "startSec": 1800,
    "endSec": 2400
  }
}
```

## Response Format

```json
{
  "configUsed": { "videoType": "screencast", "objective": "detailed" },
  "video": { "durationSec": 5400, "resolution": "1920x1080" },
  "transcript": {
    "available": true,
    "textExcerpt": "Welcome to this tutorial...",
    "segmentCount": 312
  },
  "keyframes": {
    "method": "scene",
    "count": 47,
    "frames": [
      { "path": "/path/to/frame.jpg", "timeSec": 0 },
      { "path": "/path/to/frame.jpg", "timeSec": 23.5 }
    ]
  },
  "inlineFrames": { "count": 15, "note": "Images below" }
}
// Followed by 15 inline images
```

## Best Practices

1. **Start simple** - Just pass the path. Presets are optional.

2. **Use videoType when known** - If user says "coding tutorial", use `screencast`.

3. **Match objective to intent**:
   - "Summarize this" → `summary`
   - "What exactly happens?" → `detailed`
   - "Find the part about X" → `find_moment`

4. **Handle missing transcription gracefully**:
   - Check `transcript.available` in response
   - If false, focus on visual analysis
   - Mention to user that audio wasn't transcribed

5. **Cite timestamps** - When referencing content, include timestamps for user reference.

6. **For very long videos** (2+ hours):
   - Use `objective: "summary"` first
   - Then use `popcorn_read` to dive into specific sections

## Transcription Backends

Multiple backends are supported. Use `popcorn_backends` to see what's available:

| Backend | Speed | Notes |
|---------|-------|-------|
| `mlx-whisper` | Fastest | Apple Silicon only |
| `faster-whisper` | Fastest | NVIDIA GPUs |
| `whisper-cpp` | Fast | Cross-platform |
| `whisper` | Medium | Most compatible |

To force a specific backend:
```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4",
    "backend": "whisper-cpp"
  }
}
```

## Error Handling

- **No transcription backend**: Transcription skipped, visual analysis still works
- **No ffmpeg**: Tool will fail - user needs to install ffmpeg
- **File not found**: Check path is absolute and file exists
- **Large files**: May take several minutes - set expectations

## Example Prompts and Responses

**User**: "Watch this video and tell me what it's about"
**Action**: `popcorn_analyze` with `objective: "summary"`

**User**: "This is a React tutorial, analyze it thoroughly"
**Action**: `popcorn_analyze` with `videoType: "screencast"`, `objective: "detailed"`

**User**: "Find where they discuss the database schema"
**Action**: `popcorn_analyze` with `objective: "find_moment"`, then search transcript

**User**: "Just give me the transcript"
**Action**: `popcorn_analyze` with `objective: "transcribe"`
