import { readFile, writeFile } from 'node:fs/promises';
import type { GenAIClient } from './geminiStreaming.js';
import type { GenerateContentConfig } from '@google/genai';
import { ReplayTapeSchema, type ReplayTape, type ReplayChunk, type ReplayRequest } from './replayTypes.js';

/**
 * Loads and validates a replay tape JSON file.
 */
export async function loadReplayTape(path: string): Promise<ReplayTape> {
  const text = await readFile(path, 'utf-8');
  const parsed = ReplayTapeSchema.parse(JSON.parse(text)) as ReplayTape;
  return parsed;
}

/**
 * Creates a mock GenAI client that replays a recorded stream with delays.
 * Use with streamGeminiRaw or directly with createReplayForecaster.
 */
export function createReplayGenAIClient(tape: ReplayTape): GenAIClient {
  return {
    models: {
      generateContentStream: (args: { model: string; contents: string; config: GenerateContentConfig }) => {
        assertRequestMatches(tape, args);
        const run = async function* () {
          for (const chunk of tape.stream) {
            if (chunk.delayNs && chunk.delayNs > 0) {
              await delayNs(chunk.delayNs);
            }
            yield { text: chunk.text };
          }
        };
        return run();
      },
    },
  };
}

/**
 * Wraps a real GenAI client and records the streaming chunks (with delays) to disk.
 * Does not alter streamed output.
 */
export function createRecordingGenAIClient(opts: {
  baseClient: GenAIClient;
  tapePath: string;
  meta?: { label?: string; comment?: string; sdk?: string };
}) : GenAIClient {
  const { baseClient, tapePath, meta } = opts;

  return {
    models: {
      generateContentStream: (args: { model: string; contents: string; config: GenerateContentConfig }) => {
        const stream = baseClient.models.generateContentStream(args);
        const run = async function* () {
          const chunks: ReplayChunk[] = [];
          let last = process.hrtime.bigint();

          for await (const part of stream as AsyncIterable<{ text?: string | (() => string) }>) {
            const now = process.hrtime.bigint();
            const delayNs = Number(now - last);
            last = now;
            const text = extractText(part);
            chunks.push({ delayNs, text });
            yield { text };
          }

          // Persist tape after stream completes.
          const tape: ReplayTape = {
            meta: {
              model: args.model,
              recordedAt: new Date().toISOString(),
              sdk: meta?.sdk ?? '@google/genai',
              label: meta?.label,
              comment: meta?.comment,
            },
            request: {
              model: args.model,
              contents: args.contents,
              config: args.config,
            },
            stream: chunks,
          };
          await writeFile(tapePath, JSON.stringify(tape, null, 2), 'utf-8');
        };
        return run();
      },
    },
  };
}

function assertRequestMatches(
  tape: ReplayTape,
  args: { model: string; contents: string; config: GenerateContentConfig }
) {
  const incoming: ReplayRequest = {
    model: args.model,
    contents: args.contents,
    config: args.config,
  };
  if (JSON.stringify(incoming) !== JSON.stringify(tape.request)) {
    throw new Error('Replay request mismatch.');
  }
}

function extractText(part: { text?: string | (() => string) }) {
  const chunk = part?.text;
  return typeof chunk === 'function' ? chunk() : chunk ?? '';
}

function delayNs(ns: number): Promise<void> {
  const ms = Math.max(0, Math.floor(ns / 1_000_000));
  return new Promise(resolve => setTimeout(resolve, ms));
}
