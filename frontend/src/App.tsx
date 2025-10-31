import { Link, Route, Routes, useParams } from 'react-router-dom'
import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from './lib/api'
import type { ForecastEventT, ForecastMetadataT } from './lib/types'

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="border-b bg-white">
        <div className="container flex items-center justify-between py-3">
          <Link to="/" className="font-semibold">AI Forecasting</Link>
          <nav className="text-sm space-x-4">
            <Link to="/" className="hover:underline">Home</Link>
          </nav>
        </div>
      </header>
      <main className="container py-6">{children}</main>
    </div>
  )
}

function Home() {
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-semibold">Welcome</h1>
      <p className="text-gray-600">Starter scaffold is running.</p>
      <p>
        Try a sample forecast page: <Link className="text-blue-600 underline" to="/forecast/demo">/forecast/demo</Link>
      </p>
    </div>
  )
}

function ForecastPage() {
  const { id = 'demo' } = useParams()
  const [events, setEvents] = useState<ForecastEventT[]>([])

  const { data: meta } = useQuery<ForecastMetadataT>({
    queryKey: ['forecast', id],
    queryFn: () => api.getForecast(id).catch(() => api.upsertForecast(id, { title: `Forecast ${id}` })),
  })

  const stream = useMemo(() => ({ current: null as EventSource | null }), [])
  useEffect(() => {
    if (!id) return
    const es = api.stream(id, (ev) => setEvents((prev) => [...prev, ev]))
    stream.current = es
    return () => { es.close(); stream.current = null }
  }, [id])

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">{meta?.title ?? 'Forecast'}</h1>
        <p className="text-gray-600">ID: {id}</p>
      </div>
      <div className="flex gap-2">
        <button className="px-3 py-1.5 rounded bg-blue-600 text-white" onClick={() => api.extend(id)}>Extend</button>
        <button className="px-3 py-1.5 rounded border" onClick={() => setEvents([])}>Clear Events</button>
      </div>
      <div className="border rounded bg-white">
        <div className="p-3 border-b font-medium">Streamed Events</div>
        <ul className="p-3 space-y-2 text-sm">
          {events.length === 0 && <li className="text-gray-500">No events yet. Click Extend.</li>}
          {events.map((e) => (
            <li key={e.id} className="flex items-start gap-2">
              <span className="text-gray-400">{new Date(e.timestamp).toLocaleTimeString()}</span>
              <span className="font-mono text-gray-700">{e.kind}</span>
              <span className="text-gray-700 truncate">{typeof e.data === 'object' ? JSON.stringify(e.data) : String(e.data)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/forecast/:id" element={<ForecastPage />} />
      </Routes>
    </Layout>
  )
}
