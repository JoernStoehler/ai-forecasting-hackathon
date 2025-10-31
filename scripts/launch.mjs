#!/usr/bin/env node
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

function parseArgs(argv) {
  const out = { log: null, pid: null, cwd: process.cwd(), cmd: null }
  const args = [...argv]
  while (args.length) {
    const a = args.shift()
    if (a === '--') { out.cmd = args.join(' '); break }
    if (a === '--log') { out.log = args.shift(); continue }
    if (a === '--pid') { out.pid = args.shift(); continue }
    if (a === '--cwd') { out.cwd = args.shift(); continue }
  }
  if (!out.log || !out.pid || !out.cmd) {
    console.error('Usage: launch.mjs --log <file> --pid <file> [--cwd <dir>] -- <shell command>')
    process.exit(2)
  }
  return out
}

const opts = parseArgs(process.argv.slice(2))
fs.mkdirSync(path.dirname(opts.log), { recursive: true })
fs.mkdirSync(path.dirname(opts.pid), { recursive: true })

const logFd = fs.openSync(opts.log, 'a')
const child = spawn('/bin/bash', ['-lc', opts.cmd], {
  cwd: opts.cwd,
  detached: true,
  stdio: ['ignore', logFd, logFd],
})

fs.writeFileSync(opts.pid, String(child.pid))
child.unref()

// Close our references; child keeps its own
try { fs.closeSync(logFd) } catch {}

// Exit immediately so the calling shell returns without waiting
process.exit(0)

