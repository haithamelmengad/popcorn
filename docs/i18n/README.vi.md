<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn cho phép Claude Code và các agent MCP khác xem một tệp video trên máy của bạn.

<!-- demo -->

Nó trả về các khung hình chính tại những chỗ chuyển cảnh và một bản chép lời có dấu thời gian.

**Cài đặt cho Claude Code**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**Hoặc cài đặt dưới dạng plugin của Claude Code.** Cách này cũng thêm skill `/popcorn:watch`. Chạy các lệnh sau bên trong Claude Code:

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Dùng thử**

Hãy hỏi bằng lời lẽ thông thường và đưa đường dẫn đầy đủ tới video:

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Hoạt động với**

| Client | Cách thiết lập |
|--------|-------|
| Claude Code | Lệnh hoặc plugin ở trên |
| Claude Desktop | Thêm server vào `claude_desktop_config.json`. Xem [Bắt đầu nhanh](#bắt-đầu-nhanh) |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | Thêm cùng mục `mcpServers` đó vào `~/.cursor/mcp.json` |

**Yêu cầu**

- [FFmpeg](https://ffmpeg.org/) có trong PATH
- Node.js 20 trở lên
- Một backend Whisper để chép lời. Không có backend thì bạn vẫn nhận được khung hình. Xem [Backend chép lời](#backend-chép-lời)

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
  <a href="#bắt-đầu-nhanh">Bắt đầu nhanh</a> •
  <a href="#cách-hoạt-động">Cách hoạt động</a> •
  <a href="#công-cụ-mcp">Công cụ MCP</a> •
  <a href="#backend-chép-lời">Chép lời</a> •
  <a href="#cấu-hình">Cấu hình</a> •
  <a href="#khắc-phục-sự-cố">Khắc phục sự cố</a> •
  <a href="#giấy-phép">Giấy phép</a>
</p>

---

## Bắt đầu nhanh

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

Với Claude Desktop, hãy thêm đoạn sau vào `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**Tính năng chính:**

- **Phát hiện cảnh**: Chụp khung hình tại các chỗ chuyển cảnh, không theo khoảng thời gian cố định
- **Chép lời trên máy**: 4 backend để chọn (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Ảnh nội tuyến**: Trả về khung hình chính ngay trong phản hồi MCP
- **Preset thông minh**: Tự cấu hình cho video quay màn hình, bài thuyết trình, phim và phỏng vấn
- **Không cần cấu hình**: Chỉ cần đưa đường dẫn video là chạy
- **Ưu tiên quyền riêng tư**: Mọi thứ chạy trên máy của bạn, không có dữ liệu nào rời khỏi máy. Mô hình Whisper chỉ được tải về một lần, ở lần dùng đầu tiên

---

## Tài liệu

### Làm quen

- **[Bắt đầu nhanh](#bắt-đầu-nhanh)**: Cài đặt và thiết lập
- **[Bài hướng dẫn](../tutorial.md)**: Cách dùng theo từng bước
- **[Công cụ MCP](#công-cụ-mcp)**: Tham khảo các công cụ hiện có

### Hướng dẫn

- **[Backend chép lời](#backend-chép-lời)**: Chọn backend tốt nhất cho hệ thống của bạn
- **[Loại video và mục tiêu](#loại-video)**: Preset cho từng loại nội dung
- **[Cấu hình](#cấu-hình)**: Tham số nâng cao

### Tham khảo

- **[Khắc phục sự cố](../troubleshooting.md)**: Các lỗi thường gặp và cách xử lý
- **[Skill cho agent](../../skills/watch/SKILL.md)**: Chỉ dẫn dành cho agent AI
- **[Tham khảo API](#công-cụ-mcp)**: Schema của công cụ và phản hồi

---

## Cách hoạt động

**Thành phần chính:**

1. **FFprobe**: Lấy siêu dữ liệu của video (thời lượng, độ phân giải, codec)
2. **Phát hiện cảnh bằng FFmpeg**: Tìm các chỗ chuyển cảnh bằng bộ lọc `select='gt(scene,N)'`
3. **Trích xuất khung hình song song**: Chụp ảnh JPEG tại các mốc thời gian chuyển cảnh
4. **Chép lời với nhiều backend**: Các biến thể Whisper chuyển âm thanh thành văn bản có dấu thời gian
5. **Gói phân tích**: Kết quả được lưu vào thư mục `.popcorn/`
6. **Phản hồi MCP**: Trả về siêu dữ liệu và ảnh base64 nội tuyến

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Công cụ MCP

| Công cụ | Mô tả |
|------|-------------|
| `popcorn_analyze` | Phân tích chính: trích xuất khung hình, chép lời âm thanh, trả về kết quả |
| `popcorn_suggest` | Đọc siêu dữ liệu của video và đề xuất thiết lập |
| `popcorn_presets` | Liệt kê các loại video và mục tiêu có sẵn |
| `popcorn_backends` | Nhận diện hệ thống của bạn và hiển thị các lựa chọn chép lời |
| `popcorn_read` | Đọc từng đoạn của bản chép lời, lọc theo thời gian |

### Cách dùng cơ bản

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Dùng với preset

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

## Loại video

| Loại | Phù hợp nhất cho | Phát hiện cảnh |
|------|----------|-----------------|
| `screencast` | Bài hướng dẫn, buổi lập trình, demo giao diện | Ngưỡng thấp |
| `presentation` | Slide, bài giảng, bài phát biểu chính | Chuyển slide |
| `movie` | Phim điện ảnh, chương trình truyền hình | Cân bằng |
| `interview` | Podcast, video người nói trước ống kính | Ưu tiên chép lời |
| `surveillance` | Video camera an ninh, camera hành trình | Ngưỡng cao |
| `sports` | Sự kiện trực tiếp, chuyển động nhanh | Tốc độ khung hình cao |

## Mục tiêu

| Mục tiêu | Dùng khi |
|-----------|----------|
| `summary` | Cần xem nhanh tổng quan |
| `detailed` | Không muốn bỏ sót gì |
| `find_moment` | Tìm một nội dung cụ thể |
| `transcribe` | Âm thanh và lời nói là quan trọng nhất |
| `visual_only` | Chỉ quan tâm đến hình ảnh |
| `quick_scan` | Cần xem trước thật nhanh |

---

## Backend chép lời

Popcorn tự nhận diện hệ thống của bạn và đề xuất backend tốt nhất.

### So sánh các backend

| Backend | Tốc độ | Phù hợp nhất cho | Cài đặt |
|---------|-------|----------|---------|
| **mlx-whisper** | Nhanh nhất | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Nhanh | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Trung bình | Đa nền tảng | `brew install whisper-cpp` |
| **whisper** | Chậm | Tương thích rộng nhất | `pip install openai-whisper` |

whisper-cpp cần một tệp mô hình. Hãy tải một mô hình ggml từ [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) rồi đặt biến môi trường `WHISPER_CPP_MODEL` thành đường dẫn của tệp, hoặc truyền đường dẫn qua `model`. Nếu không có tệp mô hình, Popcorn báo rằng backend này không dùng được.

### Thời gian xử lý (video 60 phút)

| Backend | Thời gian |
|---------|------|
| mlx-whisper | 3-8 phút |
| faster-whisper | 5-10 phút |
| whisper-cpp | 10-20 phút |
| whisper | 30-60 phút |

### Chỉ định một backend

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

## Cấu hình

### Tất cả tham số

| Tham số | Kiểu | Mô tả |
|-----------|------|-------------|
| `path` | string | **Bắt buộc.** Đường dẫn tuyệt đối tới tệp video |
| `videoType` | string | Preset loại video |
| `objective` | string | Preset mục tiêu phân tích |
| `transcribe` | boolean | Bật hoặc tắt chép lời |
| `backend` | string | Backend chép lời |
| `model` | string | Mô hình Whisper (`tiny`, `base`, `small`, `medium`, `large`). Với whisper-cpp: đường dẫn tới một tệp mô hình ggml |
| `language` | string | Mã ngôn ngữ (ví dụ `en`, `es`, `fr`) |
| `frameMode` | string | `scene` hoặc `interval` |
| `framesPerMin` | number | Số khung hình mỗi phút ở chế độ `interval` |
| `sceneThreshold` | number | Độ nhạy phát hiện cảnh (0-1) |
| `minSceneInterval` | number | Số giây tối thiểu giữa hai khung hình cảnh |
| `maxFrames` | number | Số khung hình tối đa được trích xuất |
| `inlineFrames` | number | Số khung hình trả về dưới dạng base64 |
| `maxChunkChars` | number | Kích thước mỗi đoạn của bản chép lời, tính bằng ký tự |
| `maxTranscriptChars` | number | Độ dài phần trích bản chép lời trong phản hồi |
| `outDir` | string | Thư mục đầu ra cho gói phân tích |

### Cấu trúc đầu ra

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

## Khắc phục sự cố

### Không tìm thấy FFmpeg

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Không có backend chép lời

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Phát hiện quá ít khung hình

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Phát hiện quá nhiều khung hình

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Xem **[Hướng dẫn khắc phục sự cố](../troubleshooting.md)** để biết thêm cách xử lý.

---

## Phát triển

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Cấu trúc dự án

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

## Đóng góp

1. Fork repository
2. Tạo một nhánh tính năng (`git checkout -b feature/amazing`)
3. Commit các thay đổi (`git commit -m 'Add amazing feature'`)
4. Push lên nhánh (`git push origin feature/amazing`)
5. Mở một Pull Request

---

## Giấy phép

Giấy phép MIT. Xem chi tiết trong [LICENSE](../../LICENSE).

---

## Lời cảm ơn

- [OpenAI Whisper](https://github.com/openai/whisper): Nhận dạng giọng nói
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp): Bản chuyển sang C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples): Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper): CTranslate2
- [FFmpeg](https://ffmpeg.org/): Xử lý video
- [Model Context Protocol](https://modelcontextprotocol.io/): Đặc tả MCP

---

Popcorn là một dự án độc lập. Dự án không liên kết với Anthropic và không được Anthropic bảo trợ.

<p align="center">
  Làm bằng 🍿 cho các agent AI ở khắp nơi
</p>
