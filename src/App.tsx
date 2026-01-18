/**
 * Main app router - handles navigation between menu and game
 */
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EngineEvent } from './types';
import { INITIAL_EVENTS } from './data';
import { coerceEngineEvents } from '@/engine';
import { MenuPage } from './pages/MenuPage';
import { GamePage } from './pages/GamePage';

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

function App() {
  const [gameEvents, setGameEvents] = useState<EngineEvent[]>(loadEventsFromStorage);
  const [hasExistingGame, setHasExistingGame] = useState<boolean>(() => {
    return localStorage.getItem(HAS_GAME_KEY) === 'true';
  });

  useEffect(() => {
    // Update hasExistingGame flag when game events change
    const hasGame = gameEvents.length > 0 && JSON.stringify(gameEvents) !== JSON.stringify(INITIAL_EVENTS);
    setHasExistingGame(hasGame);
    localStorage.setItem(HAS_GAME_KEY, hasGame.toString());
  }, [gameEvents]);

  const handleNewGame = () => {
    // Reset to initial events
    setGameEvents(INITIAL_EVENTS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EVENTS));
    localStorage.setItem(HAS_GAME_KEY, 'true');
  };

  const handleContinueGame = () => {
    // Load from storage (already loaded in state)
    const loaded = loadEventsFromStorage();
    setGameEvents(loaded);
  };

  return (
    <BrowserRouter>
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
          element={<GamePage initialEvents={gameEvents} />}
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
