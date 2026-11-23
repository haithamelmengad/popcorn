<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn 让 Claude Code 和其他 MCP 智能体观看你电脑上的视频文件。

<!-- demo -->

它返回场景切换处的关键帧和带时间戳的转录文本。

**为 Claude Code 安装**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**也可以作为 Claude Code 插件安装。** 这样还会添加 `/popcorn:watch` 技能。在 Claude Code 中运行以下命令：

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**试一试**

用平常的话提问，并给出视频的完整路径：

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**支持的客户端**

| 客户端 | 设置方法 |
|--------|-------|
| Claude Code | 上面的命令或插件 |
| Claude Desktop | 把服务器添加到 `claude_desktop_config.json`。见[快速开始](#快速开始) |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | 把同样的 `mcpServers` 条目添加到 `~/.cursor/mcp.json` |

**环境要求**

- PATH 中有 [FFmpeg](https://ffmpeg.org/)
- Node.js 20 或更高版本
- 转录需要一个 Whisper 后端。没有后端时仍然可以得到关键帧。见[转录后端](#转录后端)

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
  <a href="#快速开始">快速开始</a> •
  <a href="#工作原理">工作原理</a> •
  <a href="#mcp-工具">MCP 工具</a> •
  <a href="#转录后端">转录</a> •
  <a href="#配置">配置</a> •
  <a href="#故障排除">故障排除</a> •
  <a href="#许可证">许可证</a>
</p>

---

## 快速开始

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

如果使用 Claude Desktop，把下面的内容添加到 `~/Library/Application Support/Claude/claude_desktop_config.json`：

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

**主要功能：**

- **场景检测**：在画面切换处截取帧，而不是按固定间隔截取
- **本地转录**：4 种后端可选（mlx-whisper、faster-whisper、whisper-cpp、whisper）
- **内联图片**：直接在 MCP 响应中返回关键帧
- **智能预设**：为录屏、演示、电影和访谈自动配置
- **零配置**：只需传入视频路径就能用
- **隐私优先**：一切都在本地运行，数据不会离开你的电脑。Whisper 模型只在首次使用时下载一次

---

## 文档

### 入门

- **[快速开始](#快速开始)**：安装与设置
- **[教程](../tutorial.md)**：分步使用指南
- **[MCP 工具](#mcp-工具)**：可用工具参考

### 指南

- **[转录后端](#转录后端)**：为你的系统选择最合适的后端
- **[视频类型与目标](#视频类型)**：针对不同内容的预设
- **[配置](#配置)**：高级参数

### 参考

- **[故障排除](../troubleshooting.md)**：常见问题与解决方法
- **[智能体技能](../../skills/watch/SKILL.md)**：给 AI 智能体的说明
- **[API 参考](#mcp-工具)**：工具的 schema 与响应

---

## 工作原理

**核心组件：**

1. **FFprobe**：提取视频元数据（时长、分辨率、编解码器）
2. **FFmpeg 场景检测**：用 `select='gt(scene,N)'` 滤镜找出画面切换
3. **并行抽帧**：在场景切换的时间点截取 JPEG
4. **多后端转录**：Whisper 的各种实现把音频转成带时间戳的文本
5. **分析包**：结果保存到 `.popcorn/` 目录
6. **MCP 响应**：返回元数据和内联的 base64 图片

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## MCP 工具

| 工具 | 说明 |
|------|-------------|
| `popcorn_analyze` | 主分析工具：抽帧、转录音频并返回结果 |
| `popcorn_suggest` | 探测视频元数据并给出推荐设置 |
| `popcorn_presets` | 列出可用的视频类型和目标 |
| `popcorn_backends` | 检测你的系统并列出可用的转录方案 |
| `popcorn_read` | 按时间范围读取转录片段 |

### 基本用法

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### 使用预设

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

## 视频类型

| 类型 | 适用内容 | 场景检测 |
|------|----------|-----------------|
| `screencast` | 教程、编程过程、界面演示 | 低阈值 |
| `presentation` | 幻灯片、讲座、主题演讲 | 幻灯片切换 |
| `movie` | 电影、电视剧 | 均衡 |
| `interview` | 播客、口播视频 | 转录优先 |
| `surveillance` | 监控录像、行车记录仪 | 高阈值 |
| `sports` | 现场赛事、快速动作 | 高帧率 |

## 目标

| 目标 | 适用情况 |
|-----------|----------|
| `summary` | 需要快速了解概况 |
| `detailed` | 不想漏掉任何内容 |
| `find_moment` | 查找特定内容 |
| `transcribe` | 音频和语音最重要 |
| `visual_only` | 只关心画面 |
| `quick_scan` | 需要快速预览 |

---

## 转录后端

Popcorn 会自动检测你的系统并推荐最合适的后端。

### 后端对比

| 后端 | 速度 | 适用环境 | 安装 |
|---------|-------|----------|---------|
| **mlx-whisper** | 最快 | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | 快 | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | 中等 | 跨平台 | `brew install whisper-cpp` |
| **whisper** | 慢 | 兼容性最好 | `pip install openai-whisper` |

whisper-cpp 需要模型文件。从 [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) 下载一个 ggml 模型，把环境变量 `WHISPER_CPP_MODEL` 设为它的路径，或者用 `model` 传入路径。没有模型文件时，Popcorn 会报告这个后端不可用。

### 处理时间（60 分钟视频）

| 后端 | 时间 |
|---------|------|
| mlx-whisper | 3-8 分钟 |
| faster-whisper | 5-10 分钟 |
| whisper-cpp | 10-20 分钟 |
| whisper | 30-60 分钟 |

### 指定后端

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

## 配置

### 全部参数

| 参数 | 类型 | 说明 |
|-----------|------|-------------|
| `path` | string | **必填。** 视频文件的绝对路径 |
| `videoType` | string | 视频类型预设 |
| `objective` | string | 分析目标预设 |
| `transcribe` | boolean | 开启或关闭转录 |
| `backend` | string | 转录后端 |
| `model` | string | Whisper 模型（`tiny`、`base`、`small`、`medium`、`large`）。对于 whisper-cpp：ggml 模型文件的路径 |
| `language` | string | 语言代码（如 `en`、`es`、`fr`） |
| `frameMode` | string | `scene` 或 `interval` |
| `framesPerMin` | number | `interval` 模式下每分钟的帧数 |
| `sceneThreshold` | number | 场景检测灵敏度（0-1） |
| `minSceneInterval` | number | 两个场景帧之间的最小间隔（秒） |
| `maxFrames` | number | 最多提取的帧数 |
| `inlineFrames` | number | 以 base64 返回的帧数 |
| `maxChunkChars` | number | 转录分块的大小（字符数） |
| `maxTranscriptChars` | number | 响应中转录摘录的长度 |
| `outDir` | string | 分析包的输出目录 |

### 输出结构

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

## 故障排除

### 找不到 FFmpeg

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### 没有转录后端

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### 检测到的帧太少

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### 检测到的帧太多

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

更多解决方法见 **[故障排除指南](../troubleshooting.md)**。

---

## 开发

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### 项目结构

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

## 贡献

1. Fork 本仓库
2. 创建功能分支（`git checkout -b feature/amazing`）
3. 提交更改（`git commit -m 'Add amazing feature'`）
4. 推送到分支（`git push origin feature/amazing`）
5. 发起 Pull Request

---

## 许可证

MIT 许可证。详见 [LICENSE](../../LICENSE)。

---

## 致谢

- [OpenAI Whisper](https://github.com/openai/whisper)：语音识别
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp)：C++ 移植版
- [MLX Whisper](https://github.com/ml-explore/mlx-examples)：Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper)：CTranslate2
- [FFmpeg](https://ffmpeg.org/)：视频处理
- [Model Context Protocol](https://modelcontextprotocol.io/)：MCP 规范

---

Popcorn 是一个独立项目，与 Anthropic 没有关联，也未获得 Anthropic 的认可。

<p align="center">
  用 🍿 为各地的 AI 智能体制作
</p>
