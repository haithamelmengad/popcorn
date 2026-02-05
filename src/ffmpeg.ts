import path from "node:path";
import fs from "node:fs/promises";
import { runCommand } from "./commands.js";

export type VideoStreamInfo = {
  width?: number;
  height?: number;
  codec?: string;
  avgFrameRate?: string;
  fps?: number;
};

export type AudioStreamInfo = {
  codec?: string;
  sampleRate?: number;
  channels?: number;
};

export type ProbeInfo = {
  durationSec?: number;
  formatName?: string;
  sizeBytes?: number;
  video?: VideoStreamInfo;
  audio?: AudioStreamInfo;
};

function parseFps(rate?: string): number | undefined {
  if (!rate) return undefined;
  const [num, den] = rate.split("/").map((value) => Number(value));
  if (!Number.isFinite(num) || !Number.isFinite(den) || den === 0) return undefined;
  return num / den;
}

export async function probeVideo(videoPath: string): Promise<ProbeInfo> {
  const args = [
    "-v",
    "error",
    "-print_format",
    "json",
    "-show_format",
    "-show_streams",
    videoPath,
  ];
  const result = await runCommand("ffprobe", args);
  if (result.exitCode !== 0) {
    throw new Error(`ffprobe failed: ${result.stderr || result.stdout}`);
  }

  const parsed = JSON.parse(result.stdout);
  const format = parsed.format ?? {};
  const streams = Array.isArray(parsed.streams) ? parsed.streams : [];
  const videoStream = streams.find((stream: any) => stream.codec_type === "video") ?? {};
  const audioStream = streams.find((stream: any) => stream.codec_type === "audio") ?? {};

  return {
    durationSec: format.duration ? Number(format.duration) : undefined,
    formatName: format.format_name,
    sizeBytes: format.size ? Number(format.size) : undefined,
    video: {
      width: videoStream.width,
      height: videoStream.height,
      codec: videoStream.codec_name,
      avgFrameRate: videoStream.avg_frame_rate,
      fps: parseFps(videoStream.avg_frame_rate ?? videoStream.r_frame_rate),
    },
    audio: {
      codec: audioStream.codec_name,
      sampleRate: audioStream.sample_rate ? Number(audioStream.sample_rate) : undefined,
      channels: audioStream.channels,
    },
  };
}

export async function extractAudio(videoPath: string, outDir: string): Promise<string> {
  await fs.mkdir(outDir, { recursive: true });
  const audioPath = path.join(outDir, "audio.wav");
  const args = [
    "-y",
    "-i",
    videoPath,
    "-vn",
    "-ac",
    "1",
    "-ar",
    "16000",
    "-f",
    "wav",
    audioPath,
  ];
  const result = await runCommand("ffmpeg", args);
  if (result.exitCode !== 0) {
    throw new Error(`ffmpeg audio extraction failed: ${result.stderr || result.stdout}`);
  }
  return audioPath;
}

export type FrameInfo = {
  path: string;
  timeSec: number;
  sceneScore?: number;
};

export type FrameResult = {
  dir: string;
  count: number;
  intervalSec?: number;
  sceneThreshold?: number;
  method: "interval" | "scene";
  frames: FrameInfo[];
};

/**
 * Extract frames at fixed intervals (original method)
 */
export async function extractFrames(
  videoPath: string,
  outDir: string,
  framesPerMin: number,
  maxFrames: number
): Promise<FrameResult> {
  await fs.mkdir(outDir, { recursive: true });
  const intervalSec = framesPerMin > 0 ? 60 / framesPerMin : 30;
  const fps = 1 / intervalSec;

  const framePattern = path.join(outDir, "frame_%06d.jpg");
  const args = [
    "-y",
    "-i",
    videoPath,
    "-vf",
    `fps=${fps}`,
    "-frames:v",
    String(maxFrames),
    "-q:v",
    "2",
    framePattern,
  ];
  const result = await runCommand("ffmpeg", args);
  if (result.exitCode !== 0) {
    throw new Error(`ffmpeg frame extraction failed: ${result.stderr || result.stdout}`);
  }

  const entries = await fs.readdir(outDir);
  const frames = entries
    .filter((name) => name.startsWith("frame_") && name.endsWith(".jpg"))
    .sort()
    .map((name, index) => ({
      path: path.join(outDir, name),
      timeSec: Number((index * intervalSec).toFixed(2)),
    }));

  return {
    dir: outDir,
    count: frames.length,
    intervalSec,
    method: "interval",
    frames,
  };
}

/**
 * Extract frames at scene changes using ffmpeg's scene detection filter.
 * This captures frames when significant visual changes occur (app switches, transitions, etc.)
 *
 * Two-pass approach with parallel extraction for speed:
 * 1. Detect scene timestamps (single ffmpeg call)
 * 2. Extract frames in parallel batches (fast seeking with -ss before -i)
 */
export async function extractSceneFrames(
  videoPath: string,
  outDir: string,
  sceneThreshold: number = 0.3,
  maxFrames: number = 200,
  minIntervalSec: number = 2
): Promise<FrameResult> {
  await fs.mkdir(outDir, { recursive: true });

  // Step 1: Detect scene changes and get timestamps
  const detectArgs = [
    "-i",
    videoPath,
    "-vf",
    `select='gt(scene,${sceneThreshold})',showinfo`,
    "-vsync",
    "vfr",
    "-f",
    "null",
    "-",
  ];

  const detectResult = await runCommand("ffmpeg", detectArgs);
  const output = detectResult.stderr;

  // Parse showinfo output to get timestamps
  const timestampRegex = /pts_time:\s*([\d.]+)/g;
  const timestamps: number[] = [];
  let match;
  while ((match = timestampRegex.exec(output)) !== null) {
    const time = parseFloat(match[1]);
    if (timestamps.length === 0 || time - timestamps[timestamps.length - 1] >= minIntervalSec) {
      timestamps.push(time);
    }
    if (timestamps.length >= maxFrames) break;
  }

  // If scene detection found nothing, fall back to evenly spaced frames
  if (timestamps.length === 0) {
    const probe = await probeVideo(videoPath);
    const duration = probe.durationSec ?? 60;
    const interval = duration / 11;
    for (let i = 1; i <= 10; i++) {
      timestamps.push(Number((interval * i).toFixed(2)));
    }
  }

  // Step 2: Extract frames in PARALLEL batches (much faster than sequential)
  const BATCH_SIZE = 8; // Extract 8 frames concurrently
  const frames: FrameInfo[] = [];

  for (let batchStart = 0; batchStart < timestamps.length; batchStart += BATCH_SIZE) {
    const batch = timestamps.slice(batchStart, batchStart + BATCH_SIZE);

    const extractPromises = batch.map(async (time, batchIndex) => {
      const frameIndex = batchStart + batchIndex;
      const framePath = path.join(outDir, `scene_${String(frameIndex + 1).padStart(6, "0")}.jpg`);

      // -ss BEFORE -i enables fast seeking
      const extractArgs = [
        "-y",
        "-ss", String(time),
        "-i", videoPath,
        "-vframes", "1",
        "-q:v", "2",
        framePath,
      ];

      const extractResult = await runCommand("ffmpeg", extractArgs);
      if (extractResult.exitCode === 0) {
        return { path: framePath, timeSec: Number(time.toFixed(2)) };
      }
      return null;
    });

    const batchResults = await Promise.all(extractPromises);
    for (const result of batchResults) {
      if (result) frames.push(result);
    }
  }

  // Sort frames by timestamp (parallel extraction may complete out of order)
  frames.sort((a, b) => a.timeSec - b.timeSec);

  return {
    dir: outDir,
    count: frames.length,
    sceneThreshold,
    method: "scene",
    frames,
  };
}

/**
 * Read a frame file and return as base64-encoded JPEG
 */
export async function frameToBase64(framePath: string): Promise<string> {
  const buffer = await fs.readFile(framePath);
  return buffer.toString("base64");
}
