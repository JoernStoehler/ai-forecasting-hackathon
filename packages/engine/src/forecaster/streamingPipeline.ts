import { ScenarioEventArraySchema } from '../schemas.js';
import type { ScenarioEvent } from '../types.js';

export interface ActionBatch {
  actionsJsonl: string; // raw JSONL text chunk containing 1..n actions
}

export interface ParseResult {
  events: ScenarioEvent[];
  nextHistory: ScenarioEvent[];
  nextState: ScenarioEvent[]; // placeholder; refine when state structure is expanded
}

/**
 * Streaming parser (HELLO-WORLD PLACEHOLDER):
 * - Expects JSON/JSONL of ScenarioEvents; 1 action ≙ 1 event for now.
 * - Validates each chunk with zod; no recovery or per-event state feedback yet.
 * - Emits once per chunk; nextState mirrors history until richer aggregates exist.
 *
 * EVENT SOURCING SKETCH (v0.1 target)
 *   prompt(history) -> Gemini stream -> parse/validate -> events -> history -> aggregates
 *   - LLM outputs engine events directly (NewsEvent today; later also NewsStoryOpenedEvent).
 *   - Each validated event appends to history and updates aggregates; the next streamed
 *     item should validate against the fresh aggregates (not implemented yet).
 *   - UI state is ephemeral (React-only); reducible from history + defaults; may also
 *     respond to UI-only actions without emitting engine events.
 */
export function parseActionChunk(chunk: ActionBatch, history: ScenarioEvent[]): ParseResult {
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

  const events = ScenarioEventArraySchema.parse(parsed);
  const nextHistory = [...history, ...events];
  return {
    events,
    nextHistory,
    nextState: nextHistory, // placeholder until richer state exists
  };
}
