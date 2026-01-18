/**
 * Post-game analysis screen - reveals GM summary and hidden news
 */
import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { EngineEvent, GameOverEvent, HiddenNewsPublishedEvent } from '../types';
import { Icon } from '../components/icons';

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
      <div className="bg-beige-50 text-stone-800 min-h-screen font-sans flex items-center justify-center px-4">
        <div className="max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-stone-900 mb-4">Game Not Complete</h1>
          <p className="text-stone-600 mb-6">The game has not reached its conclusion yet.</p>
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
    <div className="bg-beige-50 text-stone-800 min-h-screen font-sans">
      <header className="sticky top-0 z-20 bg-white border-b border-stone-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold text-stone-900">Game Over</h1>
          <div className="flex gap-2">
            <button
              onClick={() => navigate('/game')}
              className="text-stone-600 hover:text-stone-900 font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
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
        <section className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 mb-8">
          <div className="flex items-start gap-4 mb-6">
            <div className="p-3 bg-amber-50 rounded-lg">
              <Icon name="ScrollText" className="w-8 h-8 text-amber-700" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                Game Master's Analysis
              </h2>
              <p className="text-sm text-stone-500">Final date: {gameOverEvent.date}</p>
            </div>
          </div>
          <div className="prose prose-stone max-w-none">
            <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
              {gameOverEvent.summary}
            </p>
          </div>
        </section>

        {/* Hidden News Reveal */}
        {hiddenNewsEvents.length > 0 && (
          <section className="bg-white rounded-lg shadow-sm border border-stone-200 p-8">
            <div className="flex items-start gap-4 mb-6">
              <div className="p-3 bg-purple-50 rounded-lg">
                <Icon name="Eye" className="w-8 h-8 text-purple-700" />
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-stone-900 mb-2">
                  Hidden Events Revealed
                </h2>
                <p className="text-stone-600">
                  These events occurred behind the scenes during your simulation.
                </p>
              </div>
            </div>
            <div className="space-y-4">
              {hiddenNewsEvents.map((event, index) => (
                <div
                  key={index}
                  className="border-l-4 border-purple-300 bg-purple-50/50 p-4 rounded-r-lg"
                >
                  <div className="flex items-start gap-3">
                    <Icon name={event.icon} className="w-5 h-5 text-purple-700 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2 mb-1">
                        <h3 className="font-semibold text-stone-900">{event.title}</h3>
                        <span className="text-xs text-stone-500">{event.date}</span>
                      </div>
                      <p className="text-stone-700 leading-relaxed">{event.description}</p>
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
