<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn은 Claude Code와 다른 MCP 에이전트가 내 컴퓨터에 있는 동영상 파일을 볼 수 있게 해 줍니다.

<!-- demo -->

장면이 바뀌는 지점의 키 프레임과 타임스탬프가 붙은 전사 텍스트를 돌려줍니다.

**Claude Code에 설치**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**Claude Code 플러그인으로 설치할 수도 있습니다.** 이렇게 하면 `/popcorn:watch` 스킬도 추가됩니다. Claude Code 안에서 다음을 실행하세요.

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**사용해 보기**

평소 쓰는 말로 요청하고 동영상의 전체 경로를 알려 주세요.

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**지원 클라이언트**

| 클라이언트 | 설정 방법 |
|--------|-------|
| Claude Code | 위의 명령 또는 플러그인 |
| Claude Desktop | `claude_desktop_config.json`에 서버를 추가합니다. [빠른 시작](#빠른-시작) 참고 |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | 같은 `mcpServers` 항목을 `~/.cursor/mcp.json`에 추가합니다 |

**요구 사항**

- PATH에 등록된 [FFmpeg](https://ffmpeg.org/)
- Node.js 20 이상
- 전사에 쓸 Whisper 백엔드 하나. 없어도 프레임은 받을 수 있습니다. [전사 백엔드](#전사-백엔드) 참고

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
  <a href="#빠른-시작">빠른 시작</a> •
  <a href="#작동-방식">작동 방식</a> •
  <a href="#mcp-도구">MCP 도구</a> •
  <a href="#전사-백엔드">전사</a> •
  <a href="#설정">설정</a> •
  <a href="#문제-해결">문제 해결</a> •
  <a href="#라이선스">라이선스</a>
</p>

---

## 빠른 시작

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

Claude Desktop에서는 `~/Library/Application Support/Claude/claude_desktop_config.json`에 다음을 추가하세요.

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

**주요 기능:**

- **장면 감지**: 일정한 간격이 아니라 화면이 바뀌는 지점에서 프레임을 캡처합니다
- **로컬 전사**: 백엔드 4종 중에서 선택 (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **인라인 이미지**: 키 프레임을 MCP 응답에 바로 담아 돌려줍니다
- **스마트 프리셋**: 스크린캐스트, 프레젠테이션, 영화, 인터뷰에 맞게 자동으로 설정합니다
- **설정 불필요**: 동영상 경로만 넘기면 바로 동작합니다
- **프라이버시 우선**: 모든 작업이 로컬에서 실행되고 데이터가 컴퓨터 밖으로 나가지 않습니다. Whisper 모델은 처음 사용할 때 한 번만 다운로드됩니다

---

## 문서

### 시작하기

- **[빠른 시작](#빠른-시작)**: 설치와 설정
- **[튜토리얼](../tutorial.md)**: 단계별 사용 안내
- **[MCP 도구](#mcp-도구)**: 사용할 수 있는 도구 안내

### 가이드

- **[전사 백엔드](#전사-백엔드)**: 내 시스템에 가장 잘 맞는 백엔드 고르기
- **[동영상 유형과 목표](#동영상-유형)**: 콘텐츠별 프리셋
- **[설정](#설정)**: 고급 매개변수

### 참고 자료

- **[문제 해결](../troubleshooting.md)**: 자주 생기는 문제와 해결 방법
- **[에이전트 스킬](../../skills/watch/SKILL.md)**: AI 에이전트를 위한 지침
- **[API 레퍼런스](#mcp-도구)**: 도구 스키마와 응답

---

## 작동 방식

**핵심 구성 요소:**

1. **FFprobe**: 동영상 메타데이터(길이, 해상도, 코덱)를 추출합니다
2. **FFmpeg 장면 감지**: `select='gt(scene,N)'` 필터로 화면 전환을 찾습니다
3. **병렬 프레임 추출**: 장면이 바뀌는 시점의 JPEG를 캡처합니다
4. **다중 백엔드 전사**: 여러 Whisper 구현이 오디오를 타임스탬프가 붙은 텍스트로 바꿉니다
5. **분석 번들**: 결과를 `.popcorn/` 디렉터리에 저장합니다
6. **MCP 응답**: 메타데이터와 인라인 base64 이미지를 돌려줍니다

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## MCP 도구

| 도구 | 설명 |
|------|-------------|
| `popcorn_analyze` | 기본 분석 도구. 프레임을 추출하고 오디오를 전사한 뒤 결과를 돌려줍니다 |
| `popcorn_suggest` | 동영상 메타데이터를 확인하고 권장 설정을 알려 줍니다 |
| `popcorn_presets` | 사용할 수 있는 동영상 유형과 목표를 나열합니다 |
| `popcorn_backends` | 시스템을 감지하고 사용할 수 있는 전사 옵션을 보여 줍니다 |
| `popcorn_read` | 시간 범위를 지정해 전사 텍스트의 일부를 읽습니다 |

### 기본 사용법

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### 프리셋 사용

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

## 동영상 유형

| 유형 | 적합한 콘텐츠 | 장면 감지 |
|------|----------|-----------------|
| `screencast` | 튜토리얼, 코딩 세션, UI 데모 | 낮은 임계값 |
| `presentation` | 슬라이드, 강의, 기조연설 | 슬라이드 전환 |
| `movie` | 영화, TV 프로그램 | 균형 |
| `interview` | 팟캐스트, 대담 영상 | 전사 우선 |
| `surveillance` | 보안 카메라 영상, 블랙박스 | 높은 임계값 |
| `sports` | 실시간 경기, 빠른 움직임 | 높은 프레임 레이트 |

## 목표

| 목표 | 사용할 때 |
|-----------|----------|
| `summary` | 빠르게 개요만 필요할 때 |
| `detailed` | 아무것도 놓치고 싶지 않을 때 |
| `find_moment` | 특정 내용을 찾을 때 |
| `transcribe` | 오디오와 말소리가 가장 중요할 때 |
| `visual_only` | 화면만 보면 될 때 |
| `quick_scan` | 빠른 미리 보기가 필요할 때 |

---

## 전사 백엔드

Popcorn은 시스템을 자동으로 감지하고 가장 알맞은 백엔드를 추천합니다.

### 백엔드 비교

| 백엔드 | 속도 | 적합한 환경 | 설치 |
|---------|-------|----------|---------|
| **mlx-whisper** | 가장 빠름 | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | 빠름 | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | 보통 | 크로스 플랫폼 | `brew install whisper-cpp` |
| **whisper** | 느림 | 호환성이 가장 좋음 | `pip install openai-whisper` |

whisper-cpp에는 모델 파일이 필요합니다. [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models)에서 ggml 모델을 내려받고 `WHISPER_CPP_MODEL` 환경 변수에 그 경로를 지정하거나, `model`에 경로를 넘기세요. 모델 파일이 없으면 Popcorn은 이 백엔드를 사용할 수 없다고 알려 줍니다.

### 처리 시간 (60분 동영상)

| 백엔드 | 시간 |
|---------|------|
| mlx-whisper | 3-8분 |
| faster-whisper | 5-10분 |
| whisper-cpp | 10-20분 |
| whisper | 30-60분 |

### 백엔드 지정하기

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

## 설정

### 전체 매개변수

| 매개변수 | 타입 | 설명 |
|-----------|------|-------------|
| `path` | string | **필수.** 동영상 파일의 절대 경로 |
| `videoType` | string | 동영상 유형 프리셋 |
| `objective` | string | 분석 목표 프리셋 |
| `transcribe` | boolean | 전사 켜기 또는 끄기 |
| `backend` | string | 전사 백엔드 |
| `model` | string | Whisper 모델 (`tiny`, `base`, `small`, `medium`, `large`). whisper-cpp의 경우 ggml 모델 파일의 경로 |
| `language` | string | 언어 코드 (예: `en`, `es`, `fr`) |
| `frameMode` | string | `scene` 또는 `interval` |
| `framesPerMin` | number | `interval` 모드에서 분당 프레임 수 |
| `sceneThreshold` | number | 장면 감지 민감도 (0-1) |
| `minSceneInterval` | number | 장면 프레임 사이의 최소 간격(초) |
| `maxFrames` | number | 추출할 최대 프레임 수 |
| `inlineFrames` | number | base64로 돌려줄 프레임 수 |
| `maxChunkChars` | number | 전사 청크 크기(문자 수) |
| `maxTranscriptChars` | number | 응답에 담기는 전사 발췌문의 길이 |
| `outDir` | string | 분석 번들을 저장할 출력 디렉터리 |

### 출력 구조

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

## 문제 해결

### FFmpeg를 찾을 수 없음

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### 전사 백엔드가 없음

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### 감지된 프레임이 너무 적음

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### 감지된 프레임이 너무 많음

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

더 많은 해결 방법은 **[문제 해결 가이드](../troubleshooting.md)** 문서를 참고하세요.

---

## 개발

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### 프로젝트 구조

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

## 기여하기

1. 저장소를 포크합니다
2. 기능 브랜치를 만듭니다 (`git checkout -b feature/amazing`)
3. 변경 사항을 커밋합니다 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing`)
5. Pull Request를 엽니다

---

## 라이선스

MIT 라이선스. 자세한 내용은 [LICENSE](../../LICENSE)를 참고하세요.

---

## 감사의 말

- [OpenAI Whisper](https://github.com/openai/whisper): 음성 인식
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): C++ 포팅
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): 동영상 처리
- [Model Context Protocol](https://modelcontextprotocol.io/): MCP 사양

---

Popcorn은 독립 프로젝트입니다. Anthropic과 제휴 관계가 없으며 Anthropic의 보증을 받지 않았습니다.

<p align="center">
  전 세계 AI 에이전트를 위해 🍿을 담아 만들었습니다
</p>
