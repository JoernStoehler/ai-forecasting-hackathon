import type {
  EngineEvent,
  HiddenNewsPublishedEvent,
  NewsPatchedEvent,
  NewsPublishedEvent,
  ScenarioHeadCompletedEvent,
} from '../types.js';

interface ProjectionInput {
  history: EngineEvent[];
}

/**
 * Projects the append-only event log into a prompt-friendly string:
 * - JSONL timeline including turn markers, news events, and patch/boundary markers.
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
  let cutoffInserted = false;

  let latestDate: string | null = null;
  let currentTurn: { from: string; until: string; actor: string } | null = null;

  const insertCutoffMarker = (event: ScenarioHeadCompletedEvent) => {
    if (cutoffInserted) return;
    lines.push(
      JSON.stringify({
        type: 'forecast-cutoff',
        date: event.date,
        note: 'Seed history ends here; forecast begins here (not a model knowledge cutoff).',
      })
    );
    cutoffInserted = true;
  };

  for (const evt of history) {
    if ('date' in evt && typeof evt.date === 'string') {
      latestDate = evt.date;
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
      case 'news-published': {
        lines.push(JSON.stringify(evt as NewsPublishedEvent));
        break;
      }
      case 'hidden-news-published': {
        lines.push(JSON.stringify(evt as HiddenNewsPublishedEvent));
        break;
      }
      case 'news-patched': {
        lines.push(JSON.stringify(evt as NewsPatchedEvent));
        break;
      }
      case 'scenario-head-completed': {
        const boundary = evt as ScenarioHeadCompletedEvent;
        lines.push(JSON.stringify(boundary));
        insertCutoffMarker(boundary);
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
