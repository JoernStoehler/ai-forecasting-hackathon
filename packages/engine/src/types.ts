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
  postMortem?: boolean;
}

export interface OpenStoryCommand {
  type: 'open-story';
  refId: string;
  date: string; // date of the turn when the user opened it (coerced to current turn)
}

export interface CloseStoryCommand {
  type: 'close-story';
  refId: string;
  date: string;
}

export type Command = PublishNewsCommand | OpenStoryCommand | CloseStoryCommand;

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
  postMortem?: boolean;
}

export interface StoryOpenedEvent {
  type: 'story-opened';
  id: string; // same as refId
  date: string;
}

export interface StoryClosedEvent {
  type: 'story-closed';
  id: string;
  date: string;
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

export type EngineEvent =
  | NewsPublishedEvent
  | StoryOpenedEvent
  | StoryClosedEvent
  | TurnStartedEvent
  | TurnFinishedEvent;

// Back-compat alias for the current UI/CLI; equals NewsPublishedEvent.
export type ScenarioEvent = NewsPublishedEvent;

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
  /** Date (YYYY-MM-DD) when seed history ends and forecasting begins. */
  seedHistoryEndDate?: string;
}

export interface Forecaster {
  /** Human-readable identifier (for logging, error messages). */
  readonly name: string;
  forecast(context: ForecasterContext, options?: ForecasterOptions): Promise<ScenarioEvent[]>;
}

export interface EngineConfig {
  forecaster: Forecaster;
  systemPrompt?: string;
}

export interface EngineApi {
  forecast(history: ScenarioEvent[], options?: ForecasterOptions): Promise<ScenarioEvent[]>;
  merge(history: ScenarioEvent[], additions: ScenarioEvent[]): ScenarioEvent[];
  nextDate(history: ScenarioEvent[]): string;
  coerce(payload: unknown, source: string): ScenarioEvent[];
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
