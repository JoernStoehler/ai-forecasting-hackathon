import { z } from 'zod';
import type { NewsPublishedEvent } from '../types.js';

/**
 * Recorded Gemini streaming session for one request. Stored as JSON (not JSONL).
 */
export interface ReplayChunk {
  /** Delay since previous chunk, in nanoseconds. */
  delayNs: number;
  /** Raw text chunk exactly as yielded by the SDK (after toString). */
  text: string;
}

export interface ReplayTape {
  meta: {
    label?: string;
    model: string;
    recordedAt: string; // ISO date
    sdk?: string;
    comment?: string;
  };
  request: {
    model: string;
    systemPrompt: string;
    materialsUsed?: string[];
    /** History sent to the model; should be news-only. */
    history: NewsPublishedEvent[];
  };
  stream: ReplayChunk[];
}

/** Zod schemas for validation (runtime). */
export const ReplayChunkSchema = z.object({
  delayNs: z.number().nonnegative(),
  text: z.string(),
});

export const ReplayTapeSchema = z.object({
  meta: z.object({
    label: z.string().optional(),
    model: z.string(),
    recordedAt: z.string(),
    sdk: z.string().optional(),
    comment: z.string().optional(),
  }),
  request: z.object({
    model: z.string(),
    systemPrompt: z.string(),
    materialsUsed: z.array(z.string()).optional(),
    history: z.any(), // validated downstream to avoid circular import
  }),
  stream: z.array(ReplayChunkSchema),
});

