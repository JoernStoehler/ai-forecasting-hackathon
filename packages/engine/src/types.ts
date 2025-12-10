import type { IconName } from './constants';
import type { GenerateContentConfig, Content } from '@google/genai';

/**
 * Core event entity shared by webapp and CLI.
 */
export interface ScenarioEvent {
  /** ISO date in YYYY-MM-DD */
  date: string;
  /** Lucide icon name (PascalCase) */
  icon: IconName;
  /** Short headline */
  title: string;
  /** Supporting detail */
  description: string;
  /** Hidden until a post-mortem phase is toggled */
  postMortem?: boolean;
}

export interface ForecasterContext {
  history: ScenarioEvent[];
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
  events: ScenarioEvent[];
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
