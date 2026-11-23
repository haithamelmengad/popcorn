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

<h4 align="center"><a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>를 위한 비디오 분석 시스템.</h4>

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
  Popcorn은 AI 에이전트가 자막 추출, 장면 전환 감지, 키프레임 반환을 통해 장시간 비디오를 시청하고 이해할 수 있게 합니다. 모든 것이 로컬에서 실행됩니다—외부 API 없음, 비용 없음, 완벽한 프라이버시.
</p>

---

## 🚀 빠른 시작

```bash
# FFmpeg 설치 (필수)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcorn 설치
git clone https://github.com/haithamelmengad/popcorn.git
cd popcorn && npm install && npm run build

# 선택사항: 음성 인식 백엔드 설치
pip install mlx-whisper                # Apple Silicon (가장 빠름)
pip install openai-whisper             # 모든 플랫폼
```

**주요 기능:**

- 🎬 **장면 감지** — 고정 간격이 아닌 시각적 전환에서 프레임 캡처
- 🎤 **로컬 음성 인식** — 4가지 백엔드 옵션
- 🖼️ **인라인 이미지** — MCP 응답에서 직접 키프레임 반환
- 🎯 **스마트 프리셋** — 화면 녹화, 프레젠테이션, 영화, 인터뷰용 자동 구성
- ⚡ **제로 설정** — 비디오 경로만 전달하면 작동
- 🔒 **프라이버시 우선** — 모든 것이 로컬에서 실행되며 데이터가 외부로 나가지 않음

---

## 🎤 음성 인식 백엔드

| 백엔드 | 속도 | 최적 대상 | 설치 |
|--------|------|----------|------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | 크로스 플랫폼 | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | 가장 호환성 높음 | `pip install openai-whisper` |

---

## 📄 라이선스

MIT 라이선스 — 자세한 내용은 [LICENSE](../../LICENSE) 참조.

---

<p align="center">
  전 세계 AI 에이전트를 위해 🍿로 제작됨
</p>
