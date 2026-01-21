/**
 * Commands and Events - now defined via Zod schemas in schemas.ts
 * Re-exported here for backward compatibility and cleaner imports
 */
export type {
  PublishNewsCommand,
  PublishHiddenNewsCommand,
  PatchNewsCommand,
  GameOverCommand,
  RollDiceCommand,
  Command,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
  NewsOpenedEvent,
  NewsClosedEvent,
  ScenarioHeadCompletedEvent,
  GameOverEvent,
  TurnStartedEvent,
  TurnFinishedEvent,
  DiceRolledEvent,
  EngineEvent,
  ScenarioEvent,
  PreparedPrompt,
} from './schemas.js';

/**
 * CONTEXT & CONFIGURATION
 * These are runtime interfaces that cannot be reduced to Zod schemas
 */
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

// Import EngineEvent type for use in the interfaces above
import type { EngineEvent } from './schemas.js';
