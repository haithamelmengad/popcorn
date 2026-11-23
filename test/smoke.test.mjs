// Smoke test: starts the built server over stdio and runs it on a tiny video.
// Needs ffmpeg on PATH and a build (npm run build).
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const server = fileURLToPath(new URL("../dist/index.js", import.meta.url));

test("server lists its tools and analyzes a tiny video", async () => {
  const dir = mkdtempSync(path.join(tmpdir(), "popcorn-test-"));
  const video = path.join(dir, "tiny.mp4");
  execFileSync("ffmpeg", [
    "-v", "error", "-y",
    "-f", "lavfi", "-i", "testsrc=duration=3:size=320x240:rate=10",
    "-f", "lavfi", "-i", "sine=duration=3",
    "-pix_fmt", "yuv420p",
    video,
  ]);

  const client = new Client({ name: "smoke-test", version: "0.0.0" });
  await client.connect(new StdioClientTransport({ command: process.execPath, args: [server], cwd: dir }));

  try {
    const { tools } = await client.listTools();
    assert.deepEqual(
      tools.map((tool) => tool.name).sort(),
      ["popcorn_analyze", "popcorn_backends", "popcorn_presets", "popcorn_read", "popcorn_suggest"]
    );

    // Transcription is off: CI has no Whisper backend.
    const result = await client.callTool({
      name: "popcorn_analyze",
      arguments: { path: video, transcribe: false, maxFrames: 3, inlineFrames: 1 },
    });
    assert.ok(!result.isError, JSON.stringify(result.content));
    const analysis = JSON.parse(result.content[0].text);
    assert.equal(analysis.ok, true);
    assert.equal(analysis.keyframes.count, 3);
    assert.equal(result.content.filter((item) => item.type === "image").length, 1);
    assert.ok(existsSync(analysis.analysisPath));

    const read = await client.callTool({ name: "popcorn_read", arguments: { path: analysis.analysisPath } });
    assert.ok(!read.isError);

    // A failed call comes back as a tool result, not a protocol error.
    const failed = await client.callTool({ name: "popcorn_analyze", arguments: { path: path.join(dir, "missing.mp4") } });
    assert.equal(failed.isError, true);
    assert.match(failed.content[0].text, /ffprobe failed/);
  } finally {
    await client.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
