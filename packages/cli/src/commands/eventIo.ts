import { readFile, writeFile } from 'node:fs/promises';
import {
  EngineEventSchema,
  ScenarioEventSchema,
  sortAndDedupEvents,
  type EngineEvent,
} from '@ai-forecasting/engine';

type Issue = { path: Array<string | number>; message: string };

export async function readEngineEvents(path: string, label: string): Promise<EngineEvent[]> {
  const text = await readFile(path, 'utf-8');
  const lines = text.split(/\r?\n/).filter(Boolean);
  const events: EngineEvent[] = lines.map((line, index) => {
    const lineNumber = index + 1;
    let payload: unknown;
    try {
      payload = JSON.parse(line);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      throw new Error(`${label}: invalid JSON on line ${lineNumber}: ${message}`);
    }
    return parseEvent(payload, label, lineNumber);
  });
  return sortAndDedupEvents(events);
}

export async function writeEventsJsonl(path: string, events: EngineEvent[]) {
  const lines = events.map(evt => JSON.stringify(evt)).join('\n');
  await writeFile(path, lines, 'utf-8');
}

export function formatZodIssues(issues: Issue[]): string {
  if (!issues.length) return 'Unknown schema error.';
  return issues
    .map(issue => {
      const loc = issue.path.length ? issue.path.join('.') : '(root)';
      return `- ${loc}: ${issue.message}`;
    })
    .join('\n');
}

function parseEvent(payload: unknown, label: string, lineNumber: number): EngineEvent {
  if (payload && typeof payload === 'object' && typeof (payload as { type?: unknown }).type === 'string') {
    const raw = payload as Record<string, unknown>;
    const result = EngineEventSchema.safeParse(raw);
    if (result.success) return result.data;
    throw new Error(
      `${label}: invalid engine event on line ${lineNumber}.\n${formatZodIssues(result.error.issues)}`
    );
  }

  const scenario = ScenarioEventSchema.safeParse(payload);
  if (scenario.success) return scenario.data as EngineEvent;
  throw new Error(
    `${label}: invalid scenario event on line ${lineNumber}.\n${formatZodIssues(scenario.error.issues)}`
  );
}
