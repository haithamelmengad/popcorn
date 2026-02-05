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

<h4 align="center"><a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a> のためのビデオ分析システム。</h4>

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
  Popcornは、AIエージェントがトランスクリプトの抽出、シーン変化の検出、キーフレームの返却を通じて長時間動画を視聴・理解できるようにします。すべてローカルで実行され、外部API不要、料金不要、完全なプライバシー。
</p>

---

## 🚀 クイックスタート

```bash
# FFmpegをインストール（必須）
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcornをインストール
git clone https://github.com/anthropics/popcorn.git
cd popcorn && npm install && npm run build

# オプション：文字起こしバックエンドをインストール
pip install mlx-whisper                # Apple Silicon（最速）
pip install openai-whisper             # 全プラットフォーム
```

**主な機能：**

- 🎬 **シーン検出** — 固定間隔ではなく、視覚的な遷移でフレームをキャプチャ
- 🎤 **ローカル文字起こし** — 4つのバックエンドオプション
- 🖼️ **インライン画像** — MCP応答で直接キーフレームを返却
- 🎯 **スマートプリセット** — スクリーンキャスト、プレゼンテーション、映画、インタビュー用に自動設定
- ⚡ **ゼロ設定** — ビデオパスを渡すだけで動作
- 🔒 **プライバシー優先** — すべてローカルで実行、データは外部に送信されません

---

## 🎤 文字起こしバックエンド

| バックエンド | 速度 | 最適な用途 | インストール |
|-------------|------|-----------|--------------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | クロスプラットフォーム | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | 最も互換性が高い | `pip install openai-whisper` |

---

## 📄 ライセンス

MITライセンス — 詳細は [LICENSE](../../LICENSE) を参照。

---

<p align="center">
  世界中のAIエージェントのために 🍿 で作られました
</p>
