import type {
  EngineEvent,
  NewsPublishedEvent,
  HiddenNewsPublishedEvent,
} from "../types.js";
import { applyNewsPatches, sortAndDedupEvents } from "./events.js";

interface ProjectionInput {
  history: EngineEvent[];
  seedHistoryEndDate?: string;
}

/**
 * Projects the append-only event log into a prompt-friendly string:
 * - JSONL timeline including turn markers and news events (patched).
 * - A small dynamic block with latest date and current turn window.
 */
export function projectPrompt(input: ProjectionInput): string {
  const { timelineLines, dynamic } = buildTimeline(input.history, input.seedHistoryEndDate);
  return ["# TIMELINE (JSONL)", ...timelineLines, "# DYNAMIC", JSON.stringify(dynamic, null, 2)].join(
    "\n"
  );
}

function buildTimeline(history: EngineEvent[], seedHistoryEndDate?: string) {
  const lines: string[] = [];
  let cutoffInserted = false;

  let latestDate: string | null = null;
  let currentTurn: { from: string; until: string; actor: string } | null = null;

  const insertCutoffMarker = () => {
    if (!seedHistoryEndDate || cutoffInserted) return;
    lines.push(
      JSON.stringify({
        type: "forecast-cutoff",
        date: seedHistoryEndDate,
        note: "Seed history ends here; forecast begins here (not a model knowledge cutoff).",
      })
    );
    cutoffInserted = true;
  };

  const patchedNews = applyNewsPatches(history);
  const otherEvents = history.filter(
    event =>
      event.type === "turn-started" ||
      event.type === "turn-finished" ||
      event.type === "scenario-head-completed" ||
      event.type === "game-over"
  );

  const ordered = sortAndDedupEvents([...(patchedNews as EngineEvent[]), ...otherEvents]);

  for (const evt of ordered) {
    if ("date" in evt && typeof evt.date === "string") {
      latestDate = evt.date;
    }

    const boundaryDate =
      "date" in evt && typeof evt.date === "string"
        ? evt.date
        : evt.type === "turn-started" || evt.type === "turn-finished"
          ? evt.from
          : null;

    if (seedHistoryEndDate && boundaryDate && boundaryDate > seedHistoryEndDate && !cutoffInserted) {
      insertCutoffMarker();
    }

    switch (evt.type) {
      case "turn-started": {
        currentTurn = { from: evt.from, until: evt.until, actor: evt.actor };
        lines.push(JSON.stringify(evt));
        break;
      }
      case "turn-finished": {
        currentTurn = null;
        lines.push(JSON.stringify(evt));
        break;
      }
      case "news-published":
      case "hidden-news-published": {
        lines.push(JSON.stringify(evt as NewsPublishedEvent | HiddenNewsPublishedEvent));
        break;
      }
      case "scenario-head-completed":
      case "game-over": {
        lines.push(JSON.stringify(evt));
        break;
      }
      default:
        lines.push(JSON.stringify(evt));
    }
  }

  if (seedHistoryEndDate && !cutoffInserted) {
    insertCutoffMarker();
  }

  const dynamic = {
    latestDate,
    currentTurn,
  };

  return { timelineLines: lines, dynamic };
}
