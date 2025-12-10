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

export const ScenarioEventSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  icon: z.enum(ICON_VALUES),
  title: z.string().min(1),
  description: z.string().min(1),
  postMortem: z.boolean().optional(),
});

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
