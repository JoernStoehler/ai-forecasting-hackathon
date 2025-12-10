#!/usr/bin/env node
/**
 * CLI dispatcher (fine-grained commands only for now).
 * Commands: aggregate | prepare | call | parse
 * Convenience wrappers (e.g., turn) intentionally deferred until the base
 * pipeline is confirmed.
 */
import { parseArgs } from 'node:util';

import { runAggregate } from './commands/aggregate.js';
import { runPrepare } from './commands/prepare.js';
import { runCall } from './commands/call.js';
import { runParse } from './commands/parse.js';

const argv = parseArgs({
  options: {
    command: { type: 'string' },
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
  },
  allowPositionals: true,
});

async function main() {
  const cmd = argv.values.command || argv.positionals[0];
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
    default:
      throw new Error('Unknown or missing command. Use aggregate|prepare|call|parse.');
  }
}

if (!process.env.VITEST_WORKER_ID) {
  main().catch(err => {
    console.error(err);
    process.exit(1);
  });
}
