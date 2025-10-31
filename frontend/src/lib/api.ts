import { z } from 'zod'
import { ForecastEvent, ForecastEventT, ForecastId, ForecastMetadata, ForecastMetadataT } from './types'

const DEFAULT_API_BASE = (() => {
  if (typeof window !== 'undefined') {
    const h = window.location.hostname
    if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:8080/api'
    return '/api'
  }
  return '/api'
})()
const API_BASE = import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE

async function json<T>(res: Response, schema?: z.ZodSchema<T>): Promise<T> {
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  const data = await res.json()
  return schema ? schema.parse(data) : data
}

async function request<T>(path: string, init?: RequestInit, schema?: z.ZodSchema<T>): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  })
  return json(res, schema)
}

export const api = {
  health: () => request('/health'),
  getForecast: (id: string) => request(`/forecast/${ForecastId.parse(id)}`, undefined, ForecastMetadata),
  upsertForecast: (id: string, data: Partial<ForecastMetadataT>) =>
    request(`/forecast/${ForecastId.parse(id)}`, { method: 'POST', body: JSON.stringify(data) }, ForecastMetadata),
  getHistory: (id: string) => request(`/forecast/${ForecastId.parse(id)}/history`, undefined, z.array(ForecastEvent)),
  postEvent: (id: string, ev: Omit<ForecastEventT, 'forecastId'>) =>
    request(`/forecast/${ForecastId.parse(id)}/event`, { method: 'POST', body: JSON.stringify(ev) }, ForecastEvent),
  extend: (id: string) => request(`/actions/extend/${ForecastId.parse(id)}`, { method: 'POST' }),
  extendStatus: (id: string) => request(`/actions/extend/${ForecastId.parse(id)}`),
  stream: (id: string, onEvent: (ev: ForecastEventT) => void) => {
    const es = new EventSource(`${API_BASE}/forecast/${ForecastId.parse(id)}/stream`)
    es.onmessage = (e) => {
      try { onEvent(ForecastEvent.parse(JSON.parse(e.data))) } catch { /* ignore */ }
    }
    return es
  }
}
