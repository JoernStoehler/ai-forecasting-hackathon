/**
 * Share service - upload/download game states via Cloudflare Worker
 */
import type { EngineEvent } from '@/engine';

// Worker URL - configure via environment variable or default to localhost for dev
const WORKER_URL = import.meta.env.VITE_SHARE_WORKER_URL || 'http://localhost:8787';

export interface SharePayload {
  events: EngineEvent[];
  sharedAt: string;
  version: number;
}

export interface ShareResult {
  id: string;
  url: string;
}

/**
 * Upload game state to share worker, returns share ID and URL
 */
export async function uploadShare(events: EngineEvent[]): Promise<ShareResult> {
  const payload: SharePayload = {
    events,
    sharedAt: new Date().toISOString(),
    version: 1,
  };

  const response = await fetch(`${WORKER_URL}/share`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Upload failed' }));
    throw new Error(error.error || 'Failed to upload share');
  }

  const { id } = await response.json();
  const url = `${window.location.origin}?share=${id}`;
  return { id, url };
}

/**
 * Download shared game state by ID
 */
export async function downloadShare(id: string): Promise<SharePayload> {
  const response = await fetch(`${WORKER_URL}/share/${id}`);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Share not found or expired');
    }
    const error = await response.json().catch(() => ({ error: 'Download failed' }));
    throw new Error(error.error || 'Failed to download share');
  }

  return response.json();
}

/**
 * Generate tweet text for sharing
 */
export function generateTweetText(url: string, isGameOver: boolean): string {
  const outcome = isGameOver ? 'finished a game of' : 'am playing';
  return `I ${outcome} Takeoff Timeline. Play: ${url}`;
}

/**
 * Open Twitter/X share dialog
 */
export function openTwitterShare(text: string): void {
  const tweetUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
  window.open(tweetUrl, '_blank', 'width=550,height=420');
}
