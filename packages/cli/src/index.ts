#!/usr/bin/env node
/**
 * CLI dispatcher.
 * Commands: aggregate | prepare | call | parse | turn | download-snapshots
 */
import { parseArgs } from 'node:util';

import { runAggregate } from './commands/aggregate.js';
import { runPrepare } from './commands/prepare.js';
import { runCall } from './commands/call.js';
import { runParse } from './commands/parse.js';
import { runDownloadSnapshots } from './commands/downloadSnapshots.js';
import { runTurn } from './commands/turn.js';

const argv = parseArgs({
  options: {
    command: { type: 'string' },
    help: { type: 'boolean', short: 'h' },
    // aggregate
    'input-history': { type: 'string' },
    'input-state': { type: 'string' },
    'new-events': { type: 'string' },
    'output-state': { type: 'string' },
    'output-history': { type: 'string' },
    // prepare
    'materials': { type: 'string' },
    'model': { type: 'string' },
    'system-prompt': { type: 'string' },
    'output-prompt': { type: 'string' },
    // call
    'input-prompt': { type: 'string' },
    'output-response': { type: 'string' },
    'api-key': { type: 'string' },
    // parse
    'input-json': { type: 'string' },
    'output-events': { type: 'string' },
    // turn
    mock: { type: 'boolean' },
    // download-snapshots
    'sources': { type: 'string' },
    'output': { type: 'string' },
    'force': { type: 'boolean' },
  },
  allowPositionals: true,
});

function showHelp(command?: string) {
  if (command === 'aggregate') {
    console.log(`Usage: takeoff aggregate [options]

Aggregate events from history and new events into a state file.

Options:
  --input-history <file>   Input history JSONL file (optional)
  --input-state <file>     Input state JSON file (optional)
  --new-events <file>      New events JSONL file to merge (optional)
  --output-state <file>    Output state JSON file (required)
  --output-history <file>  Output history JSONL file (optional)`);
  } else if (command === 'prepare') {
    console.log(`Usage: takeoff prepare [options]

Prepare a prompt from event history for the forecaster.

Options:
  --input-history <file>   Input history JSONL file (required)
  --input-state <file>     Input state JSON file (optional)
  --output-prompt <file>   Output prompt JSON file (required)
  --materials <selection>  Material selection: 'all', 'none' (optional)
  --model <name>           Model name (default: gemini-2.5-flash)
  --system-prompt <text>   Custom system prompt (optional)`);
  } else if (command === 'call') {
    console.log(`Usage: takeoff call [options]

Call the Gemini API with a prepared prompt.

Options:
  --input-prompt <file>    Input prompt JSON file (required)
  --output-response <file> Output response JSON file (required)
  --api-key <key>          Gemini API key (or use GEMINI_API_KEY env var)`);
  } else if (command === 'parse') {
    console.log(`Usage: takeoff parse [options]

Parse Gemini API response into events JSONL.

Options:
  --input-json <file>      Input response JSON file (required)
  --output-events <file>   Output events JSONL file (required)`);
  } else if (command === 'turn') {
    console.log(`Usage: takeoff turn [options]

Execute a full game master turn: prepare → call → parse → aggregate.

Options:
  --input-history <file>   Input history JSONL file (required)
  --new-events <file>      New player events JSONL file (required)
  --output-state <file>    Output state JSON file (required)
  --output-history <file>  Output history JSONL file (required)
  --output-prompt <file>   Output prompt JSON file (required)
  --output-response <file> Output response JSON file (required)
  --output-events <file>   Output events JSONL file (required)
  --materials <selection>  Material selection: 'all', 'none' (optional)
  --model <name>           Model name (default: gemini-2.5-flash)
  --system-prompt <text>   Custom system prompt (optional)
  --api-key <key>          Gemini API key (or use GEMINI_API_KEY env var)
  --mock                   Use mock forecaster instead of real API`);
  } else if (command === 'download-snapshots') {
    console.log(`Usage: takeoff download-snapshots [options]

Download HTML snapshots from URLs listed in sources file.

Options:
  --sources <file>         Input sources JSONL file (required)
  --output <directory>     Output directory for snapshots (required)
  --force                  Overwrite existing snapshots (optional)`);
  } else {
    console.log(`Usage: takeoff <command> [options]

AI Forecasting CLI - Policy simulation game engine

Commands:
  aggregate              Merge events and generate state
  prepare                Generate forecaster prompt from history
  call                   Call Gemini API with prompt
  parse                  Parse API response into events
  turn                   Execute full GM turn (prepare + call + parse + aggregate)
  download-snapshots     Download HTML snapshots from URLs

Options:
  --help, -h             Show this help message

Use 'takeoff <command> --help' for command-specific help.

Examples:
  takeoff aggregate --input-history history.jsonl --output-state state.json
  takeoff turn --input-history history.jsonl --new-events player.jsonl \\
    --output-state state.json --output-history history-out.jsonl \\
    --output-prompt prompt.json --output-response response.json \\
    --output-events events.jsonl --mock`);
  }
}

async function main() {
  const cmd = argv.values.command || argv.positionals[0];

  // Handle help flag
  if (argv.values.help) {
    showHelp(cmd);
    process.exit(0);
  }

  switch (cmd) {
    case 'aggregate': {
      const outputState = argv.values['output-state'];
      if (!outputState) throw new Error('aggregate requires --output-state');
      await runAggregate({
        inputState: argv.values['input-state'],
        inputHistory: argv.values['input-history'],
        newEvents: argv.values['new-events'],
        outputState,
        outputHistory: argv.values['output-history'],
      });
      break;
    }
    case 'prepare': {
      if (!argv.values['input-history'] || !argv.values['output-prompt']) {
        throw new Error('prepare requires --input-history and --output-prompt');
      }
      await runPrepare({
        inputState: argv.values['input-state'] || '',
        inputHistory: argv.values['input-history'],
        materials: argv.values['materials'],
        model: argv.values['model'] || 'gemini-2.5-flash',
        systemPrompt: argv.values['system-prompt'] || '',
        outputPrompt: argv.values['output-prompt'],
      });
      break;
    }
    case 'call': {
      if (!argv.values['input-prompt'] || !argv.values['output-response']) {
        throw new Error('call requires --input-prompt and --output-response');
      }
      await runCall({
        inputPrompt: argv.values['input-prompt'],
        outputResponse: argv.values['output-response'],
        apiKey: argv.values['api-key'] || process.env.GEMINI_API_KEY,
      });
      break;
    }
    case 'parse': {
      if (!argv.values['input-json'] || !argv.values['output-events']) {
        throw new Error('parse requires --input-json and --output-events');
      }
      await runParse({
        inputJson: argv.values['input-json'],
        outputEvents: argv.values['output-events'],
      });
      break;
    }
    case 'download-snapshots': {
      if (!argv.values['sources'] || !argv.values['output']) {
        throw new Error('download-snapshots requires --sources and --output');
      }
      await runDownloadSnapshots({
        sources: argv.values['sources'],
        output: argv.values['output'],
        force: argv.values['force'] || false,
      });
      break;
    }
    case 'turn': {
      const inputHistory = argv.values['input-history'];
      const newEvents = argv.values['new-events'];
      const outputState = argv.values['output-state'];
      const outputHistory = argv.values['output-history'];
      const outputPrompt = argv.values['output-prompt'];
      const outputResponse = argv.values['output-response'];
      const outputEvents = argv.values['output-events'];
      if (!inputHistory || !newEvents || !outputState || !outputHistory) {
        throw new Error('turn requires --input-history, --new-events, --output-state, --output-history');
      }
      if (!outputPrompt || !outputResponse || !outputEvents) {
        throw new Error('turn requires --output-prompt, --output-response, --output-events');
      }
      await runTurn({
        inputHistory,
        newEvents,
        outputState,
        outputHistory,
        outputPrompt,
        outputResponse,
        outputEvents,
        materials: argv.values['materials'],
        model: argv.values['model'] || 'gemini-2.5-flash',
        systemPrompt: argv.values['system-prompt'] || '',
        apiKey: argv.values['api-key'] || process.env.GEMINI_API_KEY,
        mock: argv.values['mock'] || false,
      });
      break;
    }
    default:
      throw new Error(
        'Unknown or missing command. Use aggregate|prepare|call|parse|turn|download-snapshots.'
      );
  }
}

if (!process.env.VITEST_WORKER_ID) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
