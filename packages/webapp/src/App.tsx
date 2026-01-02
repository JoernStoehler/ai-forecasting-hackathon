/**
 * Top-level timeline experience: loads seed events, persists user edits,
 * calls Gemini for forecasts, and renders the search/timeline/compose stack.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { EngineEvent, ScenarioEvent } from './types';
import { INITIAL_EVENTS } from './data';
import { applyNewsPatches, coerceEngineEvents, sortAndDedupEvents, aggregate } from '@ai-forecasting/engine';
import { getAiForecast } from './services/geminiService';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { ComposePanel } from './components/ComposePanel';
import { Toast } from './components/Toast';

const STORAGE_KEY = 'takeoff-timeline-events-v2';

const loadEventsFromStorage = (): EngineEvent[] => {
  if (typeof window === 'undefined') {
    return INITIAL_EVENTS;
  }

  try {
    const savedEvents = localStorage.getItem(STORAGE_KEY);
    if (!savedEvents) {
      return INITIAL_EVENTS;
    }
    return coerceEngineEvents(JSON.parse(savedEvents), 'local storage');
  } catch (error) {
    console.error('Failed to load events from localStorage:', error);
    return INITIAL_EVENTS;
  }
};

function App() {
  const [events, setEvents] = useState<EngineEvent[]>(loadEventsFromStorage);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  const handleUserSubmit = useCallback(async (newEvent: ScenarioEvent) => {
    const previousEvents = eventsRef.current;
    const playerStartFrom = newEvent.date;
    const playerUntil = aggregate([...previousEvents, newEvent]).latestDate ?? playerStartFrom;
    const playerTurnStarted: EngineEvent = {
      type: 'turn-started',
      actor: 'player',
      from: playerStartFrom,
      until: playerStartFrom,
    };
    const playerTurnFinished: EngineEvent = {
      type: 'turn-finished',
      actor: 'player',
      from: playerStartFrom,
      until: playerUntil,
    };
    const historyWithPlayerTurn = sortAndDedupEvents([
      ...previousEvents,
      playerTurnStarted,
      newEvent,
      playerTurnFinished,
    ]);
    const gmStartFrom = aggregate(historyWithPlayerTurn).latestDate ?? playerUntil;
    const gmTurnStarted: EngineEvent = {
      type: 'turn-started',
      actor: 'game_master',
      from: gmStartFrom,
      until: gmStartFrom,
    };
    const historyWithGmTurn = sortAndDedupEvents([...historyWithPlayerTurn, gmTurnStarted]);

    setIsLoading(true);
    setError(null);
    setEvents(historyWithGmTurn);
    try {
      const forecastEvents = await getAiForecast(historyWithGmTurn);
      const historyWithForecast = sortAndDedupEvents([...historyWithGmTurn, ...forecastEvents]);
      const gmUntil = aggregate(historyWithForecast).latestDate ?? gmStartFrom;
      const gmTurnFinished: EngineEvent = {
        type: 'turn-finished',
        actor: 'game_master',
        from: gmStartFrom,
        until: gmUntil,
      };
      setEvents(sortAndDedupEvents([...historyWithForecast, gmTurnFinished]));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      setEvents(previousEvents);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleImport = useCallback((newEvents: EngineEvent[]) => {
    setEvents(sortAndDedupEvents(newEvents));
    alert('Timeline imported successfully!');
  }, []);

  const timelineEvents = useMemo(() => {
    const patched = applyNewsPatches(events);
    return patched.filter(event => event.type === 'news-published');
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return timelineEvents;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return timelineEvents.filter(event =>
      event.title.toLowerCase().includes(lowercasedQuery) ||
      event.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [timelineEvents, searchQuery]);

  const latestEventDate = useMemo(() => {
    const summary = aggregate(events);
    if (!summary.latestDate) return new Date().toISOString().split('T')[0];
    return summary.latestDate;
  }, [events]);

  const boundaryDate = useMemo(() => {
    const marker = events.filter(event => event.type === 'scenario-head-completed');
    return marker.length ? marker[marker.length - 1].date : undefined;
  }, [events]);

  return (
    <div className="bg-beige-50 text-stone-800 min-h-screen font-sans">
      <Header 
        searchQuery={searchQuery} 
        onSearchChange={setSearchQuery} 
        events={events}
        onImport={handleImport}
      />
      
      <main className="max-w-3xl mx-auto px-4 pt-20 pb-56">
        <Timeline
          events={filteredEvents}
          searchQuery={searchQuery}
          boundaryDate={boundaryDate}
        />
      </main>

      <ComposePanel
        latestDate={latestEventDate}
        onSubmit={handleUserSubmit}
        isLoading={isLoading}
      />

      {error && <Toast message={error} onClose={() => setError(null)} />}
    </div>
  );
}

export default App;
