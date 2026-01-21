import { z } from 'zod';
import { ICON_SET } from './constants.js';

// Simplified schemas for GenAI SDK types - actual types are more complex
// We use z.any() here to avoid type conflicts with the SDK's optional/undefined fields
const ContentSchema = z.any();

const ICON_VALUES = [...ICON_SET] as [typeof ICON_SET[number], ...typeof ICON_SET[number][]];
const DateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);
const TimestampSchema = z.string().min(1);

const NewsPatchSchema = z
  .object({
    date: DateSchema.optional(),
    icon: z.enum(ICON_VALUES).optional(),
    title: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
  })
  .refine(patch => Object.keys(patch).length > 0, {
    message: 'patch must include at least one field',
  });

// Commands (intent)
export const PublishNewsCommandSchema = z.object({
  type: z.literal('publish-news'),
  id: z.string().optional(),
  date: DateSchema,
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type PublishNewsCommand = z.infer<typeof PublishNewsCommandSchema>;

export const PublishHiddenNewsCommandSchema = z.object({
  type: z.literal('publish-hidden-news'),
  id: z.string().optional(),
  date: DateSchema,
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type PublishHiddenNewsCommand = z.infer<typeof PublishHiddenNewsCommandSchema>;

export const PatchNewsCommandSchema = z.object({
  type: z.literal('patch-news'),
  targetId: z.string().min(1),
  date: DateSchema,
  patch: NewsPatchSchema,
});
export type PatchNewsCommand = z.infer<typeof PatchNewsCommandSchema>;

export const GameOverCommandSchema = z.object({
  type: z.literal('game-over'),
  date: DateSchema,
  summary: z.string().min(1),
});
export type GameOverCommand = z.infer<typeof GameOverCommandSchema>;

export const RollDiceCommandSchema = z.object({
  type: z.literal('roll-dice'),
  label: z.string().min(1).optional(),
});
export type RollDiceCommand = z.infer<typeof RollDiceCommandSchema>;

export const CommandSchema = z.discriminatedUnion('type', [
  PublishNewsCommandSchema,
  PublishHiddenNewsCommandSchema,
  PatchNewsCommandSchema,
  GameOverCommandSchema,
  RollDiceCommandSchema,
]);
export type Command = z.infer<typeof CommandSchema>;

export const CommandArraySchema = z.array(CommandSchema);

// Events (facts)
export const NewsPublishedEventSchema = z.object({
  type: z.literal('news-published'),
  id: z.string().min(1).optional(),
  date: DateSchema,
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type NewsPublishedEvent = z.infer<typeof NewsPublishedEventSchema>;

export const HiddenNewsPublishedEventSchema = z.object({
  type: z.literal('hidden-news-published'),
  id: z.string().min(1).optional(),
  date: DateSchema,
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
});
export type HiddenNewsPublishedEvent = z.infer<typeof HiddenNewsPublishedEventSchema>;

export const NewsPatchedEventSchema = z.object({
  type: z.literal('news-patched'),
  targetId: z.string().min(1),
  date: DateSchema,
  patch: NewsPatchSchema,
});
export type NewsPatchedEvent = z.infer<typeof NewsPatchedEventSchema>;

export const NewsOpenedEventSchema = z.object({
  type: z.literal('news-opened'),
  targetId: z.string().min(1),
  at: TimestampSchema,
});
export type NewsOpenedEvent = z.infer<typeof NewsOpenedEventSchema>;

export const NewsClosedEventSchema = z.object({
  type: z.literal('news-closed'),
  targetId: z.string().min(1),
  at: TimestampSchema,
});
export type NewsClosedEvent = z.infer<typeof NewsClosedEventSchema>;

export const ScenarioHeadCompletedEventSchema = z.object({
  type: z.literal('scenario-head-completed'),
  date: DateSchema,
});
export type ScenarioHeadCompletedEvent = z.infer<typeof ScenarioHeadCompletedEventSchema>;

export const GameOverEventSchema = z.object({
  type: z.literal('game-over'),
  date: DateSchema,
  summary: z.string().min(1),
});
export type GameOverEvent = z.infer<typeof GameOverEventSchema>;

export const TurnStartedEventSchema = z.object({
  type: z.literal('turn-started'),
  actor: z.enum(['player', 'game_master']),
  from: DateSchema,
  until: DateSchema,
});
export type TurnStartedEvent = z.infer<typeof TurnStartedEventSchema>;

export const TurnFinishedEventSchema = z.object({
  type: z.literal('turn-finished'),
  actor: z.enum(['player', 'game_master']),
  from: DateSchema,
  until: DateSchema,
});
export type TurnFinishedEvent = z.infer<typeof TurnFinishedEventSchema>;

export const DiceRolledEventSchema = z.object({
  type: z.literal('dice-rolled'),
  roll: z.number().int().min(1).max(100),
  at: TimestampSchema,
  label: z.string().min(1).optional(),
});
export type DiceRolledEvent = z.infer<typeof DiceRolledEventSchema>;

export const EngineEventSchema = z.discriminatedUnion('type', [
  NewsPublishedEventSchema,
  HiddenNewsPublishedEventSchema,
  NewsPatchedEventSchema,
  NewsOpenedEventSchema,
  NewsClosedEventSchema,
  ScenarioHeadCompletedEventSchema,
  GameOverEventSchema,
  TurnStartedEventSchema,
  TurnFinishedEventSchema,
  DiceRolledEventSchema,
]);
export type EngineEvent = z.infer<typeof EngineEventSchema>;

export const ScenarioEventSchema = z.discriminatedUnion('type', [
  NewsPublishedEventSchema,
  HiddenNewsPublishedEventSchema,
]);
export type ScenarioEvent = z.infer<typeof ScenarioEventSchema>;

export const ScenarioEventArraySchema = z.array(ScenarioEventSchema);

// Prepared prompt structure used by CLI; content/config kept minimal on purpose.
export const PreparedPromptSchema = z.object({
  model: z.string(),
  request: z.object({
    model: z.string(),
    contents: z.array(ContentSchema),
    config: z.any(), // GenerateContentConfig has many optional fields
  }),
  materialsUsed: z.array(z.string()),
});
export type PreparedPrompt = z.infer<typeof PreparedPromptSchema>;
