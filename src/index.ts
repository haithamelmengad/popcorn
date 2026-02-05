import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { analyzeVideo } from "./analyze.js";
import { readFileSlice } from "./read.js";
import { probeVideo } from "./ffmpeg.js";
import {
  VideoType,
  Objective,
  buildPreset,
  suggestVideoType,
  listPresets,
  VIDEO_TYPE_PRESETS,
  OBJECTIVE_MODIFIERS,
} from "./presets.js";
import {
  TranscriptionBackend,
  detectAvailableBackends,
  detectEnvironment,
  getBestBackend,
} from "./transcribe.js";
import path from "node:path";

const AnalyzeInput = z.object({
  path: z.string(),
  outDir: z.string().optional(),
  // NEW: Preset-based configuration
  videoType: z.enum(["screencast", "presentation", "movie", "interview", "surveillance", "sports", "unknown"]).optional(),
  objective: z.enum(["summary", "detailed", "find_moment", "transcribe", "visual_only", "quick_scan"]).optional(),
  // Manual overrides (these override preset values if specified)
  transcribe: z.boolean().optional(),
  backend: z.enum(["auto", "whisper", "whisper-cpp", "mlx-whisper", "faster-whisper"]).optional(),
  language: z.string().optional(),
  model: z.string().optional(),
  frameMode: z.enum(["interval", "scene"]).optional(),
  framesPerMin: z.number().positive().optional(),
  maxFrames: z.number().int().positive().optional(),
  sceneThreshold: z.number().min(0).max(1).optional(),
  minSceneInterval: z.number().positive().optional(),
  inlineFrames: z.number().int().min(0).optional(),
  maxChunkChars: z.number().int().positive().optional(),
  maxTranscriptChars: z.number().int().positive().optional(),
});

const ReadInput = z.object({
  path: z.string(),
  startLine: z.number().int().optional(),
  endLine: z.number().int().optional(),
  maxChars: z.number().int().optional().default(20000),
  startSec: z.number().optional(),
  endSec: z.number().optional(),
});

const SuggestInput = z.object({
  path: z.string(),
});

const server = new Server(
  {
    name: "popcorn",
    version: "0.4.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "popcorn_suggest",
      description:
        "Probe a video file and get suggested analysis settings. Returns video metadata, suggested video type, and recommended presets. Use this FIRST to understand the video and choose appropriate settings before running popcorn_analyze.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to the video file to analyze." },
        },
        required: ["path"],
      },
    },
    {
      name: "popcorn_presets",
      description:
        "List all available video type presets and objectives. Use this to understand what options are available for popcorn_analyze.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
    {
      name: "popcorn_analyze",
      description:
        "Analyze a video file. Extracts keyframes and transcripts. RECOMMENDED: First use popcorn_suggest to get optimal settings, or specify videoType and objective to use smart presets.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to the video file." },
          outDir: { type: "string", description: "Output directory for analysis bundle." },
          // Preset options (RECOMMENDED)
          videoType: {
            type: "string",
            enum: ["screencast", "presentation", "movie", "interview", "surveillance", "sports", "unknown"],
            description: "Type of video content. This auto-configures optimal settings. Options: screencast (UI recordings, tutorials), presentation (slides, lectures), movie (films, TV), interview (podcasts, talking heads), surveillance (security footage), sports (live action).",
          },
          objective: {
            type: "string",
            enum: ["summary", "detailed", "find_moment", "transcribe", "visual_only", "quick_scan"],
            description: "What you want to accomplish. Options: summary (quick overview), detailed (thorough analysis), find_moment (searching for something specific), transcribe (focus on audio), visual_only (no transcription), quick_scan (fast preview).",
          },
          // Manual overrides
          transcribe: { type: "boolean", description: "Override: whether to transcribe audio." },
          backend: {
            type: "string",
            enum: ["auto", "whisper", "whisper-cpp", "mlx-whisper", "faster-whisper"],
            description: "Transcription backend. 'auto' picks the best available. Options: whisper (OpenAI, most compatible), whisper-cpp (fast C++), mlx-whisper (Apple Silicon optimized), faster-whisper (GPU accelerated).",
          },
          language: { type: "string", description: "Transcription language code (e.g., 'en')." },
          model: { type: "string", description: "Whisper model: tiny, base, small, medium, large." },
          frameMode: {
            type: "string",
            enum: ["interval", "scene"],
            description: "Override: 'scene' detects visual changes, 'interval' uses fixed timing.",
          },
          framesPerMin: { type: "number", description: "Override: frames per minute (interval mode)." },
          maxFrames: { type: "number", description: "Override: maximum frames to extract." },
          sceneThreshold: { type: "number", description: "Override: scene sensitivity 0-1 (lower = more frames)." },
          minSceneInterval: { type: "number", description: "Override: minimum seconds between scene frames." },
          inlineFrames: { type: "number", description: "Override: frames to return as base64 in response." },
          maxChunkChars: { type: "number", description: "Override: transcript chunk size." },
          maxTranscriptChars: { type: "number", description: "Override: transcript excerpt length." },
        },
        required: ["path"],
      },
    },
    {
      name: "popcorn_read",
      description:
        "Read a file from an analysis bundle with optional line slicing or transcript time filtering.",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to the file to read." },
          startLine: { type: "number", description: "1-based line to start reading." },
          endLine: { type: "number", description: "1-based line to stop reading." },
          maxChars: { type: "number", description: "Maximum characters to return.", default: 20000 },
          startSec: { type: "number", description: "Start time in seconds (transcript JSON filtering)." },
          endSec: { type: "number", description: "End time in seconds (transcript JSON filtering)." },
        },
        required: ["path"],
      },
    },
    {
      name: "popcorn_backends",
      description:
        "List available transcription backends on this system. Shows which backends are installed and ready to use. Use this to help users choose the best transcription option.",
      inputSchema: {
        type: "object",
        properties: {},
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const tool = request.params.name;
  const args = request.params.arguments ?? {};

  switch (tool) {
    case "popcorn_suggest": {
      const input = SuggestInput.parse(args);
      const videoInfo = await probeVideo(input.path);
      const filename = path.basename(input.path);

      // Suggest video type based on metadata
      const suggestion = suggestVideoType(
        filename,
        videoInfo.durationSec,
        videoInfo.video
      );

      // Build example presets for common objectives
      const examplePresets = {
        forSummary: buildPreset(suggestion.type, "summary"),
        forDetailed: buildPreset(suggestion.type, "detailed"),
        forTranscription: buildPreset(suggestion.type, "transcribe"),
      };

      // Format duration nicely
      const durationMin = videoInfo.durationSec
        ? Math.round(videoInfo.durationSec / 60)
        : null;

      const response = {
        video: {
          path: input.path,
          filename,
          durationSec: videoInfo.durationSec,
          durationFormatted: durationMin ? `${durationMin} minutes` : "unknown",
          resolution: videoInfo.video?.width && videoInfo.video?.height
            ? `${videoInfo.video.width}x${videoInfo.video.height}`
            : "unknown",
          fps: videoInfo.video?.fps,
          videoCodec: videoInfo.video?.codec,
          audioCodec: videoInfo.audio?.codec,
          sizeBytes: videoInfo.sizeBytes,
          sizeMB: videoInfo.sizeBytes ? Math.round(videoInfo.sizeBytes / 1024 / 1024) : null,
        },
        suggestion: {
          videoType: suggestion.type,
          confidence: suggestion.confidence,
          reason: suggestion.reason,
        },
        questions: [
          {
            question: "What type of video is this?",
            options: Object.keys(VIDEO_TYPE_PRESETS),
            suggested: suggestion.type,
            description: "This affects scene detection sensitivity and frame extraction strategy.",
          },
          {
            question: "What is your objective?",
            options: Object.keys(OBJECTIVE_MODIFIERS),
            suggested: durationMin && durationMin > 30 ? "summary" : "detailed",
            description: "This determines how thorough the analysis should be.",
          },
        ],
        recommendedCall: {
          tool: "popcorn_analyze",
          arguments: {
            path: input.path,
            videoType: suggestion.type,
            objective: "summary",
          },
          description: "Suggested popcorn_analyze call based on detected video type.",
        },
        examplePresets,
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2),
        }],
      };
    }

    case "popcorn_backends": {
      const backends = await detectAvailableBackends();
      const environment = await detectEnvironment();
      const bestBackend = await getBestBackend();

      const response = {
        description: "Transcription backends - auto-detected for your system.",

        environment: {
          platform: environment.platform,
          architecture: environment.arch,
          isAppleSilicon: environment.isAppleSilicon,
          hasNvidiaGpu: environment.hasNvidiaGpu,
          pythonAvailable: environment.pythonAvailable,
        },

        recommendation: {
          backend: environment.recommendedBackend,
          reason: environment.recommendationReason,
          currentlyAvailable: bestBackend,
        },

        installSuggestions: environment.allRecommendations.map(r => ({
          backend: r.backend,
          reason: r.reason,
          command: r.installCommand,
        })),

        availableBackends: backends.map(b => ({
          name: b.name,
          status: b.available ? "✓ installed" : "✗ not installed",
          available: b.available,
          description: b.description,
          speed: b.speed,
          estimatedTime: b.estimatedTimeFor60Min,
          install: b.installHint,
        })),

        usage: {
          note: "Use the 'backend' parameter in popcorn_analyze to choose a specific backend.",
          examples: [
            { description: "Auto-select best available", args: {} },
            { description: "Force specific backend", args: { backend: "mlx-whisper" } },
            { description: "Skip transcription", args: { transcribe: false } },
          ],
        },
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2),
        }],
      };
    }

    case "popcorn_presets": {
      const presets = listPresets();

      const response = {
        description: "Available presets for popcorn_analyze. Combine a videoType with an objective for optimal settings.",
        videoTypes: presets.videoTypes.map(vt => ({
          name: vt.name,
          description: vt.description,
          bestFor: {
            screencast: "Screen recordings, coding tutorials, UI demos",
            presentation: "Slide decks, keynotes, lectures",
            movie: "Films, TV shows, cinematic content",
            interview: "Podcasts, talking heads, conversations",
            surveillance: "Security cameras, dashcam, static footage",
            sports: "Live events, fast action, games",
            unknown: "When you're not sure - uses balanced defaults",
          }[vt.name] || "",
        })),
        objectives: presets.objectives.map(obj => ({
          name: obj.name,
          description: obj.description,
          useWhen: {
            summary: "You want a quick overview of the video content",
            detailed: "You need thorough analysis and don't want to miss anything",
            find_moment: "You're searching for a specific scene, topic, or timestamp",
            transcribe: "The audio/speech content is most important",
            visual_only: "You only care about what's shown, not what's said",
            quick_scan: "You need a fast preview with minimal processing time",
          }[obj.name] || "",
        })),
        examples: [
          {
            scenario: "Analyzing a coding tutorial",
            call: { videoType: "screencast", objective: "detailed" },
          },
          {
            scenario: "Quick summary of a long presentation",
            call: { videoType: "presentation", objective: "summary" },
          },
          {
            scenario: "Finding a specific quote in a podcast",
            call: { videoType: "interview", objective: "find_moment" },
          },
          {
            scenario: "Getting full transcript of a lecture",
            call: { videoType: "presentation", objective: "transcribe" },
          },
        ],
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(response, null, 2),
        }],
      };
    }

    case "popcorn_analyze": {
      const input = AnalyzeInput.parse(args);

      // Build configuration from presets + overrides
      const preset = buildPreset(
        (input.videoType as VideoType) || "unknown",
        (input.objective as Objective) || "summary"
      );

      // Apply manual overrides
      const config = {
        outDir: input.outDir,
        transcribe: input.transcribe ?? preset.transcribe,
        backend: (input.backend as TranscriptionBackend) ?? "auto",
        language: input.language,
        model: input.model ?? preset.whisperModel,
        frameMode: input.frameMode ?? preset.frameMode,
        framesPerMin: input.framesPerMin ?? preset.framesPerMin,
        maxFrames: input.maxFrames ?? preset.maxFrames,
        sceneThreshold: input.sceneThreshold ?? preset.sceneThreshold,
        minSceneInterval: input.minSceneInterval ?? preset.minSceneInterval,
        inlineFrames: input.inlineFrames ?? preset.inlineFrames,
        maxChunkChars: input.maxChunkChars ?? 2000,
        maxTranscriptChars: input.maxTranscriptChars ?? preset.maxTranscriptChars,
      };

      const result = await analyzeVideo(input.path, config);

      // Build MCP response with text metadata + inline images
      const content: Array<{ type: "text"; text: string } | { type: "image"; data: string; mimeType: string }> = [];

      // Add metadata as text (exclude base64 data to keep it readable)
      const metadataResult = {
        configUsed: {
          videoType: input.videoType || "unknown",
          objective: input.objective || "summary",
          presetDescription: preset.description,
          ...config,
        },
        ...result,
        inlineFrames: result.inlineFrames
          ? { count: result.inlineFrames.length, note: "Images included below as separate content blocks" }
          : undefined,
      };
      content.push({
        type: "text",
        text: JSON.stringify(metadataResult, null, 2),
      });

      // Add inline frames as MCP image content blocks
      if (result.inlineFrames && result.inlineFrames.length > 0) {
        for (const frame of result.inlineFrames) {
          content.push({
            type: "image",
            data: frame.base64,
            mimeType: frame.mimeType,
          });
        }
      }

      return { content };
    }

    case "popcorn_read": {
      const input = ReadInput.parse(args);
      const result = await readFileSlice({
        path: input.path,
        startLine: input.startLine,
        endLine: input.endLine,
        maxChars: input.maxChars,
        startSec: input.startSec,
        endSec: input.endSec,
      });

      const payload = {
        truncated: result.truncated,
        content: result.content,
      };

      return {
        content: [{
          type: "text",
          text: JSON.stringify(payload, null, 2),
        }],
      };
    }

    default:
      throw new Error(`Unknown tool: ${tool}`);
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Popcorn MCP server failed:", error);
  process.exit(1);
});
