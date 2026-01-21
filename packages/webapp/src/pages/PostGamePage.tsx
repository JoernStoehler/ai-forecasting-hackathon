/**
 * Post-game analysis screen - reveals GM summary and hidden news
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineEvent, GameOverEvent, HiddenNewsPublishedEvent } from '../types';
import { Icon } from '../components/icons';
import { ShareButton } from '../components/ShareButton';

interface PostGamePageProps {
  events: EngineEvent[];
}

export const PostGamePage: React.FC<PostGamePageProps> = ({ events }) => {
  const navigate = useNavigate();

  const gameOverEvent = useMemo(() => {
    return events.find((e): e is GameOverEvent => e.type === 'game-over');
  }, [events]);

  const hiddenNewsEvents = useMemo(() => {
    return events.filter((e): e is HiddenNewsPublishedEvent => e.type === 'hidden-news-published');
  }, [events]);

  if (!gameOverEvent) {
    // Fallback if no game-over event exists (shouldn't happen)
    return (
      <div className="bg-beige-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 min-h-screen font-sans flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100 mb-4">Game Not Complete</h1>
          <p className="text-stone-600 dark:text-stone-400 mb-6">The game has not reached its conclusion yet.</p>
          <button
            onClick={() => navigate('/game')}
            className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Return to Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-beige-50 dark:bg-stone-900 text-stone-800 dark:text-stone-200 min-h-screen font-sans">
      <header className="sticky top-0 z-20 bg-white dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900 dark:text-stone-100">Game Over</h1>
          <div className="flex gap-2 items-center">
            <ShareButton events={events} isGameOver={true} />
            <button
              onClick={() => navigate('/game')}
              className="text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-200 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="Clock" className="w-4 h-4" />
              View Timeline
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
            >
              <Icon name="Plus" className="w-4 h-4" />
              New Game
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* GM Summary */}
        <section className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/30 rounded-lg">
              <Icon name="ScrollText" className="w-8 h-8 text-amber-700 dark:text-amber-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Game Master&apos;s Analysis
              </h2>
              <p className="text-sm text-stone-500 dark:text-stone-400">Final date: {gameOverEvent.date}</p>
            </div>
          </div>
          <div className="prose prose-stone dark:prose-invert max-w-none">
            <p className="text-stone-700 dark:text-stone-300 leading-relaxed whitespace-pre-wrap">
              {gameOverEvent.summary}
            </p>
          </div>
        </section>

        {/* Hidden News Reveal */}
        {hiddenNewsEvents.length > 0 && (
          <section className="bg-white dark:bg-stone-800 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <Icon name="Eye" className="w-8 h-8 text-purple-700 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-stone-900 dark:text-stone-100 mb-2">
                  Hidden Events Revealed
                </h2>
                <p className="text-stone-600 dark:text-stone-400">
                  These events occurred behind the scenes during your simulation.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {hiddenNewsEvents.map((event, index) => (
                <div
                  key={index}
                  className="border-l-4 border-purple-300 dark:border-purple-600 bg-purple-50/50 dark:bg-purple-900/20 p-4 rounded-r-lg"
                >
                  <div className="flex items-start gap-3">
                    <Icon name={event.icon} className="w-5 h-5 text-purple-700 dark:text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900 dark:text-stone-100">{event.title}</h3>
                        <span className="text-xs text-stone-500 dark:text-stone-400">{event.date}</span>
                      </div>
                      <p className="text-stone-700 dark:text-stone-300 leading-relaxed">{event.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
};
