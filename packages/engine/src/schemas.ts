import { z } from 'zod';
import { ICON_SET } from './constants.js';

const ContentPartSchema = z.object({
  text: z.string(),
});

const ContentSchema = z.object({
  role: z.string(),
  parts: z.array(ContentPartSchema),
});

const ICON_VALUES = [...ICON_SET] as [typeof ICON_SET[number], ...typeof ICON_SET[number][]];

// Commands (intent)
export const PublishNewsCommandSchema = z.object({
  type: z.literal('publish-news'),
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const PublishHiddenNewsCommandSchema = z.object({
  type: z.literal('publish-hidden-news'),
  id: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const NewsPatchSchema = z
  .object({
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    icon: z.enum(ICON_VALUES).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .refine(patch => Object.keys(patch).length > 0, {
    message: 'Patch must include at least one field.',
  });

export const PatchNewsCommandSchema = z.object({
  type: z.literal('patch-news'),
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  patch: NewsPatchSchema,
});

export const GameOverCommandSchema = z.object({
  type: z.literal('game-over'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1),
});

export const CommandSchema = z.discriminatedUnion('type', [
  PublishNewsCommandSchema,
  PublishHiddenNewsCommandSchema,
  PatchNewsCommandSchema,
  GameOverCommandSchema,
]);

export const CommandArraySchema = z.array(CommandSchema);

// Events (facts)
export const NewsPublishedEventSchema = z.object({
  type: z.literal('news-published'),
  id: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const HiddenNewsPublishedEventSchema = z.object({
  type: z.literal('hidden-news-published'),
  id: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});

export const NewsPatchedEventSchema = z.object({
  type: z.literal('news-patched'),
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  patch: NewsPatchSchema,
});

export const ScenarioHeadCompletedEventSchema = z.object({
  type: z.literal('scenario-head-completed'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GameOverEventSchema = z.object({
  type: z.literal('game-over'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  summary: z.string().min(1),
});

export const TurnStartedEventSchema = z.object({
  type: z.literal('turn-started'),
  actor: z.enum(['player', 'game_master']),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const TurnFinishedEventSchema = z.object({
  type: z.literal('turn-finished'),
  actor: z.enum(['player', 'game_master']),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  until: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const EngineEventSchema = z.discriminatedUnion('type', [
  NewsPublishedEventSchema,
  HiddenNewsPublishedEventSchema,
  NewsPatchedEventSchema,
  ScenarioHeadCompletedEventSchema,
  GameOverEventSchema,
  TurnStartedEventSchema,
  TurnFinishedEventSchema,
]);

export const ScenarioEventSchema = z.discriminatedUnion('type', [
  NewsPublishedEventSchema,
  HiddenNewsPublishedEventSchema,
]);
export const ScenarioEventArraySchema = z.array(ScenarioEventSchema);

// Prepared prompt structure used by CLI; content/config kept minimal on purpose.
export const PreparedPromptSchema = z.object({
  model: z.string(),
  request: z.object({
    model: z.string(),
    contents: z.array(ContentSchema),
    config: z.object({
      systemInstruction: z.string(),
      responseMimeType: z.string(),
    }),
  }),
  materialsUsed: z.array(z.string()),
});

export type PreparedPromptInput = z.infer<typeof PreparedPromptSchema>;
