/**
 * Integration tests for CLI behavior: exit codes, help text, STDOUT/STDERR
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { describe, it, expect } from 'vitest';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cliPath = join(__dirname, '../dist/src/index.js');

// Helper to run CLI commands (uses built CLI)
async function runCLI(args: string[]): Promise<{ stdout: string; stderr: string; exitCode: number }> {
  try {
    const { stdout, stderr } = await execFileAsync('node', [cliPath, ...args], {
      env: { ...process.env, VITEST_WORKER_ID: undefined },
    });
    return { stdout, stderr, exitCode: 0 };
  } catch (error: any) {
    return {
      stdout: error.stdout || '',
      stderr: error.stderr || '',
      exitCode: error.code || 1,
    };
  }
}

describe('CLI exit codes', () => {
  it('exits with 0 on successful aggregate command', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-exit-'));
    const history = join(dir, 'history.jsonl');
    const state = join(dir, 'state.json');

    await writeFile(
      history,
      JSON.stringify({ type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Event', description: 'Desc' }),
      'utf-8'
    );

    const result = await runCLI(['aggregate', '--input-history', history, '--output-state', state]);
    expect(result.exitCode).toBe(0);
  });

  it('exits with 1 when required argument is missing', async () => {
    const result = await runCLI(['aggregate']); // Missing --output-state
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('aggregate requires --output-state');
  });

  it('exits with 1 when input file does not exist', async () => {
    const result = await runCLI([
      'aggregate',
      '--input-history',
      '/nonexistent/file.jsonl',
      '--output-state',
      '/tmp/state.json',
    ]);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('ENOENT');
  });

  it('exits with 1 when command is unknown', async () => {
    const result = await runCLI(['invalid-command']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('Unknown or missing command');
  });

  it('exits with 0 on successful prepare command', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-exit-prepare-'));
    const history = join(dir, 'history.jsonl');
    const prompt = join(dir, 'prompt.json');

    await writeFile(
      history,
      JSON.stringify({ type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Event', description: 'Desc' }),
      'utf-8'
    );

    const result = await runCLI(['prepare', '--input-history', history, '--output-prompt', prompt]);
    expect(result.exitCode).toBe(0);
  });

  it('exits with 1 when prepare is missing required arguments', async () => {
    const result = await runCLI(['prepare', '--input-history', '/tmp/history.jsonl']);
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain('prepare requires --input-history and --output-prompt');
  });
});

describe('CLI STDOUT/STDERR separation', () => {
  it('writes errors to STDERR, not STDOUT', async () => {
    const result = await runCLI(['aggregate']); // Missing required arg
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toBeTruthy();
    expect(result.stderr).toContain('aggregate requires');
    // STDOUT should be empty for errors
    expect(result.stdout).toBe('');
  });

  it('writes success output to STDOUT (if any)', async () => {
    const dir = await mkdtemp(join(tmpdir(), 'cli-stdout-'));
    const history = join(dir, 'history.jsonl');
    const state = join(dir, 'state.json');

    await writeFile(
      history,
      JSON.stringify({ type: 'news-published', date: '2025-01-01', icon: 'Globe', title: 'Event', description: 'Desc' }),
      'utf-8'
    );

    const result = await runCLI(['aggregate', '--input-history', history, '--output-state', state]);
    expect(result.exitCode).toBe(0);
    // Currently CLI doesn't print success messages, so STDOUT may be empty
    // This test just verifies no errors went to STDOUT
    expect(result.stdout).not.toContain('Error');
  });
});

describe('CLI help text', () => {
  it('shows help text with --help flag', async () => {
    const result = await runCLI(['--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
    expect(result.stdout).toContain('Commands:');
    expect(result.stdout).toContain('aggregate');
    expect(result.stdout).toContain('prepare');
    expect(result.stdout).toContain('call');
    expect(result.stdout).toContain('parse');
    expect(result.stdout).toContain('turn');
    expect(result.stdout).toContain('download-snapshots');
  });

  it('shows help for aggregate command', async () => {
    const result = await runCLI(['aggregate', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('aggregate');
    expect(result.stdout).toContain('--input-history');
    expect(result.stdout).toContain('--output-state');
  });

  it('shows help for prepare command', async () => {
    const result = await runCLI(['prepare', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('prepare');
    expect(result.stdout).toContain('--input-history');
    expect(result.stdout).toContain('--output-prompt');
  });

  it('shows help for call command', async () => {
    const result = await runCLI(['call', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('call');
    expect(result.stdout).toContain('--input-prompt');
    expect(result.stdout).toContain('--api-key');
  });

  it('shows help for parse command', async () => {
    const result = await runCLI(['parse', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('parse');
    expect(result.stdout).toContain('--input-json');
    expect(result.stdout).toContain('--output-events');
  });

  it('shows help for turn command', async () => {
    const result = await runCLI(['turn', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('turn');
    expect(result.stdout).toContain('--input-history');
    expect(result.stdout).toContain('--mock');
  });

  it('shows help for download-snapshots command', async () => {
    const result = await runCLI(['download-snapshots', '--help']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('download-snapshots');
    expect(result.stdout).toContain('--sources');
    expect(result.stdout).toContain('--output');
  });

  it('recognizes -h as short form for --help', async () => {
    const result = await runCLI(['-h']);
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain('Usage:');
  });
});
