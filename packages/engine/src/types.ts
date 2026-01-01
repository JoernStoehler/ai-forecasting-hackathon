import type { IconName } from './constants';
import type { GenerateContentConfig, Content } from '@google/genai';

/**
 * COMMANDS (intent)
 * These are produced by the LLM or player/UI, validated, then turned into events.
 */
export interface PublishNewsCommand {
  type: 'publish-news';
  id?: string;
  date: string; // YYYY-MM-DD
  icon: IconName;
  title: string;
  description: string;
}

export interface PublishHiddenNewsCommand {
  type: 'publish-hidden-news';
  id?: string;
  date: string; // YYYY-MM-DD
  icon: IconName;
  title: string;
  description: string;
}

export interface PatchNewsCommand {
  type: 'patch-news';
  id: string;
  date: string; // YYYY-MM-DD
  patch: {
    date?: string;
    icon?: IconName;
    title?: string;
    description?: string;
  };
}

export interface GameOverCommand {
  type: 'game-over';
  date: string; // YYYY-MM-DD
  summary: string;
}

export type Command =
  | PublishNewsCommand
  | PublishHiddenNewsCommand
  | PatchNewsCommand
  | GameOverCommand;

/**
 * EVENTS (facts, appended to the event log)
 */
export interface NewsPublishedEvent {
  type?: 'news-published';
  id?: string;
  date: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface HiddenNewsPublishedEvent {
  type: 'hidden-news-published';
  id?: string;
  date: string;
  icon: IconName;
  title: string;
  description: string;
}

export interface NewsPatchedEvent {
  type: 'news-patched';
  id: string;
  date: string;
  patch: {
    date?: string;
    icon?: IconName;
    title?: string;
    description?: string;
  };
}

export interface TurnStartedEvent {
  type: 'turn-started';
  actor: 'player' | 'game_master';
  from: string; // YYYY-MM-DD
  until: string; // YYYY-MM-DD
}

export interface TurnFinishedEvent {
  type: 'turn-finished';
  actor: 'player' | 'game_master';
  from: string;
  until: string;
}

export interface GameOverEvent {
  type: 'game-over';
  date: string;
  summary: string;
}

export interface ScenarioHeadCompletedEvent {
  type: 'scenario-head-completed';
  date: string;
}

export type EngineEvent =
  | NewsPublishedEvent
  | HiddenNewsPublishedEvent
  | NewsPatchedEvent
  | GameOverEvent
  | ScenarioHeadCompletedEvent
  | TurnStartedEvent
  | TurnFinishedEvent;

// Back-compat alias for news-only contexts.
export type ScenarioEvent = NewsPublishedEvent;

export type NewsEvent = NewsPublishedEvent | HiddenNewsPublishedEvent;

export interface ForecasterContext {
  history: EngineEvent[];
  systemPrompt: string;
}

export interface ForecasterOptions {
  /** Optional temperature or randomness knob; forwarded to model adapters. */
  temperature?: number;
  /** Optional seed for deterministic runs if the backend supports it. */
  seed?: number;
  /** Limit how many events a forecaster should return; enforced by adapter. */
  maxEvents?: number;
}

export interface Forecaster {
  /** Human-readable identifier (for logging, error messages). */
  readonly name: string;
  forecast(context: ForecasterContext, options?: ForecasterOptions): Promise<EngineEvent[]>;
}

export interface EngineConfig {
  forecaster: Forecaster;
  systemPrompt?: string;
}

export interface EngineApi {
  forecast(history: EngineEvent[], options?: ForecasterOptions): Promise<EngineEvent[]>;
  merge(history: EngineEvent[], additions: EngineEvent[]): EngineEvent[];
  nextDate(history: EngineEvent[]): string;
  coerce(payload: unknown, source: string): EngineEvent[];
}

export interface AggregatedState {
  events: EngineEvent[];
  latestDate: string | null;
  eventCount: number;
}

/**
 * Prepared prompt saved to disk for replay/call steps.
 * OPEN QUESTION (awaiting owner confirmation):
 * - Should `contents` stay stringified JSON (current) or be the SDK `Content[]`
 *   structure to be fully curl-ready without casting?
 * - `config` currently only carries systemInstruction + responseMimeType; add
 *   more fields once the prompt contract is locked.
 */
export interface PreparedPrompt {
  model: string;
  request: {
    model: string;
    contents: Content[]; // sendable as-is to generateContent/Stream
    config: GenerateContentConfig;
  };
  materialsUsed: string[];
}
