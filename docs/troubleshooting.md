# Troubleshooting

## Installation Issues

### `ffmpeg` or `ffprobe` not found

Popcorn requires FFmpeg for video processing. Install it:

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt install ffmpeg

# Windows (with Chocolatey)
choco install ffmpeg
```

Verify installation:
```bash
ffmpeg -version
ffprobe -version
```

### TypeScript build errors

Make sure you have the latest dependencies:
```bash
rm -rf node_modules
npm install
npm run build
```

## Transcription Issues

### "No transcription backend available"

Transcription is optional. Install one of these backends:

```bash
# Apple Silicon Mac (fastest)
pip install mlx-whisper

# Any platform (most compatible)
pip install openai-whisper

# macOS (fast C++ version)
brew install whisper-cpp

# NVIDIA GPU (fastest on GPU)
pip install faster-whisper
```

On macOS 13+, the `macos-native` backend works without any install (uses built-in speech recognition).

Use `popcorn_backends` tool to see what's available on your system.

### Transcription is slow

Whisper can be slow on CPU. Options:
1. Use a smaller model: `"model": "tiny"` or `"model": "base"`
2. Skip transcription: `"transcribe": false`
3. Use `whisper-cpp` for faster CPU inference

### Transcription quality is poor

Try a larger model:
- `"model": "small"` - Better accuracy, still reasonable speed
- `"model": "medium"` - High accuracy
- `"model": "large"` - Best accuracy, but slow

Specify the language if known:
```json
{ "language": "en" }
```

## Frame Extraction Issues

### Scene detection finds too few frames

Lower the scene threshold:
```json
{
  "sceneThreshold": 0.15,
  "minSceneInterval": 2
}
```

Or use the `screencast` preset which has lower thresholds by default.

### Scene detection finds too many frames

Raise the threshold:
```json
{
  "sceneThreshold": 0.5,
  "minSceneInterval": 10
}
```

### Frame extraction is slow

Scene detection analyzes the entire video. For faster results:
1. Use `"frameMode": "interval"` instead of scene detection
2. Lower `maxFrames` to limit extraction
3. Increase `minSceneInterval` to reduce frames

## Output Issues

### Analysis bundle not created

Check:
1. The video path is absolute, not relative
2. You have write permissions in the current directory
3. There's enough disk space

### Large transcript responses

For long videos, transcripts can be huge. Options:
1. Use `"maxTranscriptChars": 5000` to limit excerpt size
2. Use `popcorn_read` with `startSec`/`endSec` to read sections
3. Use `objective: "summary"` for shorter outputs

### Inline images not appearing

Check that `inlineFrames` > 0 (default is 10-15 depending on preset).

Some MCP clients may not render inline images. The images are also saved to disk in the `assets/frames/` directory.

## Performance

### Video analysis takes forever

For very long videos (2+ hours):
1. Use `"objective": "quick_scan"` for fastest results
2. Set `"maxFrames": 50` to limit extraction
3. Use `"transcribe": false` to skip audio processing

### Out of memory

Large videos can use significant memory. Try:
1. Use `"model": "tiny"` for transcription
2. Reduce `maxFrames`
3. Process shorter video segments

## Permission Errors

### Can't read video file

Ensure:
1. Path is absolute (`/full/path/to/video.mp4`)
2. File exists and is readable
3. File is a valid video format (MP4, MOV, AVI, MKV, etc.)

### Can't write output

The output directory defaults to `.popcorn/` in the current working directory. Either:
1. Ensure write permissions in current directory
2. Specify a custom output: `"outDir": "/path/to/output"`

## MCP Integration

### Tools not showing up

1. Verify server is running: `node dist/index.js`
2. Check your MCP client config points to the correct path
3. Restart your MCP client after config changes

### Claude Desktop not finding popcorn

Check `~/Library/Application Support/Claude/claude_desktop_config.json`:
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

The path must be absolute, not relative.

## Still Having Issues?

1. Check the GitHub issues: [github.com/anthropics/popcorn/issues](https://github.com/anthropics/popcorn/issues)
2. Run with debug output: Check console for error messages
3. Open an issue with:
   - Your OS and Node.js version
   - The exact error message
   - Steps to reproduce
