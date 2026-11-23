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

<h4 align="center"><a href="https://docs.anthropic.com/en/docs/agents-and-tools/claude-code/overview" target="_blank">Claude Code</a> के लिए बनाया गया वीडियो विश्लेषण सिस्टम।</h4>

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
  Popcorn AI एजेंटों को ट्रांसक्रिप्ट निकालकर, सीन परिवर्तन का पता लगाकर और कीफ्रेम वापस करके लंबे वीडियो देखने और समझने में सक्षम बनाता है। सब कुछ स्थानीय रूप से चलता है—कोई बाहरी API नहीं, कोई शुल्क नहीं, पूर्ण गोपनीयता।
</p>

---

## 🚀 त्वरित शुरुआत

```bash
# FFmpeg इंस्टॉल करें (आवश्यक)
brew install ffmpeg                    # macOS
sudo apt install ffmpeg                # Ubuntu/Debian

# Popcorn इंस्टॉल करें
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn && npm install && npm run build

# वैकल्पिक: ट्रांसक्रिप्शन बैकएंड इंस्टॉल करें
pip install mlx-whisper                # Apple Silicon (सबसे तेज़)
pip install openai-whisper             # कोई भी प्लेटफॉर्म
```

**मुख्य विशेषताएं:**

- 🎬 **सीन डिटेक्शन** — निश्चित अंतराल के बजाय विज़ुअल ट्रांज़िशन पर फ्रेम कैप्चर करें
- 🎤 **स्थानीय ट्रांसक्रिप्शन** — 4 बैकएंड विकल्प
- 🖼️ **इनलाइन इमेज** — MCP प्रतिक्रियाओं में सीधे कीफ्रेम लौटाएं
- 🎯 **स्मार्ट प्रीसेट** — स्क्रीनकास्ट, प्रेजेंटेशन, फिल्मों, इंटरव्यू के लिए ऑटो-कॉन्फ़िगर
- ⚡ **ज़ीरो कॉन्फ़िगरेशन** — बस वीडियो पथ पास करें
- 🔒 **गोपनीयता पहले** — सब कुछ स्थानीय रूप से चलता है, डेटा आपकी मशीन से बाहर नहीं जाता

---

## 🎤 ट्रांसक्रिप्शन बैकएंड

| बैकएंड | गति | सर्वोत्तम | इंस्टॉल |
|--------|------|----------|---------|
| **mlx-whisper** | ⚡⚡⚡⚡ | Apple Silicon | `pip install mlx-whisper` |
| **faster-whisper** | ⚡⚡⚡⚡ | NVIDIA GPU | `pip install faster-whisper` |
| **whisper-cpp** | ⚡⚡⚡ | क्रॉस-प्लेटफॉर्म | `brew install whisper-cpp` |
| **whisper** | ⚡⚡ | सबसे संगत | `pip install openai-whisper` |

---

## 📄 लाइसेंस

MIT लाइसेंस — विवरण के लिए [LICENSE](../../LICENSE) देखें।

---

<p align="center">
  हर जगह AI एजेंटों के लिए 🍿 के साथ बनाया गया
</p>
