import { CommandArraySchema } from '../schemas.js';
import type { Command, EngineEvent, PublishNewsCommand, PublishHiddenNewsCommand, PatchNewsCommand, RollDiceCommand } from '../types.js';
import { normalizePublishNews, normalizePublishHiddenNews, normalizePatchNews, normalizeRollDice } from '../utils/normalize.js';

export interface ActionBatch {
  actionsJsonl: string; // raw JSONL text chunk containing 1..n actions
}

export interface ParseResult {
  events: EngineEvent[];
  nextHistory: EngineEvent[];
  nextState: EngineEvent[]; // placeholder; refine when state structure is expanded
}

/**
 * Streaming parser (HELLO-WORLD PLACEHOLDER):
 * - Expects JSON/JSONL of Commands; each command maps to one EngineEvent.
 * - Validates each chunk with zod; no recovery or per-event state feedback yet.
 * - Emits once per chunk; nextState mirrors history until richer aggregates exist.
 *
 * EVENT SOURCING SKETCH (v0.1 target)
 *   prompt(history) -> Gemini stream -> parse/validate -> events -> history -> aggregates
 *   - LLM outputs engine events directly (news, hidden news, patches, game over).
 *   - Each validated event appends to history and updates aggregates; the next streamed
 *     item should validate against the fresh aggregates (not implemented yet).
 *   - UI state is ephemeral (React-only); reducible from history + defaults; may also
 *     respond to UI-only actions without emitting engine events.
 */
export function parseActionChunk(chunk: ActionBatch, history: EngineEvent[]): ParseResult {
  const text = chunk.actionsJsonl.trim();
  if (!text) {
    return { events: [], nextHistory: history, nextState: history };
  }

  // Try JSONL first; fallback to JSON array.
  const lines = text.split(/\r?\n/).filter(Boolean);
  let parsed: unknown;
  if (lines.length > 1) {
    parsed = lines.map(line => JSON.parse(line));
  } else {
    parsed = JSON.parse(text);
  }

  const commands = CommandArraySchema.parse(parsed) as Command[];
  // Process commands sequentially, updating history as we go
  const events: EngineEvent[] = [];
  let currentHistory = history;
  for (const cmd of commands) {
    const cmdEvents = commandToEvents(cmd, currentHistory);
    events.push(...cmdEvents);
    currentHistory = [...currentHistory, ...cmdEvents];
  }
  const nextHistory = currentHistory;
  return {
    events,
    nextHistory,
    nextState: nextHistory, // placeholder until richer state exists
  };
}

function commandToEvents(cmd: Command, history: EngineEvent[]): EngineEvent[] {
  if (cmd.type === 'publish-news') {
    const news = normalizePublishNews(cmd as PublishNewsCommand);
    return [news];
  }
  if (cmd.type === 'publish-hidden-news') {
    const news = normalizePublishHiddenNews(cmd as PublishHiddenNewsCommand);
    return [news];
  }
  if (cmd.type === 'patch-news') {
    const patch = normalizePatchNews(cmd as PatchNewsCommand);
    return [patch];
  }
  if (cmd.type === 'game-over') {
    return [{ type: 'game-over', date: cmd.date, summary: cmd.summary }];
  }
  if (cmd.type === 'roll-dice') {
    const diceRoll = normalizeRollDice(cmd as RollDiceCommand, history);
    return [diceRoll];
  }
  return [];
}
