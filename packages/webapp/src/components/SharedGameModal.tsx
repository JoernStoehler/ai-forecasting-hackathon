/**
 * SharedGameModal - Modal shown when opening a shared game link
 */
import React, { useEffect, useState } from 'react';
import type { EngineEvent } from '@/engine';
import { downloadShare, SharePayload } from '@/services/shareService';
import { coerceEngineEvents } from '@/engine';
import { Icon } from './icons';

interface SharedGameModalProps {
  shareId: string;
  onViewTimeline: (events: EngineEvent[]) => void;
  onContinue: (events: EngineEvent[]) => void;
  onStartFresh: () => void;
  onClose: () => void;
}

type LoadState = 'loading' | 'loaded' | 'error';

export const SharedGameModal: React.FC<SharedGameModalProps> = ({
  shareId,
  onViewTimeline,
  onContinue,
  onStartFresh,
  onClose,
}) => {
  const [loadState, setLoadState] = useState<LoadState>('loading');
  const [error, setError] = useState<string | null>(null);
  const [payload, setPayload] = useState<SharePayload | null>(null);
  const [events, setEvents] = useState<EngineEvent[]>([]);

  useEffect(() => {
    const fetchShare = async () => {
      try {
        const data = await downloadShare(shareId);
        const validatedEvents = coerceEngineEvents(data.events, 'shared game');
        setPayload(data);
        setEvents(validatedEvents);
        setLoadState('loaded');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load shared game');
        setLoadState('error');
      }
    };
    fetchShare();
  }, [shareId]);

  const isGameOver = events.some(e => e.type === 'game-over');
  const sharedDate = payload ? new Date(payload.sharedAt).toLocaleDateString() : '';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-stone-800 rounded-xl shadow-xl max-w-md w-full p-6">
        {loadState === 'loading' && (
          <div className="flex flex-col items-center py-8">
            <Icon name="Loader2" className="w-8 h-8 animate-spin text-amber-600 mb-4" />
            <p className="text-stone-600 dark:text-stone-400">Loading shared game...</p>
          </div>
        )}

        {loadState === 'error' && (
          <div className="text-center py-8">
            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full w-fit mx-auto mb-4">
              <Icon name="X" className="w-8 h-8 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
              Could not load game
            </h3>
            <p className="text-stone-600 dark:text-stone-400 mb-6">{error}</p>
            <button
              onClick={onClose}
              className="bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 font-medium py-2 px-6 rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        )}

        {loadState === 'loaded' && (
          <>
            <div className="text-center mb-6">
              <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-full w-fit mx-auto mb-4">
                <Icon name="Share2" className="w-8 h-8 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100 mb-2">
                Shared Game
              </h3>
              <p className="text-stone-600 dark:text-stone-400 text-sm">
                {isGameOver ? 'This game has ended' : 'This game is in progress'}
                {sharedDate && ` • Shared ${sharedDate}`}
              </p>
              <p className="text-stone-500 dark:text-stone-500 text-xs mt-1">
                {events.length} events
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => onViewTimeline(events)}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-amber-600 hover:bg-amber-700 text-white font-medium rounded-lg transition-colors"
              >
                <Icon name="Clock" className="w-5 h-5" />
                View Timeline
              </button>

              {!isGameOver && (
                <button
                  onClick={() => onContinue(events)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-600 text-stone-800 dark:text-stone-100 font-medium rounded-lg transition-colors"
                >
                  <Icon name="Send" className="w-5 h-5" />
                  Continue Playing
                </button>
              )}

              <button
                onClick={onStartFresh}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 font-medium rounded-lg transition-colors"
              >
                <Icon name="Plus" className="w-5 h-5" />
                Start Fresh
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
