/**
 * Main gameplay page - timeline experience with GM interaction
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineEvent, ScenarioEvent } from '../types';
import { applyNewsPatches, coerceEngineEvents, sortAndDedupEvents, aggregate } from '@/engine';
import { dateFromISO } from '@/engine/utils/strings';
import { getAiForecast } from '../services/geminiService';
import { Header } from '../components/Header';
import { Timeline } from '../components/Timeline';
import { ComposePanel } from '../components/ComposePanel';
import { Toast } from '../components/Toast';
import { TutorialModal } from '../components/TutorialModal';

const STORAGE_KEY = 'takeoff-timeline-events-v2';

interface GamePageProps {
  initialEvents: EngineEvent[];
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const GamePage: React.FC<GamePageProps> = ({ initialEvents, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<EngineEvent[]>(initialEvents);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));

    // Check if game is over and navigate to post-game screen
    const hasGameOver = events.some(e => e.type === 'game-over');
    if (hasGameOver) {
      navigate('/post-game');
    }
  }, [events, navigate]);

  const handleUserSubmit = useCallback(async (newEvent: ScenarioEvent) => {
    const previousEvents = eventsRef.current;
    const baseSummary = aggregate(previousEvents);
    const playerTurnStartDate = baseSummary.latestDate ?? newEvent.date;
    const playerTurnStarted: EngineEvent = {
      type: 'turn-started',
      actor: 'player',
      from: playerTurnStartDate,
      until: playerTurnStartDate,
    };
    const historyAfterPlayerBase = sortAndDedupEvents([...previousEvents, playerTurnStarted, newEvent]);
    const playerTurnUntil = aggregate(historyAfterPlayerBase).latestDate ?? playerTurnStartDate;
    const playerTurnFinished: EngineEvent = {
      type: 'turn-finished',
      actor: 'player',
      from: playerTurnStartDate,
      until: playerTurnUntil,
    };
    const historyAfterPlayer = sortAndDedupEvents([...historyAfterPlayerBase, playerTurnFinished]);
    const gmTurnStartDate = aggregate(historyAfterPlayer).latestDate ?? playerTurnUntil;
    const gmTurnStarted: EngineEvent = {
      type: 'turn-started',
      actor: 'game_master',
      from: gmTurnStartDate,
      until: gmTurnStartDate,
    };
    const historyWithGmStart = sortAndDedupEvents([...historyAfterPlayer, gmTurnStarted]);

    setIsLoading(true);
    setError(null);
    setEvents(historyAfterPlayer);
    try {
      setEvents(historyWithGmStart);
      const forecastEvents = await getAiForecast(historyWithGmStart);
      const historyWithForecast = sortAndDedupEvents([...historyWithGmStart, ...forecastEvents]);
      const gmTurnUntil = aggregate(historyWithForecast).latestDate ?? gmTurnStartDate;
      const gmTurnFinished: EngineEvent = {
        type: 'turn-finished',
        actor: 'game_master',
        from: gmTurnStartDate,
        until: gmTurnUntil,
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

  const handleTelemetry = useCallback((type: 'news-opened' | 'news-closed', targetId: string) => {
    const telemetryEvent: EngineEvent = {
      type,
      targetId,
      at: new Date().toISOString(),
    };
    setEvents(prev => sortAndDedupEvents([...prev, telemetryEvent]));
  }, []);

  const timelineEvents = useMemo(() => {
    // Get patched news events (but filter out hidden news during gameplay)
    const patchedNews = applyNewsPatches(events).filter(
      event => event.type !== 'hidden-news-published'
    );

    // Get turn markers from original events
    const turnMarkers = events.filter(event =>
      event.type === 'turn-started' || event.type === 'turn-finished'
    );

    // Merge and sort (news + turn markers, no hidden news)
    return sortAndDedupEvents([...patchedNews, ...turnMarkers]);
  }, [events]);

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return timelineEvents;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return timelineEvents.filter(event => {
      // Turn markers don't have searchable content, always include them
      if (event.type === 'turn-started' || event.type === 'turn-finished') {
        return true;
      }
      // Filter news events by title/description
      if ('title' in event && 'description' in event) {
        return (
          event.title.toLowerCase().includes(lowercasedQuery) ||
          event.description.toLowerCase().includes(lowercasedQuery)
        );
      }
      return false;
    });
  }, [timelineEvents, searchQuery]);

  const latestEventDate = useMemo(() => {
    const summary = aggregate(events);
    if (!summary.latestDate) return dateFromISO(new Date().toISOString());
    return summary.latestDate;
  }, [events]);

  const boundaryDate = useMemo(() => {
    const marker = events.filter(event => event.type === 'scenario-head-completed');
    return marker.length ? marker[marker.length - 1].date : undefined;
  }, [events]);

  const handleShowTutorial = () => {
    setShowTutorial(true);
  };

  const handleCloseTutorial = () => {
    setShowTutorial(false);
  };

  return (
    <div className="bg-beige-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 min-h-screen font-sans">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        events={events}
        onImport={handleImport}
        onShowTutorial={handleShowTutorial}
        theme={theme}
        onToggleTheme={onToggleTheme}
      />

      <main className="max-w-3xl mx-auto px-4 pt-20 pb-56">
        <Timeline
          events={filteredEvents}
          searchQuery={searchQuery}
          boundaryDate={boundaryDate}
          onTelemetry={handleTelemetry}
        />
      </main>

      <ComposePanel
        latestDate={latestEventDate}
        onSubmit={handleUserSubmit}
        isLoading={isLoading}
      />

      {error && <Toast message={error} onClose={() => setError(null)} />}

      <TutorialModal isOpen={showTutorial} onClose={handleCloseTutorial} />
    </div>
  );
};
