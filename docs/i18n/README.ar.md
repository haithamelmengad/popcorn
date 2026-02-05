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

<h4 align="center">نظام تحليل الفيديو المصمم لـ <a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a>.</h4>

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
  يتيح Popcorn لوكلاء الذكاء الاصطناعي مشاهدة وفهم مقاطع الفيديو الطويلة من خلال استخراج النصوص، واكتشاف تغييرات المشاهد، وإرجاع الإطارات الرئيسية. كل شيء يعمل محلياً — بدون واجهات برمجة خارجية، بدون رسوم، خصوصية كاملة.
</p>

---

## 🚀 البدء السريع

```bash
# تثبيت FFmpeg (مطلوب)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# تثبيت Popcorn
git clone https://github.com/anthropics/popcorn.git
cd popcorn && npm install && npm run build

# اختياري: تثبيت محرك النسخ
pip install mlx-whisper                # Apple Silicon (الأسرع)
pip install openai-whisper             # أي منصة
```

**الميزات الرئيسية:**

- 🎬 **اكتشاف المشاهد** — التقاط الإطارات عند الانتقالات البصرية، وليس على فترات ثابتة
- 🎤 **النسخ المحلي** — 4 خيارات للمحرك
- 🖼️ **صور مضمنة** — إرجاع الإطارات الرئيسية مباشرة في استجابات MCP
- 🎯 **إعدادات ذكية** — تكوين تلقائي لتسجيلات الشاشة والعروض التقديمية والأفلام والمقابلات
- ⚡ **بدون إعداد** — فقط مرر مسار الفيديو
- 🔒 **الخصوصية أولاً** — كل شيء يعمل محلياً، البيانات لا تغادر جهازك

---

## 🎤 محركات النسخ

| المحرك | السرعة | الأفضل لـ | التثبيت |
|--------|--------|----------|---------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | متعدد المنصات | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | الأكثر توافقاً | `pip install openai-whisper` |

---

## 📄 الرخصة

رخصة MIT — راجع [LICENSE](../../LICENSE) للتفاصيل.

---

<p align="center">
  صنع بـ 🍿 لوكلاء الذكاء الاصطناعي في كل مكان
</p>
