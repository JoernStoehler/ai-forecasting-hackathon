import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
  aggregate,
  nextDateAfter,
  sortAndDedupEvents,
  type EngineEvent,
} from '@ai-forecasting/engine';
import { readEngineEvents, writeEventsJsonl } from './eventIo.js';
import { runAggregate } from './aggregate.js';
import { runPrepare } from './prepare.js';
import { runCall } from './call.js';
import { runParse } from './parse.js';

const today = () => new Date().toISOString().split('T')[0];

export async function runTurn(opts: {
  inputHistory: string;
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
  const history = await readEngineEvents(opts.inputHistory, 'input-history');
  const playerEvents = await readEngineEvents(opts.newEvents, 'new-events');
  const baseSummary = aggregate(history);
  const playerFallbackDate = aggregate(playerEvents).latestDate ?? today();
  const playerTurnStartDate = baseSummary.latestDate ?? playerFallbackDate;
  const playerTurnStarted: EngineEvent = {
    type: 'turn-started',
    actor: 'player',
    from: playerTurnStartDate,
    until: playerTurnStartDate,
  };
  const historyAfterPlayerBase = sortAndDedupEvents([
    ...history,
    playerTurnStarted,
    ...playerEvents,
  ]);
  const playerTurnUntil =
    aggregate(historyAfterPlayerBase).latestDate ?? playerTurnStartDate;
  const playerTurnFinished: EngineEvent = {
    type: 'turn-finished',
    actor: 'player',
    from: playerTurnStartDate,
    until: playerTurnUntil,
  };
  const playerAdditions = [
    playerTurnStarted,
    ...playerEvents,
    playerTurnFinished,
  ];

  const tmpDir = await mkdtemp(join(tmpdir(), 'cli-turn-'));
  const playerAdditionsPath = join(tmpDir, 'player-additions.jsonl');
  const playerStatePath = join(tmpDir, 'player-state.json');
  const playerHistoryPath = join(tmpDir, 'player-history.jsonl');
  const gmHistoryPath = join(tmpDir, 'gm-history.jsonl');
  const gmAdditionsPath = join(tmpDir, 'gm-additions.jsonl');

  await writeEventsJsonl(playerAdditionsPath, playerAdditions);
  await runAggregate({
    inputHistory: opts.inputHistory,
    newEvents: playerAdditionsPath,
    outputState: playerStatePath,
    outputHistory: playerHistoryPath,
  });

  const playerHistory = await readEngineEvents(playerHistoryPath, 'player-history');
  const gmTurnStartDate = aggregate(playerHistory).latestDate ?? playerTurnUntil;
  const gmTurnStarted: EngineEvent = {
    type: 'turn-started',
    actor: 'game_master',
    from: gmTurnStartDate,
    until: gmTurnStartDate,
  };
  const historyWithGmStart = sortAndDedupEvents([
    ...playerHistory,
    gmTurnStarted,
  ]);
  await writeEventsJsonl(gmHistoryPath, historyWithGmStart);

  await runPrepare({
    inputState: '',
    inputHistory: gmHistoryPath,
    materials: opts.materials,
    model: opts.model,
    systemPrompt: opts.systemPrompt,
    outputPrompt: opts.outputPrompt,
  });

  if (opts.mock) {
    const mockDate = nextDateAfter(historyWithGmStart);
    const commands = [
      {
        type: 'publish-news',
        date: mockDate,
        icon: 'BrainCircuit',
        title: 'MOCK forecast event',
        description: 'Placeholder forecast from CLI mock mode.',
      },
    ];
    await writeFile(
      opts.outputResponse,
      JSON.stringify({ response: { text: JSON.stringify(commands) }, chunks: [] }, null, 2),
      'utf-8'
    );
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
  const historyWithForecast = sortAndDedupEvents([
    ...historyWithGmStart,
    ...forecastEvents,
  ]);
  const gmTurnUntil = aggregate(historyWithForecast).latestDate ?? gmTurnStartDate;
  const gmTurnFinished: EngineEvent = {
    type: 'turn-finished',
    actor: 'game_master',
    from: gmTurnStartDate,
    until: gmTurnUntil,
  };
  await writeEventsJsonl(gmAdditionsPath, [...forecastEvents, gmTurnFinished]);

  await runAggregate({
    inputHistory: gmHistoryPath,
    newEvents: gmAdditionsPath,
    outputState: opts.outputState,
    outputHistory: opts.outputHistory,
  });
}
