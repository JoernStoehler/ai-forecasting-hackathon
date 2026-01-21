/**
 * Main app router - handles navigation between menu and game
 */
import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { EngineEvent } from './types';
import { INITIAL_EVENTS } from './data';
import { coerceEngineEvents } from '@/engine';
import { MenuPage } from './pages/MenuPage';
import { GamePage } from './pages/GamePage';
import { PostGamePage } from './pages/PostGamePage';
import { SharedGameModal } from './components/SharedGameModal';
import { useTheme } from './hooks/useTheme';

const STORAGE_KEY = 'takeoff-timeline-events-v2';
const HAS_GAME_KEY = 'takeoff-has-game';

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

// Get share ID from URL query param
const getShareIdFromUrl = (): string | null => {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  return params.get('share');
};

// Clear share param from URL without reload
const clearShareParam = () => {
  const url = new URL(window.location.href);
  url.searchParams.delete('share');
  window.history.replaceState({}, '', url.pathname);
};

interface AppContentProps {
  gameEvents: EngineEvent[];
  setGameEvents: (events: EngineEvent[]) => void;
  hasExistingGame: boolean;
  handleNewGame: () => void;
  handleContinueGame: () => void;
  shareId: string | null;
  setShareId: (id: string | null) => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const AppContent: React.FC<AppContentProps> = ({
  gameEvents,
  setGameEvents,
  hasExistingGame,
  handleNewGame,
  handleContinueGame,
  shareId,
  setShareId,
  theme,
  toggleTheme,
}) => {
  const navigate = useNavigate();

  const handleViewSharedTimeline = useCallback((events: EngineEvent[]) => {
    setGameEvents(events);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    setShareId(null);
    clearShareParam();

    const isGameOver = events.some(e => e.type === 'game-over');
    navigate(isGameOver ? '/post-game' : '/game');
  }, [setGameEvents, setShareId, navigate]);

  const handleContinueShared = useCallback((events: EngineEvent[]) => {
    setGameEvents(events);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
    localStorage.setItem(HAS_GAME_KEY, 'true');
    setShareId(null);
    clearShareParam();
    navigate('/game');
  }, [setGameEvents, setShareId, navigate]);

  const handleStartFresh = useCallback(() => {
    setShareId(null);
    clearShareParam();
    handleNewGame();
    navigate('/game');
  }, [setShareId, handleNewGame, navigate]);

  const handleCloseShare = useCallback(() => {
    setShareId(null);
    clearShareParam();
  }, [setShareId]);

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <MenuPage
              hasExistingGame={hasExistingGame}
              onNewGame={handleNewGame}
              onContinueGame={handleContinueGame}
            />
          }
        />
        <Route
          path="/game"
          element={<GamePage initialEvents={gameEvents} theme={theme} onToggleTheme={toggleTheme} />}
        />
        <Route
          path="/post-game"
          element={<PostGamePage events={gameEvents} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {shareId && (
        <SharedGameModal
          shareId={shareId}
          onViewTimeline={handleViewSharedTimeline}
          onContinue={handleContinueShared}
          onStartFresh={handleStartFresh}
          onClose={handleCloseShare}
        />
      )}
    </>
  );
};

function App() {
  const { theme, toggleTheme } = useTheme();
  const [gameEvents, setGameEvents] = useState<EngineEvent[]>(loadEventsFromStorage);
  const [hasExistingGame, setHasExistingGame] = useState<boolean>(() => {
    return localStorage.getItem(HAS_GAME_KEY) === 'true';
  });
  const [shareId, setShareId] = useState<string | null>(getShareIdFromUrl);

  useEffect(() => {
    // Update hasExistingGame flag when game events change
    const hasGame = gameEvents.length > 0 && JSON.stringify(gameEvents) !== JSON.stringify(INITIAL_EVENTS);
    setHasExistingGame(hasGame);
    localStorage.setItem(HAS_GAME_KEY, hasGame.toString());
  }, [gameEvents]);

  const handleNewGame = useCallback(() => {
    // Reset to initial events
    setGameEvents(INITIAL_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(HAS_GAME_KEY, 'true');
  }, []);

  const handleContinueGame = useCallback(() => {
    // Load from storage (already loaded in state)
    const loaded = loadEventsFromStorage();
    setGameEvents(loaded);
  }, []);

  return (
    <BrowserRouter>
      <AppContent
        gameEvents={gameEvents}
        setGameEvents={setGameEvents}
        hasExistingGame={hasExistingGame}
        handleNewGame={handleNewGame}
        handleContinueGame={handleContinueGame}
        shareId={shareId}
        setShareId={setShareId}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </BrowserRouter>
  );
}

export default App;
