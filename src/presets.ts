/**
 * Video analysis presets for different content types and objectives.
 * These configure optimal parameters based on what the user is trying to accomplish.
 */

export type VideoType =
  | "screencast"      // Screen recordings, tutorials, coding sessions
  | "presentation"    // Slides, keynotes, lectures
  | "movie"           // Films, TV shows, cinematicontent
  | "interview"       // Talking heads, podcasts, conversations
  | "surveillance"    // Security footage, dashcam, long static shots
  | "sports"          // Fast action, live events
  | "unknown";        // Default fallback

export type Objective =
  | "summary"         // Get a high-level overview
  | "detailed"        // Thorough analysis, miss nothing
  | "find_moment"     // Looking for a specific scene or topic
  | "transcribe"      // Focus on audio/speech content
  | "visual_only"     // Only care about what's on screen
  | "quick_scan";     // Fast preview, minimal processing

export type PresetConfig = {
  frameMode: "interval" | "scene";
  sceneThreshold: number;
  minSceneInterval: number;
  framesPerMin: number;
  maxFrames: number;
  inlineFrames: number;
  transcribe: boolean;
  whisperModel: string;
  maxTranscriptChars: number;
  description: string;
};

/**
 * Presets indexed by video type
 */
export const VIDEO_TYPE_PRESETS: Record<VideoType, Partial<PresetConfig>> = {
  screencast: {
    frameMode: "scene",
    sceneThreshold: 0.2,      // Lower threshold - subtle UI changes matter
    minSceneInterval: 3,
    maxFrames: 150,
    inlineFrames: 20,
    transcribe: true,
    whisperModel: "base",
    description: "Optimized for screen recordings with subtle UI changes. Lower scene threshold captures window switches, scrolling, and code editing.",
  },
  presentation: {
    frameMode: "scene",
    sceneThreshold: 0.4,      // Higher threshold - slide transitions are clear
    minSceneInterval: 5,
    maxFrames: 100,
    inlineFrames: 25,         // More frames since slides are key
    transcribe: true,
    whisperModel: "base",
    description: "Optimized for slide decks and presentations. Captures slide transitions while ignoring minor animations.",
  },
  movie: {
    frameMode: "scene",
    sceneThreshold: 0.35,
    minSceneInterval: 2,
    maxFrames: 200,
    inlineFrames: 15,
    transcribe: true,
    whisperModel: "small",    // Better model for varied audio
    description: "Optimized for films and TV. Balances scene detection with cinematic pacing.",
  },
  interview: {
    frameMode: "interval",    // Talking heads don't have many scene changes
    framesPerMin: 2,          // Just a few frames to show who's talking
    maxFrames: 50,
    inlineFrames: 10,
    transcribe: true,
    whisperModel: "base",
    maxTranscriptChars: 50000, // More transcript since that's the focus
    description: "Optimized for interviews and podcasts. Prioritizes transcription over visual frames.",
  },
  surveillance: {
    frameMode: "scene",
    sceneThreshold: 0.5,      // High threshold - only major changes
    minSceneInterval: 30,     // Long minimum interval
    maxFrames: 50,
    inlineFrames: 10,
    transcribe: false,        // Usually no meaningful audio
    description: "Optimized for security/dashcam footage. Only captures significant visual changes.",
  },
  sports: {
    frameMode: "interval",    // Constant action, scene detection less useful
    framesPerMin: 12,         // Higher frame rate for action
    maxFrames: 300,
    inlineFrames: 20,
    transcribe: true,
    whisperModel: "base",
    description: "Optimized for sports and live events. Higher frame rate captures fast action.",
  },
  unknown: {
    frameMode: "scene",
    sceneThreshold: 0.3,
    minSceneInterval: 2,
    maxFrames: 200,
    inlineFrames: 15,
    transcribe: true,
    whisperModel: "base",
    description: "Balanced defaults for unknown content types.",
  },
};

/**
 * Objective modifiers - these adjust the base preset
 */
export const OBJECTIVE_MODIFIERS: Record<Objective, Partial<PresetConfig>> = {
  summary: {
    maxFrames: 50,
    inlineFrames: 10,
    maxTranscriptChars: 10000,
    description: "Quick overview - fewer frames, shorter transcript excerpt.",
  },
  detailed: {
    maxFrames: 300,
    inlineFrames: 30,
    sceneThreshold: 0.2,      // Capture more scenes
    maxTranscriptChars: 50000,
    whisperModel: "small",
    description: "Thorough analysis - more frames, full transcript, better transcription model.",
  },
  find_moment: {
    maxFrames: 200,
    inlineFrames: 25,
    sceneThreshold: 0.25,
    transcribe: true,
    description: "Optimized for finding specific content - more frames with timestamps.",
  },
  transcribe: {
    maxFrames: 30,
    inlineFrames: 5,
    transcribe: true,
    whisperModel: "small",
    maxTranscriptChars: 100000,
    description: "Focus on audio - minimal frames, comprehensive transcription.",
  },
  visual_only: {
    transcribe: false,
    maxFrames: 250,
    inlineFrames: 30,
    description: "Visual analysis only - no transcription, maximum frame coverage.",
  },
  quick_scan: {
    maxFrames: 30,
    inlineFrames: 8,
    transcribe: false,
    minSceneInterval: 10,
    description: "Fast preview - minimal processing, just key frames.",
  },
};

/**
 * Build a complete configuration by combining video type preset with objective modifier
 */
export function buildPreset(
  videoType: VideoType = "unknown",
  objective: Objective = "summary"
): PresetConfig {
  const base: PresetConfig = {
    frameMode: "scene",
    sceneThreshold: 0.3,
    minSceneInterval: 2,
    framesPerMin: 6,
    maxFrames: 200,
    inlineFrames: 15,
    transcribe: true,
    whisperModel: "base",
    maxTranscriptChars: 20000,
    description: "",
  };

  // Apply video type preset
  const typePreset = VIDEO_TYPE_PRESETS[videoType] || VIDEO_TYPE_PRESETS.unknown;
  Object.assign(base, typePreset);

  // Apply objective modifier
  const objModifier = OBJECTIVE_MODIFIERS[objective];
  Object.assign(base, objModifier);

  // Build combined description
  base.description = `${typePreset.description || ""} ${objModifier.description || ""}`.trim();

  return base;
}

/**
 * Suggest a video type based on filename and metadata
 */
export function suggestVideoType(
  filename: string,
  durationSec?: number,
  resolution?: { width?: number; height?: number }
): { type: VideoType; confidence: number; reason: string } {
  const name = filename.toLowerCase();

  // Check filename patterns
  if (name.includes("screen") || name.includes("capture") || name.includes("record") ||
      name.includes("tutorial") || name.includes("demo") || name.includes("coding")) {
    return { type: "screencast", confidence: 0.8, reason: "Filename suggests screen recording" };
  }

  if (name.includes("presentation") || name.includes("slides") || name.includes("keynote") ||
      name.includes("lecture") || name.includes("talk")) {
    return { type: "presentation", confidence: 0.8, reason: "Filename suggests presentation" };
  }

  if (name.includes("interview") || name.includes("podcast") || name.includes("conversation") ||
      name.includes("chat")) {
    return { type: "interview", confidence: 0.7, reason: "Filename suggests interview/podcast" };
  }

  if (name.includes("game") || name.includes("match") || name.includes("sport")) {
    return { type: "sports", confidence: 0.7, reason: "Filename suggests sports content" };
  }

  if (name.includes("cam") || name.includes("surveillance") || name.includes("security") ||
      name.includes("cctv") || name.includes("dashcam")) {
    return { type: "surveillance", confidence: 0.8, reason: "Filename suggests surveillance footage" };
  }

  // Check resolution for screencast detection (non-standard aspect ratios)
  if (resolution?.width && resolution?.height) {
    const aspect = resolution.width / resolution.height;
    // Ultrawide or unusual aspect ratios often indicate screencasts
    if (aspect > 2.0 || (aspect > 1.5 && aspect < 1.7 && aspect !== 16/10)) {
      return { type: "screencast", confidence: 0.6, reason: "Unusual aspect ratio suggests screen recording" };
    }
  }

  // Check duration
  if (durationSec && durationSec > 3600 * 2) {
    return { type: "surveillance", confidence: 0.4, reason: "Very long duration suggests surveillance or stream" };
  }

  return { type: "unknown", confidence: 0.3, reason: "Could not determine video type from metadata" };
}

/**
 * Get all available presets for display
 */
export function listPresets(): {
  videoTypes: { name: VideoType; description: string }[];
  objectives: { name: Objective; description: string }[];
} {
  return {
    videoTypes: Object.entries(VIDEO_TYPE_PRESETS).map(([name, config]) => ({
      name: name as VideoType,
      description: config.description || "",
    })),
    objectives: Object.entries(OBJECTIVE_MODIFIERS).map(([name, config]) => ({
      name: name as Objective,
      description: config.description || "",
    })),
  };
}
