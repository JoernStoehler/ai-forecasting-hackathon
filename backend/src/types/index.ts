import { z } from 'zod'

export const ForecastId = z.string().min(1)

export const ForecastMetadata = z.object({
  id: ForecastId,
  title: z.string().min(1),
  description: z.string().default(''),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
})

export const ForecastEvent = z.object({
  id: z.string().min(1),
  forecastId: ForecastId,
  timestamp: z.string().datetime(),
  kind: z.enum(['note', 'probability', 'resolution', 'system']).default('note'),
  data: z.unknown(),
})

export type ForecastMetadataT = z.infer<typeof ForecastMetadata>
export type ForecastEventT = z.infer<typeof ForecastEvent>

