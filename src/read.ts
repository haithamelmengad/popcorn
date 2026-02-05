import fs from "node:fs/promises";
import path from "node:path";

export type ReadOptions = {
  path: string;
  startLine?: number;
  endLine?: number;
  maxChars?: number;
  startSec?: number;
  endSec?: number;
};

function sliceLines(content: string, startLine?: number, endLine?: number): string {
  if (!startLine && !endLine) return content;
  const lines = content.split(/\r?\n/);
  const start = Math.max(0, (startLine ?? 1) - 1);
  const end = Math.min(lines.length, endLine ?? lines.length);
  return lines.slice(start, end).join("\n");
}

function clampText(content: string, maxChars?: number): string {
  if (!maxChars || content.length <= maxChars) return content;
  return content.slice(0, maxChars) + "\n...[truncated]";
}

export async function readFileSlice(options: ReadOptions): Promise<{ content: string; truncated: boolean }> {
  const ext = path.extname(options.path).toLowerCase();

  if (ext === ".json" && (options.startSec !== undefined || options.endSec !== undefined)) {
    const raw = await fs.readFile(options.path, "utf8");
    const json = JSON.parse(raw);
    if (Array.isArray(json.segments)) {
      const start = options.startSec ?? 0;
      const end = options.endSec ?? Number.POSITIVE_INFINITY;
      const segments = json.segments.filter((segment: any) => {
        const segStart = Number(segment.start ?? 0);
        const segEnd = Number(segment.end ?? 0);
        return segEnd >= start && segStart <= end;
      });
      const filtered = { ...json, segments };
      const content = JSON.stringify(filtered, null, 2);
      const trimmed = clampText(content, options.maxChars);
      return { content: trimmed, truncated: trimmed !== content };
    }
  }

  const content = await fs.readFile(options.path, "utf8");
  const sliced = sliceLines(content, options.startLine, options.endLine);
  const trimmed = clampText(sliced, options.maxChars);
  return { content: trimmed, truncated: trimmed !== sliced };
}
