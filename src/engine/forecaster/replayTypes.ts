import { z } from 'zod';

/**
 * Replay types for recorded Gemini streaming sessions.
 * All types are inferred from Zod schemas for consistency.
 */

export const ReplayChunkSchema = z.object({
  delayNs: z.number().nonnegative(),
  text: z.string(),
});
export type ReplayChunk = z.infer<typeof ReplayChunkSchema>;

export const ReplayRequestSchema = z.object({
  model: z.string(),
  contents: z.string(),
  config: z.any(),
});
export type ReplayRequest = z.infer<typeof ReplayRequestSchema>;

export const ReplayTapeSchema = z.object({
  meta: z.object({
    label: z.string().optional(),
    model: z.string(),
    recordedAt: z.string(),
    sdk: z.string().optional(),
    comment: z.string().optional(),
  }),
  request: ReplayRequestSchema,
  stream: z.array(ReplayChunkSchema),
});
export type ReplayTape = z.infer<typeof ReplayTapeSchema>;
