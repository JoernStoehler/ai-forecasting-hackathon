
/**
 * Mounts the React tree plus <VibeKanbanWebCompanion />.
 * Keep this file minimal so Gemini App embeds remain predictable.
 */
import React from 'react';
import ReactDOM from 'react-dom/client';
import { VibeKanbanWebCompanion } from 'vibe-kanban-web-companion';
import App from './App';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
    <VibeKanbanWebCompanion />
  </React.StrictMode>
);
