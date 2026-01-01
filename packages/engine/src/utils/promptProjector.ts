import type { EngineEvent } from '../types.js';

interface ProjectionInput {
  history: EngineEvent[];
}

/**
 * Projects the append-only event log into a prompt-friendly string:
 * - JSONL timeline including turn markers and scenario events.
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

  let latestDate: string | null = null;
  let currentTurn: { from: string; until: string; actor: string } | null = null;

  for (const evt of history) {
    const eventDate = extractEventDate(evt);
    if (eventDate) {
      latestDate = eventDate;
    }

    switch (evt.type) {
      case 'turn-started': {
        currentTurn = { from: evt.from, until: evt.until, actor: evt.actor };
        lines.push(JSON.stringify(evt));
        break;
      }
      case 'turn-finished': {
        currentTurn = null;
        lines.push(JSON.stringify(evt));
        break;
      }
      default:
        lines.push(JSON.stringify(evt));
    }
  }

  const dynamic = {
    latestDate,
    currentTurn,
  };

  return { timelineLines: lines, dynamic };
}

function extractEventDate(event: EngineEvent): string | null {
  if ('date' in event && typeof event.date === 'string') return event.date;
  if (event.type === 'turn-started' || event.type === 'turn-finished') return event.from;
  return null;
}
