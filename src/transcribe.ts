import path from "node:path";
import fs from "node:fs/promises";
import { commandExists, runCommand } from "./commands.js";

export type TranscriptSegment = {
  start: number;
  end: number;
  text: string;
};

export type TranscriptResult = {
  available: boolean;
  backend?: TranscriptionBackend;
  text: string;
  segments: TranscriptSegment[];
  language?: string;
  model?: string;
  jsonPath?: string;
  textPath?: string;
  chunksPath?: string;
};

export type TranscriptChunk = {
  start: number;
  end: number;
  text: string;
};

/**
 * Supported transcription backends
 */
export type TranscriptionBackend =
  | "auto"           // Auto-detect best available
  | "whisper"        // openai-whisper (pip install openai-whisper)
  | "whisper-cpp"    // whisper.cpp (brew install whisper-cpp)
  | "mlx-whisper"    // MLX Whisper for Apple Silicon (pip install mlx-whisper)
  | "faster-whisper"; // CTranslate2-based (pip install faster-whisper)

export type BackendInfo = {
  name: TranscriptionBackend;
  available: boolean;
  command: string;
  description: string;
  installHint: string;
  platforms: string[];
  speed: "slow" | "medium" | "fast" | "very-fast";
  estimatedTimeFor60Min?: string;
};

export type EnvironmentInfo = {
  platform: string;
  arch: string;
  isAppleSilicon: boolean;
  hasNvidiaGpu: boolean;
  pythonAvailable: boolean;
  recommendedBackend: TranscriptionBackend | null;
  recommendationReason: string;
  allRecommendations: Array<{
    backend: TranscriptionBackend;
    reason: string;
    installCommand: string;
  }>;
};

/**
 * Detect the current environment and provide recommendations
 */
export async function detectEnvironment(): Promise<EnvironmentInfo> {
  const platform = process.platform;
  const arch = process.arch;
  const isAppleSilicon = platform === "darwin" && arch === "arm64";

  // Check for NVIDIA GPU (Linux/Windows)
  let hasNvidiaGpu = false;
  if (platform === "linux" || platform === "win32") {
    const nvidiaSmi = await runCommand("nvidia-smi", ["--query-gpu=name", "--format=csv,noheader"]);
    hasNvidiaGpu = nvidiaSmi.exitCode === 0 && nvidiaSmi.stdout.trim().length > 0;
  }

  // Check Python availability
  const pythonCheck = await runCommand("python3", ["--version"]);
  const pythonAvailable = pythonCheck.exitCode === 0;

  // Build recommendations based on environment
  const allRecommendations: EnvironmentInfo["allRecommendations"] = [];

  if (isAppleSilicon) {
    allRecommendations.push({
      backend: "mlx-whisper",
      reason: "Fastest option for Apple Silicon (M1/M2/M3/M4) - uses Neural Engine",
      installCommand: "pip install mlx-whisper",
    });
    allRecommendations.push({
      backend: "whisper-cpp",
      reason: "Fast C++ implementation with Metal acceleration",
      installCommand: "brew install whisper-cpp",
    });
  }

  if (hasNvidiaGpu) {
    allRecommendations.push({
      backend: "faster-whisper",
      reason: "Fastest option for NVIDIA GPUs - uses CUDA acceleration",
      installCommand: "pip install faster-whisper",
    });
  }

  // Universal recommendations
  allRecommendations.push({
    backend: "whisper-cpp",
    reason: "Fast cross-platform C++ implementation",
    installCommand: platform === "darwin" ? "brew install whisper-cpp" : "Build from github.com/ggerganov/whisper.cpp",
  });

  allRecommendations.push({
    backend: "whisper",
    reason: "Original OpenAI implementation - most compatible and well-documented",
    installCommand: "pip install openai-whisper",
  });

  // Determine top recommendation
  let recommendedBackend: TranscriptionBackend | null = null;
  let recommendationReason = "";

  if (isAppleSilicon) {
    recommendedBackend = "mlx-whisper";
    recommendationReason = "Apple Silicon detected - mlx-whisper provides the best performance using the Neural Engine";
  } else if (hasNvidiaGpu) {
    recommendedBackend = "faster-whisper";
    recommendationReason = "NVIDIA GPU detected - faster-whisper provides 4x speedup with CUDA";
  } else if (pythonAvailable) {
    recommendedBackend = "whisper";
    recommendationReason = "Standard environment - openai-whisper is the most compatible option";
  }

  return {
    platform,
    arch,
    isAppleSilicon,
    hasNvidiaGpu,
    pythonAvailable,
    recommendedBackend,
    recommendationReason,
    allRecommendations,
  };
}

/**
 * Check which transcription backends are available
 */
export async function detectAvailableBackends(): Promise<BackendInfo[]> {
  const backends: BackendInfo[] = [
    {
      name: "whisper",
      available: false,
      command: "whisper",
      description: "OpenAI Whisper - Original Python implementation",
      installHint: "pip install openai-whisper",
      platforms: ["linux", "darwin", "win32"],
      speed: "slow",
      estimatedTimeFor60Min: "30-60 min on CPU",
    },
    {
      name: "whisper-cpp",
      available: false,
      command: "whisper-cpp",
      description: "whisper.cpp - Fast C++ implementation",
      installHint: "brew install whisper-cpp (macOS) or build from source",
      platforms: ["linux", "darwin", "win32"],
      speed: "fast",
      estimatedTimeFor60Min: "10-20 min on CPU",
    },
    {
      name: "mlx-whisper",
      available: false,
      command: "mlx_whisper",
      description: "MLX Whisper - Optimized for Apple Silicon (M1/M2/M3/M4)",
      installHint: "pip install mlx-whisper",
      platforms: ["darwin"],
      speed: "very-fast",
      estimatedTimeFor60Min: "3-8 min on Apple Silicon",
    },
    {
      name: "faster-whisper",
      available: false,
      command: "faster-whisper",
      description: "Faster Whisper - CTranslate2 optimized, 4x faster than original",
      installHint: "pip install faster-whisper",
      platforms: ["linux", "darwin", "win32"],
      speed: "fast",
      estimatedTimeFor60Min: "5-10 min with GPU, 15-25 min on CPU",
    },
  ];

  // Check availability in parallel
  await Promise.all(
    backends.map(async (backend) => {
      // Check if command exists
      backend.available = await commandExists(backend.command);

      // Special check for mlx-whisper (Python module)
      if (backend.name === "mlx-whisper" && !backend.available) {
        const pythonCheck = await runCommand("python3", ["-c", "import mlx_whisper"]);
        backend.available = pythonCheck.exitCode === 0;
      }

      // Special check for faster-whisper (Python module)
      if (backend.name === "faster-whisper" && !backend.available) {
        const pythonCheck = await runCommand("python3", ["-c", "import faster_whisper"]);
        backend.available = pythonCheck.exitCode === 0;
      }
    })
  );

  return backends;
}

/**
 * Get the best available backend
 */
export async function getBestBackend(): Promise<TranscriptionBackend | null> {
  const backends = await detectAvailableBackends();

  // Priority order: mlx-whisper > faster-whisper > whisper-cpp > whisper
  const priority: TranscriptionBackend[] = [
    "mlx-whisper",
    "faster-whisper",
    "whisper-cpp",
    "whisper",
  ];

  for (const name of priority) {
    const backend = backends.find(b => b.name === name);
    if (backend?.available) {
      return backend.name;
    }
  }

  return null;
}

function makeChunks(segments: TranscriptSegment[], maxChars: number): TranscriptChunk[] {
  const chunks: TranscriptChunk[] = [];
  let buffer: TranscriptChunk | null = null;

  for (const segment of segments) {
    if (!buffer) {
      buffer = { start: segment.start, end: segment.end, text: segment.text.trim() };
      continue;
    }

    const nextText = `${buffer.text} ${segment.text}`.trim();
    if (nextText.length > maxChars && buffer.text.length > 0) {
      chunks.push(buffer);
      buffer = { start: segment.start, end: segment.end, text: segment.text.trim() };
      continue;
    }

    buffer.text = nextText;
    buffer.end = segment.end;
  }

  if (buffer) {
    chunks.push(buffer);
  }

  return chunks;
}

/**
 * Write transcript files (shared by all backends)
 */
async function writeTranscriptFiles(
  outDir: string,
  segments: TranscriptSegment[],
  rawJson: object,
  maxChunkChars: number
): Promise<{ textPath: string; jsonPath: string; chunksPath: string; text: string }> {
  const text = segments.map((segment) => segment.text).join(" ").trim();

  const textPath = path.join(outDir, "transcript.txt");
  await fs.writeFile(textPath, text + "\n", "utf8");

  const chunks = makeChunks(segments, maxChunkChars);
  const chunksPath = path.join(outDir, "transcript.chunks.json");
  await fs.writeFile(chunksPath, JSON.stringify(chunks, null, 2), "utf8");

  const jsonPath = path.join(outDir, "transcript.json");
  await fs.writeFile(jsonPath, JSON.stringify({
    ...rawJson,
    segments,
  }, null, 2), "utf8");

  return { textPath, jsonPath, chunksPath, text };
}

/**
 * Transcribe using openai-whisper (original Python implementation)
 */
async function transcribeWithOpenAIWhisper(
  audioPath: string,
  outDir: string,
  options: { model?: string; language?: string; maxChunkChars: number }
): Promise<TranscriptResult> {
  await fs.mkdir(outDir, { recursive: true });

  const args = [
    audioPath,
    "--model", options.model ?? "base",
    "--output_format", "json",
    "--output_dir", outDir,
    "--task", "transcribe",
    "--fp16", "False",
  ];

  if (options.language) {
    args.push("--language", options.language);
  }

  const result = await runCommand("whisper", args);
  if (result.exitCode !== 0) {
    throw new Error(`whisper failed: ${result.stderr || result.stdout}`);
  }

  const baseName = path.basename(audioPath, path.extname(audioPath));
  const outputJsonPath = path.join(outDir, `${baseName}.json`);
  const jsonRaw = await fs.readFile(outputJsonPath, "utf8");
  const json = JSON.parse(jsonRaw);

  const segments: TranscriptSegment[] = Array.isArray(json.segments)
    ? json.segments.map((segment: any) => ({
        start: Number(segment.start ?? 0),
        end: Number(segment.end ?? 0),
        text: String(segment.text ?? "").trim(),
      }))
    : [];

  const files = await writeTranscriptFiles(outDir, segments, json, options.maxChunkChars);

  return {
    available: true,
    backend: "whisper",
    text: files.text,
    segments,
    language: json.language,
    model: options.model ?? "base",
    jsonPath: files.jsonPath,
    textPath: files.textPath,
    chunksPath: files.chunksPath,
  };
}

/**
 * Transcribe using whisper.cpp
 */
async function transcribeWithWhisperCpp(
  audioPath: string,
  outDir: string,
  options: { model?: string; language?: string; maxChunkChars: number }
): Promise<TranscriptResult> {
  await fs.mkdir(outDir, { recursive: true });

  // whisper.cpp outputs JSON with --output-json flag
  const outputBase = path.join(outDir, "transcript");

  const args = [
    "-f", audioPath,
    "-m", options.model ?? "base",
    "--output-json",
    "-of", outputBase,
  ];

  if (options.language) {
    args.push("-l", options.language);
  }

  const result = await runCommand("whisper-cpp", args);
  if (result.exitCode !== 0) {
    throw new Error(`whisper-cpp failed: ${result.stderr || result.stdout}`);
  }

  // whisper.cpp creates transcript.json
  const jsonPath = outputBase + ".json";
  const jsonRaw = await fs.readFile(jsonPath, "utf8");
  const json = JSON.parse(jsonRaw);

  // whisper.cpp format is slightly different
  const segments: TranscriptSegment[] = Array.isArray(json.transcription)
    ? json.transcription.map((segment: any) => ({
        start: Number(segment.timestamps?.from?.replace(":", ".") ?? segment.offsets?.from ?? 0) / 1000,
        end: Number(segment.timestamps?.to?.replace(":", ".") ?? segment.offsets?.to ?? 0) / 1000,
        text: String(segment.text ?? "").trim(),
      }))
    : [];

  const files = await writeTranscriptFiles(outDir, segments, json, options.maxChunkChars);

  return {
    available: true,
    backend: "whisper-cpp",
    text: files.text,
    segments,
    language: options.language,
    model: options.model ?? "base",
    jsonPath: files.jsonPath,
    textPath: files.textPath,
    chunksPath: files.chunksPath,
  };
}

/**
 * Transcribe using mlx-whisper (Apple Silicon optimized)
 */
async function transcribeWithMLXWhisper(
  audioPath: string,
  outDir: string,
  options: { model?: string; language?: string; maxChunkChars: number }
): Promise<TranscriptResult> {
  await fs.mkdir(outDir, { recursive: true });

  const outputPath = path.join(outDir, "mlx_output.json");

  // mlx-whisper is typically used as a Python module
  const pythonScript = `
import mlx_whisper
import json

result = mlx_whisper.transcribe(
    "${audioPath}",
    path_or_hf_repo="mlx-community/whisper-${options.model ?? "base"}-mlx",
    ${options.language ? `language="${options.language}",` : ""}
)

with open("${outputPath}", "w") as f:
    json.dump(result, f)
`;

  const result = await runCommand("python3", ["-c", pythonScript]);
  if (result.exitCode !== 0) {
    throw new Error(`mlx-whisper failed: ${result.stderr || result.stdout}`);
  }

  const jsonRaw = await fs.readFile(outputPath, "utf8");
  const json = JSON.parse(jsonRaw);

  const segments: TranscriptSegment[] = Array.isArray(json.segments)
    ? json.segments.map((segment: any) => ({
        start: Number(segment.start ?? 0),
        end: Number(segment.end ?? 0),
        text: String(segment.text ?? "").trim(),
      }))
    : [];

  const files = await writeTranscriptFiles(outDir, segments, json, options.maxChunkChars);

  return {
    available: true,
    backend: "mlx-whisper",
    text: files.text,
    segments,
    language: json.language ?? options.language,
    model: options.model ?? "base",
    jsonPath: files.jsonPath,
    textPath: files.textPath,
    chunksPath: files.chunksPath,
  };
}

/**
 * Transcribe using faster-whisper
 */
async function transcribeWithFasterWhisper(
  audioPath: string,
  outDir: string,
  options: { model?: string; language?: string; maxChunkChars: number }
): Promise<TranscriptResult> {
  await fs.mkdir(outDir, { recursive: true });

  const outputPath = path.join(outDir, "faster_output.json");

  const pythonScript = `
from faster_whisper import WhisperModel
import json

model = WhisperModel("${options.model ?? "base"}", device="auto", compute_type="auto")
segments, info = model.transcribe(
    "${audioPath}",
    ${options.language ? `language="${options.language}",` : ""}
    beam_size=5
)

result = {
    "language": info.language,
    "segments": [
        {"start": s.start, "end": s.end, "text": s.text}
        for s in segments
    ]
}

with open("${outputPath}", "w") as f:
    json.dump(result, f)
`;

  const result = await runCommand("python3", ["-c", pythonScript]);
  if (result.exitCode !== 0) {
    throw new Error(`faster-whisper failed: ${result.stderr || result.stdout}`);
  }

  const jsonRaw = await fs.readFile(outputPath, "utf8");
  const json = JSON.parse(jsonRaw);

  const segments: TranscriptSegment[] = Array.isArray(json.segments)
    ? json.segments.map((segment: any) => ({
        start: Number(segment.start ?? 0),
        end: Number(segment.end ?? 0),
        text: String(segment.text ?? "").trim(),
      }))
    : [];

  const files = await writeTranscriptFiles(outDir, segments, json, options.maxChunkChars);

  return {
    available: true,
    backend: "faster-whisper",
    text: files.text,
    segments,
    language: json.language ?? options.language,
    model: options.model ?? "base",
    jsonPath: files.jsonPath,
    textPath: files.textPath,
    chunksPath: files.chunksPath,
  };
}

/**
 * Main transcription function - supports multiple backends
 */
export async function transcribe(
  audioPath: string,
  outDir: string,
  options: {
    backend?: TranscriptionBackend;
    model?: string;
    language?: string;
    maxChunkChars: number;
  }
): Promise<TranscriptResult> {
  let backend = options.backend ?? "auto";

  // Auto-detect best backend
  if (backend === "auto") {
    const detected = await getBestBackend();
    if (!detected) {
      return {
        available: false,
        text: "",
        segments: [],
      };
    }
    backend = detected;
  }

  // Verify selected backend is available
  const backends = await detectAvailableBackends();
  const selected = backends.find(b => b.name === backend);
  if (!selected?.available) {
    return {
      available: false,
      text: "",
      segments: [],
    };
  }

  // Route to appropriate backend
  switch (backend) {
    case "whisper":
      return transcribeWithOpenAIWhisper(audioPath, outDir, options);

    case "whisper-cpp":
      return transcribeWithWhisperCpp(audioPath, outDir, options);

    case "mlx-whisper":
      return transcribeWithMLXWhisper(audioPath, outDir, options);

    case "faster-whisper":
      return transcribeWithFasterWhisper(audioPath, outDir, options);

    default:
      return {
        available: false,
        text: "",
        segments: [],
      };
  }
}

// Keep backwards compatibility
export const transcribeWithWhisper = transcribe;
