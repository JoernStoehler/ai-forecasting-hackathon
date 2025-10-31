import express from 'express'
import cors from 'cors'
import { ForecastEvent, ForecastEventT, ForecastId, ForecastMetadata, ForecastMetadataT } from './types/index.js'
import { store } from './store.js'

const app = express()
app.use(cors({ origin: true }))
app.use(express.json({ limit: '1mb' }))

const PORT = Number(process.env.PORT || 8080)

// Health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() })
})

// Forecast metadata
app.get('/api/forecast/:id', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  const meta = store.getForecast(id)
  if (!meta) return res.status(404).json({ error: 'Not found' })
  res.json(meta)
})

app.post('/api/forecast/:id', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  const body = ForecastMetadata.partial().parse(req.body)
  const meta: ForecastMetadataT = { id, title: body.title ?? `Forecast ${id}`, description: body.description ?? '', createdAt: body.createdAt, updatedAt: body.updatedAt }
  const saved = store.upsertForecast(meta)
  res.json(saved)
})

// History
app.get('/api/forecast/:id/history', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  res.json(store.getHistory(id))
})

app.post('/api/forecast/:id/history', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  const events = (Array.isArray(req.body) ? req.body : []).map((e) => ForecastEvent.parse(e))
  store.overwriteHistory(id, events)
  res.json({ ok: true, count: events.length })
})

// Post an event
app.post('/api/forecast/:id/event', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  const input = ForecastEvent.omit({ forecastId: true }).parse(req.body)
  const ev: ForecastEventT = { ...input, forecastId: id }
  store.appendEvent(id, ev)
  res.json(ev)
})

// SSE stream
app.get('/api/forecast/:id/stream', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders?.()

  const unsubscribe = store.subscribe(id, res)
  req.on('close', () => { unsubscribe(); res.end() })
})

// Extend action (stubbed)
const delays = new Map<string, NodeJS.Timeout>()
app.post('/api/actions/extend/:id', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  store.extendStatus.set(id, { status: 'processing' })
  // Simulate async agent work
  if (delays.has(id)) clearTimeout(delays.get(id)!)
  const t = setTimeout(() => {
    const ev: ForecastEventT = {
      id: `ev-${Date.now()}`,
      forecastId: id,
      timestamp: new Date().toISOString(),
      kind: 'system',
      data: { message: 'Extended by stub agent' },
    }
    store.appendEvent(id, ev)
    store.extendStatus.set(id, { status: 'done' })
  }, 1000)
  delays.set(id, t)
  res.json({ ok: true, status: 'processing' })
})

app.get('/api/actions/extend/:id', (req, res) => {
  const id = ForecastId.parse(req.params.id)
  res.json(store.extendStatus.get(id) ?? { status: 'idle' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${PORT}`)
})

