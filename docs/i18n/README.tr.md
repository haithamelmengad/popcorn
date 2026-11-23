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

<h4 align="center"><a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a> için tasarlanmış video analiz sistemi.</h4>

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
  Popcorn, AI ajanlarının transkript çıkararak, sahne değişikliklerini tespit ederek ve anahtar kareleri döndürerek uzun videoları izlemesini ve anlamasını sağlar. Her şey yerel olarak çalışır—harici API yok, ücret yok, tam gizlilik.
</p>

---

## 🚀 Hızlı Başlangıç

```bash
# FFmpeg yükle (gerekli)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcorn yükle
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# İsteğe bağlı: Transkripsiyon backend'i yükle
pip install mlx-whisper                # Apple Silicon (en hızlı)
pip install openai-whisper             # Tüm platformlar
```

**Temel Özellikler:**

- 🎬 **Sahne Algılama** — Sabit aralıklar yerine görsel geçişlerde kare yakala
- 🎤 **Yerel Transkripsiyon** — 4 backend seçeneği
- 🖼️ **Satır İçi Görüntüler** — MCP yanıtlarında doğrudan anahtar kareleri döndür
- 🎯 **Akıllı Ön Ayarlar** — Ekran kayıtları, sunumlar, filmler, röportajlar için otomatik yapılandırma
- ⚡ **Sıfır Yapılandırma** — Sadece video yolunu geç
- 🔒 **Önce Gizlilik** — Her şey yerel çalışır, veriler makinenizden çıkmaz

---

## 🎤 Transkripsiyon Backend'leri

| Backend | Hız | En İyi | Kurulum |
|---------|-----|--------|---------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | Çapraz platform | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | En uyumlu | `pip install openai-whisper` |

---

## 📄 Lisans

MIT Lisansı — detaylar için [LICENSE](../../LICENSE) dosyasına bakın.

---

<p align="center">
  Her yerdeki AI ajanları için 🍿 ile yapıldı
</p>
