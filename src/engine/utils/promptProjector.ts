import type { EngineEvent } from '../types.js';
import { generateNewsId } from './strings.js';

interface ProjectionInput {
  history: EngineEvent[];
}

interface TurnWindow {
  from: string;
  until: string;
  actor: string;
}

interface PlayerAttention {
  viewedFirstTime: string[];
  notViewed: string[];
}

/**
 * Projects the append-only event log into a prompt-friendly string:
 * - Enhanced JSONL timeline with isHidden marking for hidden news
 * - Aggregated player attention metrics (not raw telemetry events)
 * - Current state with latest date and turn window
 */
export function projectPrompt(input: ProjectionInput): string {
  const { timelineLines, playerAttention, dynamic } = buildProjection(input.history);

  const sections = [
    '# TIMELINE (JSONL)',
    ...timelineLines,
  ];

  // Add player attention summary if we're in an active turn
  if (playerAttention) {
    sections.push('# PLAYER ATTENTION');
    sections.push(JSON.stringify(playerAttention));
  }

  sections.push('# CURRENT STATE');
  sections.push(JSON.stringify(dynamic, null, 2));

  return sections.join('\n');
}

function buildProjection(history: EngineEvent[]) {
  const lines: string[] = [];
  const newsItems = new Map<string, boolean>(); // id -> isHidden
  const viewedIdsEver = new Set<string>();
  const viewedIdsThisTurn = new Set<string>();

  let latestDate: string | null = null;
  let currentTurn: TurnWindow | null = null;
  let currentTurnStartIndex = -1;

  // First pass: collect all news items and track telemetry
  for (let i = 0; i < history.length; i++) {
    const evt = history[i];
    const eventDate = extractEventDate(evt);
    if (eventDate) {
      latestDate = eventDate;
    }

    switch (evt.type) {
      case 'turn-started': {
        currentTurn = { from: evt.from, until: evt.until, actor: evt.actor };
        currentTurnStartIndex = i;
        viewedIdsThisTurn.clear();
        break;
      }
      case 'turn-finished': {
        currentTurn = null;
        break;
      }
      case 'news-published': {
        const id = evt.id ?? generateNewsId('news', evt.date, evt.title);
        newsItems.set(id, false); // not hidden
        break;
      }
      case 'hidden-news-published': {
        const id = evt.id ?? generateNewsId('hidden-news', evt.date, evt.title);
        newsItems.set(id, true); // hidden
        break;
      }
      case 'news-opened': {
        const isFirstTimeEver = !viewedIdsEver.has(evt.targetId);
        viewedIdsEver.add(evt.targetId);

        // Track first-time views during current turn
        if (i > currentTurnStartIndex && isFirstTimeEver) {
          viewedIdsThisTurn.add(evt.targetId);
        }
        break;
      }
      // news-closed events don't affect our aggregation
    }
  }

  // Second pass: build timeline with enhanced news events (excluding raw telemetry)
  for (const evt of history) {
    switch (evt.type) {
      case 'news-published': {
        const id = evt.id ?? generateNewsId('news', evt.date, evt.title);
        lines.push(JSON.stringify({
          date: evt.date,
          icon: evt.icon,
          title: evt.title,
          description: evt.description,
          id,
          isHidden: false,
        }));
        break;
      }
      case 'hidden-news-published': {
        const id = evt.id ?? generateNewsId('hidden-news', evt.date, evt.title);
        lines.push(JSON.stringify({
          date: evt.date,
          icon: evt.icon,
          title: evt.title,
          description: evt.description,
          id,
          isHidden: true,
        }));
        break;
      }
      case 'turn-started':
      case 'turn-finished':
      case 'game-over':
      case 'scenario-head-completed':
      case 'news-patched': {
        // Pass through structural events as-is
        lines.push(JSON.stringify(evt));
        break;
      }
      case 'dice-rolled': {
        // Include dice rolls in timeline for GM to reference
        lines.push(JSON.stringify({
          roll: evt.roll,
          label: evt.label,
          at: evt.at,
        }));
        break;
      }
      // Filter out raw telemetry - we aggregate it instead
      case 'news-opened':
      case 'news-closed':
        break;
    }
  }

  // Build player attention summary
  const allNewsIds = Array.from(newsItems.keys());
  const notViewedIds = allNewsIds.filter(id => !viewedIdsEver.has(id));

  const playerAttention: PlayerAttention | null = currentTurn ? {
    viewedFirstTime: Array.from(viewedIdsThisTurn),
    notViewed: notViewedIds,
  } : null;

  const dynamic = {
    latestDate,
    currentTurn,
  };

  return { timelineLines: lines, playerAttention, dynamic };
}

function extractEventDate(event: EngineEvent): string | null {
  if ('date' in event && typeof event.date === 'string') return event.date;
  if (event.type === 'turn-started') return event.from;
  if (event.type === 'turn-finished') return event.until;
  return null;
}
