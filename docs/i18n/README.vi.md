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

<h4 align="center">Hệ thống phân tích video được xây dựng cho <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

<p align="center">
  <a href="../../LICENSE">
    <img src="https://img.shields.io/badge/License-MIT-blue.svg" alt="License">
  </a>
  <a href="../../package.json">
    <img src="https://img.shields.io/badge/version-0.5.0-green.svg" alt="Version">
  </a>
  <a href="https://modelcontextprotocol.io">
    <img src="https://img.shields.io/badge/MCP-Compatible-purple.svg" alt="MCP Compatible">
  </a>
</p>

<p align="center">
  Popcorn cho phép các tác nhân AI xem và hiểu video dài bằng cách trích xuất bản ghi, phát hiện thay đổi cảnh và trả về khung hình chính. Tất cả chạy cục bộ—không API bên ngoài, không phí, bảo mật hoàn toàn.
</p>

---

## 🚀 Bắt Đầu Nhanh

```bash
# Cài đặt FFmpeg (bắt buộc)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Cài đặt Popcorn
git clone https://github.com/haithamelmengad/popcorn.git
cd popcorn && npm install && npm run build

# Tùy chọn: Cài đặt backend phiên âm
pip install mlx-whisper                # Apple Silicon (nhanh nhất)
pip install openai-whisper             # Mọi nền tảng
```

**Tính Năng Chính:**

- 🎬 **Phát Hiện Cảnh** — Chụp khung hình tại các chuyển đổi hình ảnh, không theo khoảng cố định
- 🎤 **Phiên Âm Cục Bộ** — 4 tùy chọn backend
- 🖼️ **Hình Ảnh Nội Tuyến** — Trả về khung hình chính trực tiếp trong phản hồi MCP
- 🎯 **Cài Đặt Thông Minh** — Tự động cấu hình cho screencast, thuyết trình, phim, phỏng vấn
- ⚡ **Không Cần Cấu Hình** — Chỉ cần truyền đường dẫn video
- 🔒 **Bảo Mật Trước** — Mọi thứ chạy cục bộ, dữ liệu không rời khỏi máy của bạn

---

## 🎤 Backend Phiên Âm

| Backend | Tốc Độ | Tốt Nhất Cho | Cài Đặt |
|---------|--------|--------------|---------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Đa nền tảng | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | Tương thích nhất | `pip install openai-whisper` |

---

## 📄 Giấy Phép

Giấy phép MIT — xem [LICENSE](../../LICENSE) để biết chi tiết.

---

<p align="center">
  Được tạo với 🍿 cho các tác nhân AI ở khắp nơi
</p>
