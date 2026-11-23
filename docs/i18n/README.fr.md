<h1 align="center">
  <br>
  🍿
  <br>
  popcorn
  <br>
</h1>

Popcorn permet à Claude Code et aux autres agents MCP de regarder un fichier vidéo sur votre machine.

<!-- demo -->

Il renvoie des images clés prises aux changements de scène et une transcription horodatée.

**Installer pour Claude Code**

```bash
claude mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn
```

**Ou installez-le comme plugin Claude Code.** Cela ajoute aussi la skill `/popcorn:watch`. Lancez ces commandes dans Claude Code :

```
/plugin marketplace add haithamelmengad/claude-popcorn
/plugin install popcorn@popcorn
```

**Essayez**

Demandez avec vos mots et donnez le chemin complet de la vidéo :

- `Watch /path/to/talk.mp4 and tell me what it is about.`
- `In /path/to/talk.mp4, where do they talk about pricing? Give me the time.`
- `Give me the transcript of /path/to/talk.mp4 from 0:20 to 0:30.`

**Compatible avec**

| Client | Installation |
|--------|-------|
| Claude Code | La commande ou le plugin ci-dessus |
| Claude Desktop | Ajoutez le serveur à `claude_desktop_config.json`. Voir [Démarrage rapide](#démarrage-rapide) |
| Codex | `codex mcp add popcorn -- npx -y github:haithamelmengad/claude-popcorn` |
| Cursor | Ajoutez la même entrée `mcpServers` à `~/.cursor/mcp.json` |

**Prérequis**

- [FFmpeg](https://ffmpeg.org/) dans votre PATH
- Node.js 20 ou plus récent
- Un backend Whisper pour les transcriptions. Sans backend, vous recevez quand même les images. Voir [Backends de transcription](#backends-de-transcription)

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
  <a href="#démarrage-rapide">Démarrage rapide</a> •
  <a href="#fonctionnement">Fonctionnement</a> •
  <a href="#outils-mcp">Outils MCP</a> •
  <a href="#backends-de-transcription">Transcription</a> •
  <a href="#configuration">Configuration</a> •
  <a href="#dépannage">Dépannage</a> •
  <a href="#licence">Licence</a>
</p>

---

## Démarrage rapide

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

Pour Claude Desktop, ajoutez ceci à `~/Library/Application Support/Claude/claude_desktop_config.json` :

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

**Fonctionnalités principales :**

- **Détection de scènes** : capture les images aux transitions visuelles, pas à intervalles fixes
- **Transcription locale** : 4 backends au choix (mlx-whisper, faster-whisper, whisper-cpp, whisper)
- **Images intégrées** : renvoie les images clés directement dans les réponses MCP
- **Préréglages intelligents** : se configure tout seul pour les screencasts, les présentations, les films et les interviews
- **Aucune configuration** : donnez le chemin d'une vidéo et ça marche
- **Confidentialité d'abord** : tout tourne en local, aucune donnée ne quitte votre machine. Les modèles Whisper sont téléchargés une seule fois, à la première utilisation

---

## Documentation

### Premiers pas

- **[Démarrage rapide](#démarrage-rapide)** : installation et configuration
- **[Tutoriel](../tutorial.md)** : guide d'utilisation pas à pas
- **[Outils MCP](#outils-mcp)** : référence des outils disponibles

### Guides

- **[Backends de transcription](#backends-de-transcription)** : choisissez le meilleur backend pour votre système
- **[Types de vidéo et objectifs](#types-de-vidéo)** : préréglages selon le contenu
- **[Configuration](#configuration)** : paramètres avancés

### Référence

- **[Dépannage](../troubleshooting.md)** : problèmes courants et solutions
- **[Skill pour agents](../../skills/watch/SKILL.md)** : instructions pour les agents IA
- **[Référence de l'API](#outils-mcp)** : schémas et réponses des outils

---

## Fonctionnement

**Composants principaux :**

1. **FFprobe** : extrait les métadonnées de la vidéo (durée, résolution, codecs)
2. **Détection de scènes avec FFmpeg** : repère les transitions visuelles avec le filtre `select='gt(scene,N)'`
3. **Extraction d'images en parallèle** : capture des JPEG aux instants de changement de scène
4. **Transcription multi-backend** : les variantes de Whisper convertissent l'audio en texte horodaté
5. **Dossier d'analyse** : les résultats sont enregistrés dans le répertoire `.popcorn/`
6. **Réponse MCP** : renvoie les métadonnées et les images intégrées en base64

```
Video File ──▶ FFprobe ──▶ FFmpeg ──▶ Whisper ──▶ Analysis Bundle
                 │           │          │              │
                 ▼           ▼          ▼              ▼
              metadata    frames    transcript    MCP Response
```

---

## Outils MCP

| Outil | Description |
|------|-------------|
| `popcorn_analyze` | Analyse principale : extrait les images, transcrit l'audio et renvoie les résultats |
| `popcorn_suggest` | Lit les métadonnées de la vidéo et recommande des réglages |
| `popcorn_presets` | Liste les types de vidéo et les objectifs disponibles |
| `popcorn_backends` | Détecte votre système et affiche les options de transcription |
| `popcorn_read` | Lit des extraits de la transcription filtrés par temps |

### Utilisation de base

```json
{
  "tool": "popcorn_analyze",
  "arguments": {
    "path": "/path/to/video.mp4"
  }
}
```

### Avec des préréglages

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

## Types de vidéo

| Type | Idéal pour | Détection de scènes |
|------|----------|-----------------|
| `screencast` | Tutoriels, sessions de code, démos d'interface | Seuil bas |
| `presentation` | Diapositives, cours, conférences | Changements de diapositive |
| `movie` | Films, séries | Équilibrée |
| `interview` | Podcasts, personnes face caméra | Priorité à la transcription |
| `surveillance` | Vidéosurveillance, caméras embarquées | Seuil élevé |
| `sports` | Événements en direct, action rapide | Fréquence d'images élevée |

## Objectifs

| Objectif | Quand l'utiliser |
|-----------|----------|
| `summary` | Vous voulez un résumé rapide |
| `detailed` | Vous ne voulez rien manquer |
| `find_moment` | Vous cherchez un passage précis |
| `transcribe` | L'audio ou la parole compte le plus |
| `visual_only` | Seule l'image vous intéresse |
| `quick_scan` | Vous voulez un aperçu rapide |

---

## Backends de transcription

Popcorn détecte votre système automatiquement et recommande le meilleur backend.

### Comparaison des backends

| Backend | Vitesse | Idéal pour | Installation |
|---------|-------|----------|---------|
| **mlx-whisper** | Le plus rapide | Apple Silicon (M1/M2/M3/M4) | `pip install mlx-whisper` |
| **faster-whisper** | Rapide | GPU NVIDIA | `pip install faster-whisper` |
| **whisper-cpp** | Moyen | Multiplateforme | `brew install whisper-cpp` |
| **whisper** | Lent | Le plus compatible | `pip install openai-whisper` |

whisper-cpp a besoin d'un fichier de modèle. Téléchargez un modèle ggml depuis [whisper.cpp](https://github.com/ggml-org/whisper.cpp/tree/master/models) et indiquez son chemin dans la variable d'environnement `WHISPER_CPP_MODEL`, ou passez le chemin dans `model`. Sans fichier de modèle, Popcorn signale ce backend comme indisponible.

### Temps de traitement (vidéo de 60 min)

| Backend | Durée |
|---------|------|
| mlx-whisper | 3-8 min |
| faster-whisper | 5-10 min |
| whisper-cpp | 10-20 min |
| whisper | 30-60 min |

### Forcer un backend

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

## Configuration

### Tous les paramètres

| Paramètre | Type | Description |
|-----------|------|-------------|
| `path` | string | **Obligatoire.** Chemin absolu du fichier vidéo |
| `videoType` | string | Préréglage de type de vidéo |
| `objective` | string | Préréglage d'objectif d'analyse |
| `transcribe` | boolean | Active ou désactive la transcription |
| `backend` | string | Backend de transcription |
| `model` | string | Modèle Whisper (`tiny`, `base`, `small`, `medium`, `large`). Pour whisper-cpp : chemin d'un fichier de modèle ggml |
| `language` | string | Code de langue (par exemple `en`, `es`, `fr`) |
| `frameMode` | string | `scene` ou `interval` |
| `framesPerMin` | number | Images par minute en mode `interval` |
| `sceneThreshold` | number | Sensibilité de la détection de scènes (0-1) |
| `minSceneInterval` | number | Nombre minimal de secondes entre deux images de scène |
| `maxFrames` | number | Nombre maximal d'images à extraire |
| `inlineFrames` | number | Images renvoyées en base64 |
| `maxChunkChars` | number | Taille des blocs de transcription, en caractères |
| `maxTranscriptChars` | number | Longueur de l'extrait de transcription dans la réponse |
| `outDir` | string | Répertoire de sortie du dossier d'analyse |

### Structure de la sortie

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

## Dépannage

### FFmpeg introuvable

```bash
brew install ffmpeg          # macOS
sudo apt install ffmpeg      # Ubuntu/Debian
```

### Aucun backend de transcription

```bash
pip install mlx-whisper      # Apple Silicon
pip install openai-whisper   # Any platform
```

### Trop peu d'images détectées

```json
{ "sceneThreshold": 0.15, "minSceneInterval": 2 }
```

### Trop d'images détectées

```json
{ "sceneThreshold": 0.5, "minSceneInterval": 10 }
```

Consultez le **[guide de dépannage](../troubleshooting.md)** pour d'autres solutions.

---

## Développement

```bash
git clone https://github.com/haithamelmengad/claude-popcorn.git
cd claude-popcorn
npm install          # Install dependencies
npm run build        # Build
npm test             # Smoke test (needs ffmpeg)
npm run dev          # Development mode
npm start            # Run server
```

### Structure du projet

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

## Contribuer

1. Forkez le dépôt
2. Créez une branche pour votre changement (`git checkout -b feature/amazing`)
3. Commitez vos changements (`git commit -m 'Add amazing feature'`)
4. Poussez la branche (`git push origin feature/amazing`)
5. Ouvrez une Pull Request

---

## Licence

Licence MIT. Voir [LICENSE](../../LICENSE) pour les détails.

---

## Remerciements

- [OpenAI Whisper](https://github.com/openai/whisper) : reconnaissance vocale
- [whisper.cpp](https://github.com/ggerganov/whisper.cpp) : portage en C++
- [MLX Whisper](https://github.com/ml-explore/mlx-examples) : Apple Silicon
- [faster-whisper](https://github.com/guillaumekln/faster-whisper) : CTranslate2
- [FFmpeg](https://ffmpeg.org/) : traitement vidéo
- [Model Context Protocol](https://modelcontextprotocol.io/) : spécification MCP

---

Popcorn est un projet indépendant. Il n'est ni affilié à Anthropic ni approuvé par Anthropic.

<p align="center">
  Fait avec 🍿 pour les agents IA du monde entier
</p>
