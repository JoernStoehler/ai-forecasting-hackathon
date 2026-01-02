import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  aggregate,
  nextDateAfter,
  sortAndDedupEvents,
  type Command,
  type EngineEvent,
} from '@ai-forecasting/engine';
import { readEngineEvents, writeEventsJsonl } from './eventIo.js';
import { runAggregate } from './aggregate.js';
import { runPrepare } from './prepare.js';
import { runCall } from './call.js';
import { runParse } from './parse.js';

export async function runTurn(opts: {
  inputHistory?: string;
  newEvents: string;
  outputState: string;
  outputHistory: string;
  outputPrompt: string;
  outputResponse: string;
  outputEvents: string;
  materials?: string;
  model: string;
  systemPrompt: string;
  apiKey?: string;
  mock?: boolean;
}) {
  const history = opts.inputHistory ? await readEngineEvents(opts.inputHistory, 'input-history') : [];
  const playerEvents = await readEngineEvents(opts.newEvents, 'new-events');
  if (!playerEvents.length) {
    throw new Error('turn requires --new-events with at least one event.');
  }

  const playerTurnFrom = pickTurnStartDate(playerEvents);
  const playerTurnStart: EngineEvent = {
    type: 'turn-started',
    actor: 'player',
    from: playerTurnFrom,
    until: playerTurnFrom,
  };
  const historyAfterPlayerEvent = sortAndDedupEvents([...history, playerTurnStart, ...playerEvents]);
  const playerTurnUntil = aggregate(historyAfterPlayerEvent).latestDate ?? playerTurnFrom;
  const playerTurnFinished: EngineEvent = {
    type: 'turn-finished',
    actor: 'player',
    from: playerTurnFrom,
    until: playerTurnUntil,
  };
  const gmTurnStart: EngineEvent = {
    type: 'turn-started',
    actor: 'game_master',
    from: playerTurnUntil,
    until: playerTurnUntil,
  };

  const tempDir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
  const preForecastEventsPath = join(tempDir, 'turn-pre-forecast.jsonl');
  const historyBeforeForecastPath = join(tempDir, 'history-before-forecast.jsonl');
  const stateBeforeForecastPath = join(tempDir, 'state-before-forecast.json');
  const postForecastEventsPath = join(tempDir, 'turn-post-forecast.jsonl');

  await writeEventsJsonl(preForecastEventsPath, [
    playerTurnStart,
    ...playerEvents,
    playerTurnFinished,
    gmTurnStart,
  ]);

  await runAggregate({
    inputHistory: opts.inputHistory,
    newEvents: preForecastEventsPath,
    outputState: stateBeforeForecastPath,
    outputHistory: historyBeforeForecastPath,
  });

  await runPrepare({
    inputState: stateBeforeForecastPath,
    inputHistory: historyBeforeForecastPath,
    materials: opts.materials,
    model: opts.model,
    systemPrompt: opts.systemPrompt,
    outputPrompt: opts.outputPrompt,
  });

  if (opts.mock) {
    const mockDate = nextDateAfter(
      sortAndDedupEvents([...historyAfterPlayerEvent, playerTurnFinished, gmTurnStart])
    );
    await writeMockResponse(opts.outputResponse, mockDate);
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

  const historyForForecast = await readEngineEvents(historyBeforeForecastPath, 'history-before-forecast');
  const forecastEvents = await readEngineEvents(opts.outputEvents, 'output-events');
  const historyWithForecast = sortAndDedupEvents([...historyForForecast, ...forecastEvents]);
  const gmTurnUntil = aggregate(historyWithForecast).latestDate ?? gmTurnStart.from;
  const gmTurnFinished: EngineEvent = {
    type: 'turn-finished',
    actor: 'game_master',
    from: gmTurnStart.from,
    until: gmTurnUntil,
  };

  await writeEventsJsonl(postForecastEventsPath, [...forecastEvents, gmTurnFinished]);

  await runAggregate({
    inputHistory: historyBeforeForecastPath,
    newEvents: postForecastEventsPath,
    outputState: opts.outputState,
    outputHistory: opts.outputHistory,
  });
}

function pickTurnStartDate(events: EngineEvent[]): string {
  const dates = events
    .map(eventDate)
    .filter((value): value is string => typeof value === 'string')
    .sort();
  if (!dates.length) {
    throw new Error('turn: unable to infer a start date from --new-events.');
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
  const commands: Command[] = [
    {
      type: 'publish-news',
      date,
      icon: 'Landmark',
      title: 'Mock forecast',
      description: 'Mock forecast description.',
    },
  ];
  await writeFile(path, JSON.stringify(commands, null, 2), 'utf-8');
}
