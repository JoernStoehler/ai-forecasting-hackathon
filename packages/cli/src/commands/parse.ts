import { readFile } from 'node:fs/promises';
import {
  CommandArraySchema,
  EngineEventSchema,
  type Command,
  type EngineEvent,
  normalizePublishNews,
} from '@ai-forecasting/engine';
import { formatZodIssues, writeEventsJsonl } from './eventIo.js';

// Parses a raw Gemini response file into validated EngineEvents JSONL.
export async function runParse(opts: {
  inputJson: string;
  outputEvents: string;
}) {
  const raw = await readFile(opts.inputJson, 'utf-8');
  const { commands } = extractCommands(raw);
  const events = commands.flatMap(commandToEvents);
  const validated = EngineEventSchema.array().parse(events);
  await writeEventsJsonl(opts.outputEvents, validated);
}

function extractCommands(raw: string): { commands: Command[]; source: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error('parse: input file is empty.');
  }

  let parsed: unknown | null = null;
  try {
    parsed = JSON.parse(trimmed);
  } catch {
    parsed = null;
  }

  if (parsed !== null) {
    const direct = CommandArraySchema.safeParse(parsed);
    if (direct.success) {
      return { commands: direct.data, source: 'direct-json' };
    }
  }

  const text = parsed !== null ? extractText(parsed) : trimmed;
  if (!text || !text.trim()) {
    throw new Error('parse: no model text found in input JSON (expected response.text or chunks[].text).');
  }

  return parseCommandsFromText(text);
}

function parseCommandsFromText(text: string): { commands: Command[]; source: string } {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new Error('parse: model text was empty after trimming.');
  }

  const parsed = tryParseJson(trimmed);
  if (parsed.ok) {
    return {
      commands: parseCommandArray(parsed.value, 'model-text (JSON)'),
      source: 'model-text-json',
    };
  }

  const parsedJsonl = tryParseJsonl(trimmed);
  if (parsedJsonl.ok) {
    return {
      commands: parseCommandArray(parsedJsonl.value, 'model-text (JSONL)'),
      source: 'model-text-jsonl',
    };
  }

  const snippet = summarize(trimmed);
  throw new Error(
    `parse: model text is not valid JSON/JSONL.\n- JSON error: ${parsed.error}\n- JSONL error: ${parsedJsonl.error}\n- Excerpt: ${snippet}`
  );
}

function parseCommandArray(payload: unknown, label: string): Command[] {
  const result = CommandArraySchema.safeParse(payload);
  if (result.success) return result.data;
  throw new Error(`parse: ${label} does not match Command[] schema.\n${formatZodIssues(result.error.issues)}`);
}

function commandToEvents(cmd: Command): EngineEvent[] {
  switch (cmd.type) {
    case 'publish-news':
      return [normalizePublishNews(cmd)];
    case 'open-story':
      return [{ type: 'story-opened', id: cmd.refId, date: cmd.date }];
    case 'close-story':
      return [{ type: 'story-closed', id: cmd.refId, date: cmd.date }];
    default:
      return [];
  }
}

function extractText(parsed: unknown): string | null {
  if (typeof parsed === 'string') return parsed;
  if (!parsed || typeof parsed !== 'object') return null;

  const candidate = parsed as Record<string, unknown>;
  const directText = readTextField(candidate);
  if (directText) return directText;

  if (Array.isArray(candidate.chunks)) {
    const chunkText = candidate.chunks
      .map(chunk => extractText(chunk))
      .filter(Boolean)
      .join('');
    if (chunkText) return chunkText;
  }

  if (candidate.response) {
    const responseText = extractText(candidate.response);
    if (responseText) return responseText;
  }

  if (Array.isArray(candidate.candidates)) {
    const partsText = extractTextFromCandidates(candidate.candidates);
    if (partsText) return partsText;
  }

  if (candidate.content) {
    const contentText = extractTextFromContent(candidate.content);
    if (contentText) return contentText;
  }

  return null;
}

function extractTextFromCandidates(candidates: unknown[]): string | null {
  const parts: string[] = [];
  for (const candidate of candidates) {
    const value = extractTextFromContent((candidate as { content?: unknown }).content);
    if (value) parts.push(value);
    const direct = readTextField(candidate as Record<string, unknown>);
    if (direct) parts.push(direct);
  }
  return parts.length ? parts.join('') : null;
}

function extractTextFromContent(content: unknown): string | null {
  if (!content || typeof content !== 'object') return null;
  const parts = (content as { parts?: unknown }).parts;
  if (!Array.isArray(parts)) return null;
  const textParts = parts
    .map(part => readTextField(part as Record<string, unknown>))
    .filter(Boolean);
  return textParts.length ? textParts.join('') : null;
}

function readTextField(value: Record<string, unknown> | null | undefined): string | null {
  if (!value) return null;
  const text = value.text;
  return typeof text === 'string' ? text : null;
}

function tryParseJson(text: string): { ok: true; value: unknown } | { ok: false; error: string } {
  try {
    return { ok: true, value: JSON.parse(text) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

function tryParseJsonl(text: string): { ok: true; value: unknown[] } | { ok: false; error: string } {
  const lines = text.split(/\r?\n/).filter(Boolean);
  try {
    return { ok: true, value: lines.map(line => JSON.parse(line)) };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, error: message };
  }
}

function summarize(text: string, limit = 320) {
  const singleLine = text.replace(/\s+/g, ' ').trim();
  if (singleLine.length <= limit) return singleLine;
  return `${singleLine.slice(0, limit)}…`;
}
