/**
 * Top-level timeline experience: loads seed events, persists user edits,
 * calls Gemini for forecasts, and renders the search/timeline/compose stack.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { EngineEvent, NewsPublishedEvent } from './types';
import { INITIAL_EVENTS } from './data';
import { coerceEngineEvents, sortAndDedupEvents } from '@ai-forecasting/engine';
import { getAiForecast } from './services/geminiService';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { ComposePanel } from './components/ComposePanel';
import { Toast } from './components/Toast';
import {
  getScenarioHeadDate,
  getVisibleTimelineEvents,
  getLatestTimelineDate,
} from './utils/timeline';

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

  const handleUserSubmit = useCallback(async (newEvent: NewsPublishedEvent) => {
    const previousEvents = eventsRef.current;
    const historyWithUserEvent = sortAndDedupEvents([...previousEvents, newEvent]);

    setIsLoading(true);
    setError(null);
    setEvents(historyWithUserEvent);
    try {
      const scenarioHeadDate = getScenarioHeadDate(historyWithUserEvent);
      const forecastEvents = await getAiForecast(historyWithUserEvent, {
        seedHistoryEndDate: scenarioHeadDate ?? undefined,
      });
      setEvents(prevEvents => sortAndDedupEvents([...prevEvents, ...forecastEvents]));
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

  const scenarioHeadDate = useMemo(() => getScenarioHeadDate(events), [events]);
  const visibleEvents = useMemo(() => getVisibleTimelineEvents(events), [events]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return visibleEvents;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return visibleEvents.filter(event =>
      event.title.toLowerCase().includes(lowercasedQuery) ||
      event.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [visibleEvents, searchQuery]);

  const latestEventDate = useMemo(() => {
    return getLatestTimelineDate(events);
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
          scenarioHeadDate={scenarioHeadDate ?? undefined}
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
