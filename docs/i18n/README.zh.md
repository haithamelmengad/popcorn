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

<h4 align="center">为 <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a> 构建的视频分析系统。</h4>

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
  Popcorn 使 AI 代理能够通过提取字幕、检测场景变化和返回关键帧来观看和理解长视频。一切都在本地运行——无需外部 API，无需费用，完全隐私。
</p>

---

## 🚀 快速开始

```bash
# 安装 FFmpeg（必需）
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# 安装 Popcorn
git clone https://github.com/haithamelmengad/popcorn.git
cd popcorn && npm install && npm run build

# 可选：安装转录后端
pip install mlx-whisper                # Apple Silicon（最快）
pip install openai-whisper             # 任何平台
```

**主要特性：**

- 🎬 **场景检测** — 在视觉转换处捕获帧，而非固定间隔
- 🎤 **本地转录** — 4 种后端选项（mlx-whisper、faster-whisper、whisper-cpp、whisper）
- 🖼️ **内联图像** — 直接在 MCP 响应中返回关键帧
- 🎯 **智能预设** — 自动配置屏幕录制、演示文稿、电影、访谈
- ⚡ **零配置** — 只需传入视频路径即可
- 🔒 **隐私优先** — 一切都在本地运行，数据不会离开您的设备

---

## 🔧 MCP 工具

| 工具 | 描述 |
|------|------|
| `popcorn_analyze` | 主分析 — 提取帧、转录音频、返回结果 |
| `popcorn_suggest` | 探测视频元数据并获取推荐设置 |
| `popcorn_presets` | 列出可用的视频类型和目标 |
| `popcorn_backends` | 检测您的系统并显示转录选项 |
| `popcorn_read` | 读取带时间过滤的字幕片段 |

---

## 🎤 转录后端

| 后端 | 速度 | 最适合 | 安装 |
|------|------|--------|------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | 跨平台 | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | 最兼容 | `pip install openai-whisper` |

---

## 📄 许可证

MIT 许可证 — 详见 [LICENSE](../../LICENSE)。

---

<p align="center">
  用 🍿 为全球 AI 代理制作
</p>
