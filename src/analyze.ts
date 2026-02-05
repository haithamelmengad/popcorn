import path from "node:path";
import fs from "node:fs/promises";
import { extractAudio, extractFrames, extractSceneFrames, frameToBase64, probeVideo, FrameResult } from "./ffmpeg.js";
import { transcribe, TranscriptionBackend } from "./transcribe.js";

export type AnalyzeOptions = {
  outDir?: string;
  transcribe: boolean;
  backend?: TranscriptionBackend;
  language?: string;
  model?: string;
  // Frame extraction options
  frameMode: "interval" | "scene";
  framesPerMin: number;
  maxFrames: number;
  sceneThreshold: number;
  minSceneInterval: number;
  // How many frames to return as base64 in the response (0 = none, just paths)
  inlineFrames: number;
  // Transcript options
  maxChunkChars: number;
  maxTranscriptChars: number;
};

export type InlineFrame = {
  timeSec: number;
  base64: string;
  mimeType: "image/jpeg";
};

export type AnalyzeResult = {
  ok: boolean;
  outDir: string;
  analysisPath: string;
  videoPath: string;
  video: ReturnType<typeof probeVideo> extends Promise<infer T> ? T : never;
  transcript: {
    available: boolean;
    textExcerpt: string;
    textPath?: string;
    jsonPath?: string;
    chunksPath?: string;
    segmentCount?: number;
    language?: string;
    model?: string;
    backend?: string;
  };
  keyframes: {
    available: boolean;
    method?: "interval" | "scene";
    dir?: string;
    count?: number;
    intervalSec?: number;
    sceneThreshold?: number;
    frames?: { path: string; timeSec: number }[];
  };
  // Inline base64-encoded frames for direct consumption by MCP clients
  inlineFrames?: InlineFrame[];
  warnings: string[];
};

function safeName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

/**
 * Select representative frames to include inline.
 * Tries to pick frames evenly distributed across the video.
 */
function selectRepresentativeFrames(
  frames: { path: string; timeSec: number }[],
  count: number
): { path: string; timeSec: number }[] {
  if (frames.length <= count) return frames;

  const selected: { path: string; timeSec: number }[] = [];
  const step = (frames.length - 1) / (count - 1);

  for (let i = 0; i < count; i++) {
    const index = Math.round(i * step);
    selected.push(frames[index]);
  }

  return selected;
}

export async function analyzeVideo(
  videoPath: string,
  options: AnalyzeOptions
): Promise<AnalyzeResult> {
  const warnings: string[] = [];
  const baseName = safeName(path.basename(videoPath, path.extname(videoPath)));
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outDir = options.outDir
    ? path.resolve(options.outDir)
    : path.resolve(process.cwd(), ".popcorn", `${baseName}_${timestamp}`);

  await fs.mkdir(outDir, { recursive: true });

  const video = await probeVideo(videoPath);

  let transcriptResult: {
    available: boolean;
    text: string;
    segments: { start: number; end: number; text: string }[];
    language?: string;
    model?: string;
    backend?: string;
    textPath?: string;
    jsonPath?: string;
    chunksPath?: string;
  } = {
    available: false,
    text: "",
    segments: [],
  };

  const assetsDir = path.join(outDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  let audioPath: string | undefined;
  if (options.transcribe) {
    try {
      audioPath = await extractAudio(videoPath, assetsDir);
      transcriptResult = await transcribe(audioPath, outDir, {
        backend: options.backend ?? "auto",
        model: options.model,
        language: options.language,
        maxChunkChars: options.maxChunkChars,
      });

      if (!transcriptResult.available) {
        warnings.push("No transcription backend available; skipping transcription. Run 'popcorn_backends' to see installation options.");
      }
    } catch (error) {
      warnings.push(`Transcription failed: ${(error as Error).message}`);
    }
  }

  // Extract frames using selected method
  let frameInfo: FrameResult | null = null;
  try {
    const framesDir = path.join(assetsDir, "frames");

    if (options.frameMode === "scene") {
      frameInfo = await extractSceneFrames(
        videoPath,
        framesDir,
        options.sceneThreshold,
        options.maxFrames,
        options.minSceneInterval
      );
    } else {
      frameInfo = await extractFrames(
        videoPath,
        framesDir,
        options.framesPerMin,
        options.maxFrames
      );
    }
  } catch (error) {
    warnings.push(`Frame extraction failed: ${(error as Error).message}`);
  }

  // Generate inline base64 frames if requested
  let inlineFrames: InlineFrame[] | undefined;
  if (options.inlineFrames > 0 && frameInfo && frameInfo.frames.length > 0) {
    const selectedFrames = selectRepresentativeFrames(frameInfo.frames, options.inlineFrames);
    inlineFrames = [];

    for (const frame of selectedFrames) {
      try {
        const base64 = await frameToBase64(frame.path);
        inlineFrames.push({
          timeSec: frame.timeSec,
          base64,
          mimeType: "image/jpeg",
        });
      } catch (error) {
        warnings.push(`Failed to encode frame ${frame.path}: ${(error as Error).message}`);
      }
    }
  }

  const analysisPath = path.join(outDir, "analysis.json");
  const analysisPayload = {
    createdAt: new Date().toISOString(),
    videoPath: path.resolve(videoPath),
    outputDir: outDir,
    video,
    transcript: transcriptResult.available
      ? {
          available: true,
          language: transcriptResult.language,
          model: transcriptResult.model,
          textPath: transcriptResult.textPath,
          jsonPath: transcriptResult.jsonPath,
          chunksPath: transcriptResult.chunksPath,
          segmentCount: transcriptResult.segments.length,
        }
      : { available: false },
    keyframes: frameInfo
      ? {
          available: true,
          method: frameInfo.method,
          dir: frameInfo.dir,
          count: frameInfo.count,
          intervalSec: frameInfo.intervalSec,
          sceneThreshold: frameInfo.sceneThreshold,
          frames: frameInfo.frames,
        }
      : { available: false },
    warnings,
  };

  await fs.writeFile(analysisPath, JSON.stringify(analysisPayload, null, 2), "utf8");

  const excerpt = transcriptResult.text.slice(0, options.maxTranscriptChars);

  return {
    ok: warnings.length === 0,
    outDir,
    analysisPath,
    videoPath: path.resolve(videoPath),
    video,
    transcript: {
      available: transcriptResult.available,
      textExcerpt: excerpt,
      textPath: transcriptResult.textPath,
      jsonPath: transcriptResult.jsonPath,
      chunksPath: transcriptResult.chunksPath,
      segmentCount: transcriptResult.segments.length,
      language: transcriptResult.language,
      model: transcriptResult.model,
      backend: transcriptResult.backend,
    },
    keyframes: frameInfo
      ? {
          available: true,
          method: frameInfo.method,
          dir: frameInfo.dir,
          count: frameInfo.count,
          intervalSec: frameInfo.intervalSec,
          sceneThreshold: frameInfo.sceneThreshold,
          frames: frameInfo.frames,
        }
      : { available: false },
    inlineFrames,
    warnings,
  };
}
