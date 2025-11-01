import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Event } from './types';
import { INITIAL_EVENTS, SYSTEM_PROMPT } from './constants';
import { getAiForecast } from './services/geminiService';
import { Header } from './components/Header';
import { Timeline } from './components/Timeline';
import { ComposePanel } from './components/ComposePanel';
import { Toast } from './components/Toast';

const sortEvents = (events: Event[]) => {
    return [...events].sort((a, b) => a.date.localeCompare(b.date) || a.title.localeCompare(b.title));
};

function App() {
  const [events, setEvents] = useState<Event[]>(() => {
    try {
      const savedEvents = localStorage.getItem('takeoff-timeline-events');
      return savedEvents ? sortEvents(JSON.parse(savedEvents)) : sortEvents(INITIAL_EVENTS);
    } catch (error) {
      console.error("Failed to load events from localStorage:", error);
      return sortEvents(INITIAL_EVENTS);
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('takeoff-timeline-events', JSON.stringify(events));
    } catch (error) {
      console.error("Failed to save events to localStorage:", error);
    }
  }, [events]);

  const handleUserSubmit = useCallback(async (newEvent: Event) => {
    setIsLoading(true);
    setError(null);
    const updatedHistory = sortEvents([...events, newEvent]);
    setEvents(updatedHistory);

    try {
      const forecastEvents = await getAiForecast(updatedHistory, SYSTEM_PROMPT);
      setEvents(prevEvents => sortEvents([...prevEvents, ...forecastEvents]));
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred.");
      // Optional: Roll back the user's optimistic update on error
      setEvents(prevEvents => prevEvents.filter(e => e !== newEvent));
    } finally {
      setIsLoading(false);
    }
  }, [events]);
  
  const handleImport = useCallback((newEvents: Event[], mode: 'replace' | 'merge') => {
      if (mode === 'replace') {
          setEvents(sortEvents(newEvents));
      } else {
          // Merge logic can be added here if needed
          const merged = [...events, ...newEvents];
          const unique = Array.from(new Map(merged.map(e => [`${e.date}-${e.title}`, e])).values());
          setEvents(sortEvents(unique));
      }
      alert("Timeline imported successfully!");
  }, [events]);


  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return events;
    }
    const lowercasedQuery = searchQuery.toLowerCase();
    return events.filter(event =>
      event.title.toLowerCase().includes(lowercasedQuery) ||
      event.description.toLowerCase().includes(lowercasedQuery)
    );
  }, [events, searchQuery]);

  const latestEventDate = useMemo(() => {
    if (events.length === 0) return new Date().toISOString().split('T')[0];
    return events[events.length - 1].date;
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
        <Timeline events={filteredEvents} searchQuery={searchQuery} />
      </main>

      <ComposePanel
        latestDate={latestEventDate}
        onSubmit={handleUserSubmit}
        isLoading={isLoading}
      />

      {error && <Toast message={error} onClose={() => setError(null)} />}

      <style>{`
          body {
            background-color: #FDFBF7;
          }
          /* Custom Scrollbar */
          ::-webkit-scrollbar {
            width: 8px;
            height: 8px;
          }
          ::-webkit-scrollbar-track {
            background-color: #FBF5EB; /* beige-100 */
          }
          ::-webkit-scrollbar-thumb {
            background-color: #E9D6B5; /* beige-300 */
            border-radius: 10px;
            border: 2px solid #FBF5EB; /* beige-100 */
          }
          ::-webkit-scrollbar-thumb:hover {
            background-color: #d8c4a9;
          }
          
          tailwind.config = {
            theme: {
              extend: {
                colors: {
                  beige: {
                    50: '#FDFBF7',
                    100: '#FBF5EB',
                    200: '#F5E9D6',
                    300: '#E9D6B5',
                  },
                },
                fontFamily: {
                  sans: ['Inter', 'sans-serif'],
                },
              }
            }
          }
      `}</style>
    </div>
  );
}

export default App;