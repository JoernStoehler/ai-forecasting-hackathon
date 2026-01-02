import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { aggregate, sortAndDedupEvents, type EngineEvent } from '@ai-forecasting/engine';
import { readEngineEvents, writeEventsJsonl } from './eventIo.js';
import { runAggregate } from './aggregate.js';
import { runPrepare } from './prepare.js';
import { runCall } from './call.js';
import { runParse } from './parse.js';

export async function runTurn(opts: {
  inputHistory: string;
  inputState?: string;
  newEvents: string;
  outputHistory: string;
  outputState: string;
  outputPrompt: string;
  outputResponse: string;
  outputEvents: string;
  materials?: string;
  model: string;
  systemPrompt: string;
  apiKey?: string;
  mock?: boolean;
}) {
  const history = await readEngineEvents(opts.inputHistory, 'input-history');
  const playerEvents = await readEngineEvents(opts.newEvents, 'new-events');
  if (playerEvents.length === 0) {
    throw new Error('turn: --new-events is empty; expected at least one EngineEvent.');
  }

  const playerFrom = earliestDate(playerEvents);
  const playerUntil = aggregate([...history, ...playerEvents]).latestDate ?? playerFrom;
  const playerTurnStarted: EngineEvent = {
    type: 'turn-started',
    actor: 'player',
    from: playerFrom,
    until: playerFrom,
  };
  const playerTurnFinished: EngineEvent = {
    type: 'turn-finished',
    actor: 'player',
    from: playerFrom,
    until: playerUntil,
  };
  const historyWithPlayerTurn = sortAndDedupEvents([
    ...history,
    playerTurnStarted,
    ...playerEvents,
    playerTurnFinished,
  ]);
  const gmStartFrom = aggregate(historyWithPlayerTurn).latestDate ?? playerUntil;
  const gmTurnStarted: EngineEvent = {
    type: 'turn-started',
    actor: 'game_master',
    from: gmStartFrom,
    until: gmStartFrom,
  };
  const historyForPrompt = sortAndDedupEvents([...historyWithPlayerTurn, gmTurnStarted]);

  const workDir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
  const preHistoryPath = join(workDir, 'history-pre.jsonl');
  const preStatePath = join(workDir, 'state-pre.json');
  const finalHistoryPath = join(workDir, 'history-final.jsonl');

  try {
    await writeEventsJsonl(preHistoryPath, historyForPrompt);
    await runAggregate({
      inputHistory: preHistoryPath,
      outputState: preStatePath,
    });
    await runPrepare({
      inputState: opts.inputState ?? '',
      inputHistory: preHistoryPath,
      materials: opts.materials,
      model: opts.model,
      systemPrompt: opts.systemPrompt,
      outputPrompt: opts.outputPrompt,
    });
    if (opts.mock) {
      await writeMockResponse(opts.outputResponse, gmStartFrom);
    } else {
      await runCall({
        inputPrompt: opts.outputPrompt,
        outputResponse: opts.outputResponse,
        apiKey: opts.apiKey,
      });
    }
    await runParse({
      inputJson: opts.outputResponse,
      outputEvents: opts.outputEvents,
    });
    const forecastEvents = await readEngineEvents(opts.outputEvents, 'output-events');
    const historyWithForecast = sortAndDedupEvents([...historyForPrompt, ...forecastEvents]);
    const gmUntil = aggregate(historyWithForecast).latestDate ?? gmStartFrom;
    const gmTurnFinished: EngineEvent = {
      type: 'turn-finished',
      actor: 'game_master',
      from: gmStartFrom,
      until: gmUntil,
    };
    const finalHistory = sortAndDedupEvents([...historyWithForecast, gmTurnFinished]);
    await writeEventsJsonl(finalHistoryPath, finalHistory);
    await runAggregate({
      inputHistory: finalHistoryPath,
      outputState: opts.outputState,
      outputHistory: opts.outputHistory,
    });
  } finally {
    await rm(workDir, { recursive: true, force: true });
  }
}

function earliestDate(events: EngineEvent[]): string {
  const dates = events
    .map(eventDate)
    .filter((value): value is string => Boolean(value))
    .sort();
  if (!dates.length) {
    throw new Error('turn: new events must include at least one dated event.');
  }
  return dates[0];
}

function eventDate(event: EngineEvent): string | null {
  if ('date' in event && typeof event.date === 'string') return event.date;
  if (event.type === 'turn-started') return event.from;
  if (event.type === 'turn-finished') return event.until;
  return null;
}

async function writeMockResponse(path: string, date: string) {
  const commands = [
    {
      type: 'publish-news',
      date,
      icon: 'Landmark',
      title: 'Mock forecast',
      description: 'Deterministic mock forecast event.',
    },
  ];
  await writeFile(path, JSON.stringify({ response: { text: JSON.stringify(commands) } }, null, 2), 'utf-8');
}
