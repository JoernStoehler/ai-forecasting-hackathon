import { ForecastEventT, ForecastMetadataT } from './types/index.js'

// In-memory store for scaffolding; replace with SQLite later.
export class Store {
  forecasts = new Map<string, ForecastMetadataT>()
  history = new Map<string, ForecastEventT[]>()
  streams = new Map<string, Set<NodeJS.WritableStream>>()
  extendStatus = new Map<string, { status: 'idle'|'processing'|'done'|'error'; message?: string }>()

  upsertForecast(meta: ForecastMetadataT) {
    const now = new Date().toISOString()
    const prev = this.forecasts.get(meta.id)
    const next = { createdAt: prev?.createdAt ?? now, updatedAt: now, ...meta }
    this.forecasts.set(meta.id, next)
    return next
  }

  getForecast(id: string) { return this.forecasts.get(id) }

  getHistory(id: string) { return this.history.get(id) ?? [] }
  overwriteHistory(id: string, events: ForecastEventT[]) { this.history.set(id, events); this.broadcast(id, events.at(-1)) }
  appendEvent(id: string, ev: ForecastEventT) {
    const list = this.history.get(id) ?? []
    list.push(ev)
    this.history.set(id, list)
    this.broadcast(id, ev)
  }

  subscribe(id: string, stream: NodeJS.WritableStream) {
    const set = this.streams.get(id) ?? new Set()
    set.add(stream)
    this.streams.set(id, set)
    return () => { set.delete(stream) }
  }

  private broadcast(id: string, ev?: ForecastEventT) {
    if (!ev) return
    const payload = `data: ${JSON.stringify(ev)}\n\n`
    const set = this.streams.get(id)
    if (set) for (const w of set) { w.write(payload) }
  }
}

export const store = new Store()

