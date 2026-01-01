import type { EngineEvent, NewsPublishedEvent } from "../types";
import { applyNewsPatches, latestEventDate } from "@ai-forecasting/engine";

export function getScenarioHeadDate(events: EngineEvent[]): string | null {
  const candidates = events
    .filter(event => event.type === "scenario-head-completed")
    .map(event => event.date)
    .sort();
  return candidates.length ? candidates[candidates.length - 1] : null;
}

export function getVisibleTimelineEvents(events: EngineEvent[]): NewsPublishedEvent[] {
  const patched = applyNewsPatches(events);
  return patched.filter(event => event.type === "news-published");
}

export function getLatestTimelineDate(events: EngineEvent[]): string {
  return latestEventDate(events) ?? new Date().toISOString().split("T")[0];
}
