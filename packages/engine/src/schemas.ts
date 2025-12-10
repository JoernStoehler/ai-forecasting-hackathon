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
  postMortem: z.boolean().optional(),
});

export const OpenStoryCommandSchema = z.object({
  type: z.literal('open-story'),
  refId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CloseStoryCommandSchema = z.object({
  type: z.literal('close-story'),
  refId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const CommandSchema = z.discriminatedUnion('type', [
  PublishNewsCommandSchema,
  OpenStoryCommandSchema,
  CloseStoryCommandSchema,
]);

export const CommandArraySchema = z.array(CommandSchema);

// Events (facts)
export const NewsPublishedEventSchema = z.object({
  type: z.literal('news-published').optional(),
  id: z.string().min(1).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
  postMortem: z.boolean().optional(),
});

export const StoryOpenedEventSchema = z.object({
  type: z.literal('story-opened'),
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const StoryClosedEventSchema = z.object({
  type: z.literal('story-closed'),
  id: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
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
  StoryOpenedEventSchema,
  StoryClosedEventSchema,
  TurnStartedEventSchema,
  TurnFinishedEventSchema,
]);

// Back-compat aliases used by webapp/CLI today (news only).
export const ScenarioEventSchema = NewsPublishedEventSchema;
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
