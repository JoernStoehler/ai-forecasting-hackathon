import type { EngineEvent, NewsPublishedEvent, TurnStartedEvent } from '../types.js';

interface ProjectionInput {
  history: EngineEvent[];
}

/**
 * Projects the append-only event log into a prompt-friendly string:
 * - JSONL timeline including turn markers and news-published events.
 * - Player turn story-opens are collapsed into a single NewsOpened line per player turn.
 * - A small dynamic block with latest date and current turn window.
 */
export function projectPrompt(input: ProjectionInput): string {
  const { timelineLines, dynamic } = buildTimeline(input.history);
  return [
    '# TIMELINE (JSONL)',
    ...timelineLines,
    '# DYNAMIC',
    JSON.stringify(dynamic, null, 2),
  ].join('\n');
}

function buildTimeline(history: EngineEvent[]) {
  const lines: string[] = [];
  let currentPlayerTurn: TurnStartedEvent | null = null;
  let openedInTurn: Set<string> = new Set();

  let latestDate: string | null = null;
  let currentTurn: { from: string; until: string; actor: string } | null = null;

  const flushOpened = () => {
    if (currentPlayerTurn && openedInTurn.size > 0) {
      lines.push(
        JSON.stringify({
          type: 'news-opened',
          turn: { from: currentPlayerTurn.from, until: currentPlayerTurn.until },
          ids: [...openedInTurn],
        })
      );
      openedInTurn = new Set();
    }
  };

  for (const evt of history) {
    if ('date' in evt && typeof evt.date === 'string') {
      latestDate = evt.date;
    }

    switch (evt.type) {
      case 'turn-started': {
        currentTurn = { from: evt.from, until: evt.until, actor: evt.actor };
        if (evt.actor === 'player') {
          flushOpened();
          currentPlayerTurn = evt;
        }
        lines.push(JSON.stringify(evt));
        break;
      }
      case 'turn-finished': {
        if (evt.actor === 'player') {
          flushOpened();
          currentPlayerTurn = null;
        }
        currentTurn = null;
        lines.push(JSON.stringify(evt));
        break;
      }
      case 'news-published': {
        lines.push(JSON.stringify(evt as NewsPublishedEvent));
        break;
      }
      case 'story-opened': {
        if (currentPlayerTurn) {
          openedInTurn.add(evt.id);
        }
        break;
      }
      case 'story-closed':
        // ignored in prompt; still kept in history
        break;
      default:
        lines.push(JSON.stringify(evt));
    }
  }

  // If player turn open at end, flush it too.
  flushOpened();

  const dynamic = {
    latestDate,
    currentTurn,
  };

  return { timelineLines: lines, dynamic };
}
