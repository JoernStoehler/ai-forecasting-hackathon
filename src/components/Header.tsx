import React from 'react';
import { Icon } from './icons';
import { FileControls } from './FileControls';
import { EngineEvent } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  events: EngineEvent[];
  onImport: (newEvents: EngineEvent[]) => void;
  onShowTutorial?: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, events, onImport, onShowTutorial, theme, onToggleTheme }) => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-beige-50/80 dark:bg-stone-900/80 backdrop-blur-sm z-20 border-b border-beige-200 dark:border-stone-700">
      <div className="max-w-3xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="relative flex-grow">
            <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              placeholder="Search timeline..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-beige-100 dark:bg-stone-800 border border-beige-200 dark:border-stone-700 rounded-lg text-stone-800 dark:text-stone-200 placeholder-stone-400 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 focus:outline-none transition"
            />
          </div>
          <div className="flex items-center gap-2 ml-2">
            {onToggleTheme && (
              <button
                onClick={onToggleTheme}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-beige-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <Icon name={theme === 'light' ? 'Moon' : 'Sun'} className="w-5 h-5" />
              </button>
            )}
            {onShowTutorial && (
              <button
                onClick={onShowTutorial}
                className="p-2 text-stone-600 dark:text-stone-400 hover:text-amber-700 dark:hover:text-amber-500 hover:bg-beige-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                aria-label="Show tutorial"
                title="How to Play"
              >
                <Icon name="HelpCircle" className="w-5 h-5" />
              </button>
            )}
            <FileControls events={events} onImport={onImport} />
          </div>
        </div>
      </div>
    </header>
  );
};
